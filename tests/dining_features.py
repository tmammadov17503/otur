"""Exercise OTUR's private-by-default planning features on desktop and touch browsers."""

import json
import re
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
    journey = page.locator(".hero-journey")
    expect(journey).to_be_visible()
    tabs = journey.locator(".hero-journey-tab")
    expect(tabs).to_have_count(3)
    assert tabs.nth(1).bounding_box()["height"] >= 44
    tabs.nth(1).click()
    expect(tabs.nth(1)).to_have_attribute("aria-selected", "true")
    room_motion = journey.locator('video[data-journey="plan"]')
    expect(room_motion).to_be_visible()
    room_motion.evaluate("el => new Promise((resolve, reject) => { if (el.readyState >= 2) return resolve(); el.addEventListener('loadeddata', resolve, { once: true }); el.addEventListener('error', reject, { once: true }); })")
    assert room_motion.evaluate("el => el.videoWidth >= 1200 && el.duration >= 6")
    tabs.nth(2).click()
    expect(tabs.nth(2)).to_have_attribute("aria-selected", "true")
    expect(journey.locator('video[data-journey="table"]')).to_be_visible()
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
    expect(page.locator(".floor-table.selected")).to_have_attribute("aria-label", re.compile(rf"{re.escape(selected)}.*2"))
    expect(page.locator(".table-capacity")).to_contain_text("2 guests")
    assert page.locator(".context-tags span").count() >= 1
    page.locator(".see-table-button").click()
    expect(page.locator(".table-focus")).to_be_visible()
    progress = page.locator(".experience-progress button")
    expect(progress).to_have_count(2)
    progress.nth(0).click()
    expect(page.locator(".plan-side")).to_be_visible()
    progress.nth(1).click()
    expect(page.locator(".table-focus")).to_be_visible()
    expect(page.locator(".seat-choice")).to_have_count(0)
    expect(page.locator(".table-focus-summary")).to_contain_text(selected)
    expect(page.locator(".spatial-preview.seat-view")).to_have_count(0)
    expect(page.locator("canvas[data-room-model='true']")).to_have_count(0)
    page.locator(".reserve-selected-table").click()
    expect(page.locator(".account-dialog")).to_be_visible()
    expect(page.locator(".demo-account-button")).to_have_count(0)
    page.locator(".account-tabs button").nth(1).click()
    page.locator("#account-name").fill("Aylin Test")
    # Email is intentionally left empty: international phone is the required identity.
    page.locator("#account-phone").fill("50 123 45 67")
    page.locator("#account-password").fill("calm-table-26")
    page.locator(".account-form .confirm-button").click()
    expect(page.locator(".sheet-summary")).to_contain_text(selected)
    page.locator("#guest-request").fill("Window if possible")
    page.locator(".policy-check input").check()
    page.locator(".confirm-button").click()
    expect(page.locator(".prototype-note")).to_have_count(0)
    with page.expect_download() as result:
        page.locator(".confirmation-actions button").nth(0).click()
    download = result.value
    assert download.suggested_filename.endswith(".ics")
    calendar = Path(download.path()).read_text(encoding="utf-8").replace("\n ", "")
    assert "BEGIN:VCALENDAR" in calendar and "STATUS:CONFIRMED" in calendar
    assert "Free cancellation" in calendar
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
    stored_reservations = json.loads(page.evaluate("localStorage.getItem('otur-reservations-v2')"))
    assert stored_reservations[0]["request"] == "Window if possible"
    assert stored_reservations[0]["status"] == "confirmed"
    page.screenshot(path=f"work/features/{browser.browser_type.name}-{width}-confirmation.png")

    expect(page.locator(".manage-reservation-button")).to_be_visible()
    expect(page.locator(".manage-reservation-note")).to_contain_text("cancel")
    page.locator(".manage-reservation-button").click()
    expect(page.locator(".reservation-item")).to_have_count(1)
    page.locator(".cancel-reservation-button").click()
    page.locator(".cancel-confirm button").nth(1).click()
    expect(page.locator(".reservation-item")).to_have_class(re.compile("status-cancelled"))
    expect(page.locator(".reservation-item .reservation-status")).to_contain_text("Cancelled")
    cancelled_reservations = json.loads(page.evaluate("localStorage.getItem('otur-reservations-v2')"))
    assert cancelled_reservations[0]["status"] == "cancelled"
    assert cancelled_reservations[0]["cancelledAt"]
    page.locator(".sign-out-button").click()
    page.locator(".reserve-selected-table").click()
    page.locator("#account-phone").fill("50 123 45 67")
    page.locator("#account-password").fill("calm-table-26")
    page.locator(".account-form .confirm-button").click()
    expect(page.locator(".reservation-sheet")).to_be_visible()
    page.keyboard.press("Escape")

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
    expect(restored.locator(".zoom-controls")).to_have_count(0)
    expect(restored.locator(".mini-map iframe")).to_have_count(1)
    restored.locator(".hero-journey-tab").nth(1).click()
    expect(restored.locator(".hero-journey video")).to_have_count(0)
    restored.wait_for_function("() => { const image = document.querySelector('.hero-media img'); return image?.complete && image.naturalWidth > 0; }")
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
