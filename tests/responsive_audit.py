"""Responsive smoke test for the public OTUR experience.

Usage:
    python tests/responsive_audit.py [url]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import Page, sync_playwright


DEFAULT_URL = "https://tmammadov17503.github.io/otur/"
SCREENSHOT_DIR = Path("work/responsive-audit")

VIEWPORTS = [
    ("small-phone", 320, 568),
    ("android-phone", 360, 800),
    ("iphone", 390, 844),
    ("large-phone", 412, 915),
    ("phone-landscape", 844, 390),
    ("tablet", 768, 1024),
    ("laptop", 1366, 768),
]


def check(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def visible_box(page: Page, selector: str):
    locator = page.locator(selector).first
    return locator.bounding_box() if locator.is_visible() else None


def audit_viewport(page: Page, name: str, width: int, height: int, url: str) -> dict:
    failures: list[str] = []
    console_errors: list[str] = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    page.set_viewport_size({"width": width, "height": height})
    response = page.goto(url, wait_until="networkidle")
    check(response is not None and response.ok, f"{name}: page did not return a successful response", failures)
    check(page.locator("#hero-title").is_visible(), f"{name}: hero heading is not visible", failures)

    metrics = page.evaluate(
        """() => ({
          viewport: document.documentElement.clientWidth,
          rootScroll: document.documentElement.scrollWidth,
          bodyScroll: document.body.scrollWidth,
          title: document.title
        })"""
    )
    check(
        metrics["rootScroll"] <= metrics["viewport"] + 1 and metrics["bodyScroll"] <= metrics["viewport"] + 1,
        f"{name}: page has horizontal overflow ({metrics['rootScroll']}px in {metrics['viewport']}px)",
        failures,
    )

    key_selectors = [".site-header", ".hero", ".search-rail", ".discovery", ".restaurant-experience", ".partner-section", ".partner-product", ".partner-plan"]
    for selector in key_selectors:
        box = visible_box(page, selector)
        check(box is not None and box["x"] >= -1 and box["x"] + box["width"] <= width + 1,
              f"{name}: {selector} is clipped or wider than the viewport", failures)

    is_phone_layout = width <= 760
    check(
        page.locator(".mobile-menu-button").is_visible() == is_phone_layout,
        f"{name}: incorrect mobile navigation state",
        failures,
    )
    check(
        page.locator(".desktop-nav").is_visible() != is_phone_layout,
        f"{name}: incorrect desktop navigation state",
        failures,
    )

    if is_phone_layout:
        undersized = page.evaluate(
            """() => [...document.querySelectorAll('button:not([disabled]), a[href], input, select, textarea')]
              .filter((el) => {
                const style = getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0 &&
                  !el.closest('.floorplan-canvas') && !el.closest('.partner-plan') &&
                  (rect.width < 40 || rect.height < 40);
              })
              .slice(0, 12)
              .map((el) => {
                const rect = el.getBoundingClientRect();
                return `${el.className || el.tagName}:${Math.round(rect.width)}x${Math.round(rect.height)}`;
              })"""
        )
        check(not undersized, f"{name}: undersized touch targets: {', '.join(undersized)}", failures)

        page.locator(".mobile-menu-button").click()
        check(page.locator(".mobile-nav").is_visible(), f"{name}: mobile menu does not open", failures)
        menu_box = visible_box(page, ".mobile-nav")
        check(menu_box is not None and menu_box["x"] >= -1 and menu_box["x"] + menu_box["width"] <= width + 1,
              f"{name}: mobile menu is clipped", failures)

    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(SCREENSHOT_DIR / f"{name}.png"), full_page=True)
    check(not console_errors, f"{name}: console errors: {' | '.join(console_errors)}", failures)
    return {"name": name, "width": width, "height": height, "failures": failures}


def audit_booking_flow(page: Page, url: str, name: str, width: int, height: int) -> list[str]:
    failures: list[str] = []
    page.set_viewport_size({"width": width, "height": height})
    page.goto(url, wait_until="networkidle")
    page.locator(".view-restaurant").first.tap()
    page.wait_for_timeout(650)
    check(page.locator(".plan-viewport").is_visible(), "phone-flow: floor plan is not visible", failures)

    available_table = page.locator(".floor-table.available").first
    available_table.tap()
    page.locator(".see-table-button").tap()
    page.wait_for_timeout(650)
    check(page.locator(".spatial-preview").is_visible(), "phone-flow: table preview is not visible", failures)
    check(page.locator(".reserve-on-table").is_visible(), "phone-flow: reserve action is not visible", failures)

    page.locator(".reserve-on-table").tap()
    dialog = page.locator("[role='dialog']")
    check(dialog.is_visible(), "phone-flow: reservation dialog does not open", failures)
    box = dialog.bounding_box()
    dialog_style = dialog.evaluate(
        """(el) => {
          const style = getComputedStyle(el);
          return {
            left: style.left,
            right: style.right,
            top: style.top,
            bottom: style.bottom,
            transform: style.transform,
            translate: style.translate,
            position: style.position,
          };
        }"""
    )
    check(
        box is not None and box["x"] >= -1 and box["x"] + box["width"] <= width + 1
        and box["y"] >= -1 and box["y"] + box["height"] <= height + 1,
        f"{name}: reservation dialog is clipped ({box}; {dialog_style})",
        failures,
    )
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(SCREENSHOT_DIR / f"{name}-booking-dialog.png"), full_page=False)
    check(page.locator("#guest-name").is_visible() and page.locator("#guest-phone").is_visible(),
          "phone-flow: required reservation fields are not visible", failures)
    return failures


def main() -> int:
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_URL
    results: list[dict] = []
    flow_failures: list[str] = []
    with sync_playwright() as playwright:
        for engine in (playwright.chromium, playwright.webkit):
            browser = engine.launch(headless=True)
            for name, width, height in VIEWPORTS:
                context = browser.new_context(
                    viewport={"width": width, "height": height},
                    is_mobile=width <= 1024,
                    has_touch=width <= 1024,
                )
                page = context.new_page()
                results.append(audit_viewport(page, f"{engine.name}-{name}", width, height, url))
                context.close()
            for name, width, height in [("small-phone", 320, 568), ("iphone", 390, 844)]:
                context = browser.new_context(
                    viewport={"width": width, "height": height}, is_mobile=True, has_touch=True,
                )
                flow_failures.extend(audit_booking_flow(context.new_page(), url, f"{engine.name}-{name}", width, height))
                context.close()
            browser.close()

    failures = [failure for result in results for failure in result["failures"]] + flow_failures
    print(json.dumps({"url": url, "viewports": results, "booking_flow_failures": flow_failures}, indent=2))
    if failures:
        print(f"\nResponsive audit failed with {len(failures)} issue(s).", file=sys.stderr)
        return 1
    print("\nResponsive audit passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
