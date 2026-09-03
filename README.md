# OTUR

[![Deploy OTUR to GitHub Pages](https://github.com/tmammadov17503/otur/actions/workflows/pages.yml/badge.svg)](https://github.com/tmammadov17503/otur/actions/workflows/pages.yml)

OTUR is a calm, visual restaurant reservation prototype for Baku. Guests can discover a restaurant, inspect its floor plan, choose a specific available table, preview the view from that table, and reserve without creating an account.

**Public demo:** [tmammadov17503.github.io/otur](https://tmammadov17503.github.io/otur/)

## What is included

- Azerbaijani, English, and Russian interface copy
- Search and atmosphere filters for Baku restaurants
- Interactive floor plans with table capacity and availability
- Table-level spatial previews and a lightweight reservation flow
- Responsive layouts for desktop and mobile
- A restaurant-partner floor-plan editor concept
- Automated tests, linting, production builds, and GitHub Pages deployment

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```bash
npm ci
npm run dev
```

The development server prints the local URL in the terminal.

## Quality checks

```bash
npm test
npm run test:coverage
npm run lint:app
npm run build
npm run build:pages
```

`npm run build` creates the hosted Vinext application. `npm run build:pages` creates the static public build in `pages-dist/` with the correct `/otur/` asset path.

The responsive audit uses Python 3.10+ and Playwright. It checks seven screen sizes in Chromium and WebKit, including touch-enabled phone booking flows:

```bash
python -m pip install playwright
python -m playwright install chromium webkit
python tests/responsive_audit.py
```

Pass a local or preview URL as the final argument to test an unpublished build. Screenshots are saved under the ignored `work/responsive-audit/` directory.

## Deployment

Every push to `main` runs the GitHub Pages workflow. It installs from the lockfile, runs coverage and lint checks, builds the static site, and deploys the result to the public demo URL.

## Prototype status

Restaurant data, availability, and reservations are simulated in the browser. A production release would connect these flows to restaurant inventory, authentication, notifications, and a secure booking API.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
