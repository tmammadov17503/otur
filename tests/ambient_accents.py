"""Check that decorative dining accents load without blocking content or mobile input."""

import json
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def audit(browser, url, width):
    context = browser.new_context(viewport={"width": width, "height": 900}, is_mobile=width < 761, has_touch=width < 761)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(url, wait_until="networkidle")
    assert page.locator("#discover .ambient-object").count() == 2, "Discovery needs its two decorative accents"
    assert page.locator("#partners .ambient-object").count() == 1, "Partner section needs its dining vignette"
    for section in ["#discover", "#restaurant", "#partners"]:
        pattern = page.locator(f"{section} > .dining-scatter")
        expect(pattern).to_have_attribute("aria-hidden", "true")
        expect(pattern).to_have_css("pointer-events", "none")
        assert pattern.locator(".dining-motif").count() >= 6
        assert pattern.locator(".motif-fork").count() >= 1
        assert pattern.locator(".motif-knife").count() >= 1
    for section in ["#discover", "#partners"]:
        page.locator(section).scroll_into_view_if_needed()
        for accent in page.locator(f"{section} .ambient-object").all():
            expect(accent).to_have_attribute("aria-hidden", "true")
            expect(accent).to_have_css("pointer-events", "none")
            expect(accent).to_have_css("z-index", "-1")
            image = accent.locator("img")
            expect(image).to_have_attribute("alt", "")
            image.evaluate("el => el.decode()")
            assert image.evaluate("el => el.naturalWidth > 0")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), "Decorative overflow must not widen the page"
        page.screenshot(path=f"work/ambient/{browser.browser_type.name}-{width}-{section[1:]}.png")
    page.locator(".save-restaurant").first.click()
    expect(page.locator(".save-restaurant").first).to_have_attribute("aria-pressed", "true")
    page.locator(".partner-copy > button").click()
    expect(page.get_by_role("dialog")).to_be_visible()
    page.keyboard.press("Escape")
    page.emulate_media(reduced_motion="reduce")
    for image in page.locator(".ambient-object img").all():
        expect(image).to_have_css("animation-name", "none")
    for icon in page.locator(".dining-motif svg").all():
        expect(icon).to_have_css("animation-name", "none")
    assert not errors, errors
    context.close()
    return {"browser": browser.browser_type.name, "width": width, "passed": True}


def main():
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000/"
    Path("work/ambient").mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as playwright:
        for engine in [playwright.chromium, playwright.webkit]:
            browser = engine.launch(headless=True)
            for width in [390, 1366]:
                results.append(audit(browser, url, width))
            browser.close()
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
