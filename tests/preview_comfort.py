"""Exercise readable controls, full-resolution interiors and the partner form."""

import json
import sys
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def audit(browser, url, width):
    context = browser.new_context(viewport={"width": width, "height": 900},
                                  is_mobile=width < 761, has_touch=width < 761)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(url, wait_until="networkidle")
    for selector in [".restaurant-card p", ".search-rail input", ".search-input input"]:
        assert page.locator(selector).first.evaluate(
            "el => parseFloat(getComputedStyle(el).fontSize) >= 16"), selector
    for selector in [".guest-control button", ".availability-preview button", ".quick-filters button"]:
        assert page.locator(selector).first.bounding_box()["height"] >= 44, selector
    page.locator("#discover").scroll_into_view_if_needed()
    page.screenshot(path=f"work/comfort/{browser.browser_type.name}-{width}-cards.png")
    for index in range(3):
        page.locator(".view-restaurant").nth(index).click()
        page.locator(".see-table-button").click()
        expect(page.locator(".table-focus")).to_be_visible()
        page.locator(".view-from-seat").click()
        photo = page.locator(".preview-photo img")
        expect(photo).to_be_visible()
        photo.evaluate("el => el.decode()")
        assert photo.evaluate("el => el.naturalWidth >= 1500"), "Full-frame image required"
        motion = page.locator(".preview-photo video")
        expect(motion).to_be_visible()
        motion.evaluate("el => new Promise((resolve, reject) => { if (el.readyState >= 2) return resolve(); el.addEventListener('loadeddata', resolve, { once: true }); el.addEventListener('error', reject, { once: true }); })")
        assert motion.evaluate("el => el.videoWidth >= 1200 && el.duration >= 5"), "Web-ready interior motion required"
        motion_toggle = page.locator(".preview-motion-toggle")
        expect(motion_toggle).to_be_visible()
        motion_toggle.click()
        expect(motion_toggle).to_have_attribute("aria-pressed", "true")
        motion_toggle.click()
        expect(motion_toggle).to_have_attribute("aria-pressed", "false")
        expect(page.locator(".seat-view-chip")).to_be_visible()
        expect(page.locator(".turn-view-controls")).to_be_visible()
        if index == 0:
            page.screenshot(path=f"work/comfort/{browser.browser_type.name}-{width}-preview.png")
            page.locator(".reserve-on-table").click()
            expect(page.get_by_role("dialog")).to_be_visible()
            page.keyboard.press("Escape")
        page.locator(".preview-back").click()
        page.locator(".table-focus-back").click()
    page.locator(".partner-copy > button").click()
    dialog = page.get_by_role("dialog")
    expect(dialog).to_be_visible()
    assert dialog.locator("#partner-restaurant").evaluate(
        "el => parseFloat(getComputedStyle(el).fontSize) >= 16")
    assert dialog.locator("label").first.evaluate(
        "el => parseFloat(getComputedStyle(el).fontSize) >= 14")
    assert dialog.evaluate("el => el.scrollWidth <= el.clientWidth"), "Form must not overflow"
    page.screenshot(path=f"work/comfort/{browser.browser_type.name}-{width}-partner.png")
    dialog.locator("#partner-restaurant").fill("Test restaurant")
    dialog.locator("#partner-contact").fill("Test host")
    dialog.locator("#partner-phone").fill("+994 50 123 45 67")
    choice = dialog.locator(".choice-grid button").first
    choice.click()
    expect(choice).to_have_attribute("aria-pressed", "true")
    dialog.locator("button[type=submit]").click()
    expect(dialog.locator(".partner-success")).to_be_visible()
    page.keyboard.press("Escape")
    page.emulate_media(reduced_motion="reduce")
    page.locator(".see-table-button").click()
    page.locator(".view-from-seat").click()
    expect(page.locator(".preview-photo img")).to_be_visible()
    expect(page.locator(".preview-photo video")).to_have_count(0)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert not errors, errors
    context.close()
    return {"browser": browser.browser_type.name, "width": width, "passed": True}


if __name__ == "__main__":
    Path("work/comfort").mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        results = []
        for engine in [playwright.chromium, playwright.webkit]:
            browser = engine.launch(headless=True)
            for width in [390, 1366]:
                results.append(audit(browser, sys.argv[1], width))
            browser.close()
        print(json.dumps(results, indent=2))
