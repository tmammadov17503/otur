"""Exercise OTUR's private-by-default planning features on desktop and touch browsers."""

import json
import sys
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import expect, sync_playwright


def audit(browser, url, width, mobile):
    context = browser.new_context(viewport={"width": width, "height": 844}, is_mobile=mobile, has_touch=mobile, accept_downloads=True)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(url, wait_until="networkidle")
    page.locator(".dining-accent img").wait_for()
    page.wait_for_function("() => { const el = document.querySelector('.dining-accent img'); return el?.complete && el.naturalWidth > 0; }")
    page.locator(".save-restaurant").first.click()
    expect(page.locator(".save-restaurant").first).to_have_attribute("aria-pressed", "true")
    page.reload(wait_until="networkidle")
    expect(page.locator(".save-restaurant").first).to_have_attribute("aria-pressed", "true")
    page.locator(".saved-filter").click()
    expect(page.locator(".restaurant-card")).to_have_count(1)
    page.locator(".save-restaurant").click()
    expect(page.locator(".empty-results")).to_be_visible()
    page.locator(".empty-results button").click()
    expect(page.locator(".restaurant-card")).to_have_count(3)

    # A future Baku date avoids stale links when this test is rerun later.
    minimum = page.locator('input[type="date"]').get_attribute("min")
    chosen_date = (date.fromisoformat(minimum) + timedelta(days=7)).isoformat()
    page.locator('input[type="date"]').fill(chosen_date)
    page.locator(".view-restaurant").first.click()
    page.locator("#seat-preference").select_option("terrace")
    page.locator(".seat-finder button").click()
    expect(page.locator(".seat-feedback")).to_contain_text("No matching table")
    page.locator("#seat-preference").select_option("any")
    page.locator(".seat-finder button").click()
    expect(page.locator(".seat-feedback")).to_contain_text("A good fit")
    selected = page.locator(".context-title h3").inner_text()
    expect(page.locator(".floor-table.selected")).to_have_attribute("aria-label", f"{selected} · 2")
    page.locator(".see-table-button").click()
    page.locator(".reserve-on-table").click()
    page.locator("#guest-name").fill("Test Guest")
    page.locator("#guest-phone").fill("+994 50 123 45 67")
    page.locator(".confirm-button").click()
    expect(page.locator(".prototype-note")).to_contain_text("No reservation has been sent")
    with page.expect_download() as result:
        page.locator(".confirmation-actions button").nth(0).click()
    download = result.value
    assert download.suggested_filename.endswith(".ics")
    calendar = Path(download.path()).read_text(encoding="utf-8").replace("\n ", "")
    assert "BEGIN:VCALENDAR" in calendar and "STATUS:TENTATIVE" in calendar
    assert "not a confirmed restaurant reservation" in calendar
    assert "Test Guest" not in calendar and "123 45 67" not in calendar

    # Exercise the copy fallback without opening an operating-system share dialog.
    page.evaluate("""() => {
      Object.defineProperty(navigator, 'share', {value: undefined, configurable: true});
      Object.defineProperty(navigator, 'clipboard', {value: undefined, configurable: true});
    }""")
    page.locator(".confirmation-actions button").nth(2).click()
    link = page.locator(".share-link")
    expect(link).to_be_visible()
    shared = link.input_value()
    fields = parse_qs(urlparse(shared).query)
    assert set(fields) == {"restaurant", "table", "date", "time", "guests"}
    assert fields["table"] == [selected] and fields["date"] == [chosen_date]
    assert urlparse(shared).path == urlparse(url).path
    storage = page.evaluate("JSON.stringify(localStorage)")
    assert "Test Guest" not in storage and "123 45 67" not in storage
    page.screenshot(path=f"work/features/{browser.browser_type.name}-{width}-confirmation.png")

    restored = context.new_page()
    restored.goto(shared, wait_until="networkidle")
    expect(restored.locator(".context-title h3")).to_have_text(selected)
    expect(restored.locator('input[type="date"]')).to_have_value(chosen_date)
    for language in ["AZ", "RU", "EN"]:
        restored.locator(".language-switch button").get_by_text(language, exact=True).click()
        assert restored.evaluate("document.documentElement.scrollWidth <= innerWidth")
    restored.emulate_media(reduced_motion="reduce")
    expect(restored.locator(".dining-accent img")).to_have_css("animation-name", "none")
    expect(restored.locator(".depth-surface")).to_have_css("transform", "none")
    restored.evaluate("window.scrollTo(0, 0)")
    restored.screenshot(path=f"work/features/{browser.browser_type.name}-{width}-hero.png")
    # Find a sold-out group slot rather than assuming an eight-seat table is unavailable.
    for _ in range(6):
        restored.locator(".guest-control button").nth(1).click()
    for slot in restored.locator(".search-rail select option").all_text_contents():
        restored.locator(".search-rail select").select_option(slot)
        if restored.locator(".see-table-button").is_disabled():
            break
    expect(restored.locator(".see-table-button")).to_be_disabled()
    assert not errors, errors
    context.close()
    return {"engine": browser.browser_type.name, "width": width, "passed": True}


def main():
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001/"
    Path("work/features").mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as playwright:
        for engine in [playwright.chromium, playwright.webkit]:
            browser = engine.launch()
            for width, mobile in [(390, True), (1366, False)]:
                results.append(audit(browser, url, width, mobile))
            browser.close()
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
