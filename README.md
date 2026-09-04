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
- Private, device-local restaurant favorites (no account required)
- Table suggestions by atmosphere, party size, and simulated availability
- Shareable dining plans and downloadable calendar files in Baku time
- Subtle cutlery artwork and pointer-responsive depth, respecting reduced motion
- Ceramic-and-linen accents around discovery and a miniature dining vignette around the partner section
- A sparse lower-page pattern of small separate forks, knives, cups, leaves and glasses, reusing Lucide icons with light dimensional shadows
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
python tests/dining_features.py https://tmammadov17503.github.io/otur/
python tests/ambient_accents.py https://tmammadov17503.github.io/otur/
```

Pass a local or preview URL as the final argument to test an unpublished build. Screenshots are saved under the ignored `work/responsive-audit/` directory.

## Deployment

Every push to `main` runs the GitHub Pages workflow. It installs from the lockfile, runs coverage and lint checks, builds the static site, and deploys the result to the public demo URL.

## Prototype status

Restaurant data, availability, and reservations are simulated in the browser. A production release would connect these flows to restaurant inventory, authentication, notifications, and a secure booking API.

Favorites store restaurant IDs only on the current device. Contact details are never included in storage, shared links, or calendar files. A shared link restores a proposed restaurant, table, date, time, and guest count; it does not hold inventory. Calendar entries are tentative two-hour plans, not confirmed reservations.

## Visual assets

`public/dining-cutlery.png` was generated with the built-in image-generation tool in transparent-background mode. Prompt: “Exactly two sculptural full-length utensils, one dinner fork with four tines and one elegant dinner knife, floating diagonally together with generous negative space; slight three-quarter perspective, gently rounded contemporary forms; polished photorealistic 3D studio product render for OTUR’s premium reservation website. Genuinely transparent alpha background, clean cutout edges, square composition, both entirely visible and recognizable at 200–350px. Soft studio light, calm editorial mood, realistic brushed champagne metal, warm highlights and muted sage reflections, controlled satin sheen. No text, logo, watermark, food, plate, table, hands, extra objects, glow haze, or background scene.”

### Background additions

Generated with built-in imagegen in transparent-background mode. Original PNGs are preserved in `public/`; the website loads WebP copies with alpha preserved (about 457 KB combined). These decorative images are hidden from assistive technology, cannot intercept pointer input, and stay still on touch devices or when reduced motion is enabled.

- `public/dining-plates.webp` (original: `public/dining-plates.png`)
- `public/dining-room-miniature.webp` (original: `public/dining-room-miniature.png`)

Final plates prompt:

> Use case: product-mockup. Asset type: transparent decorative 3D PNG for OTUR, a calm premium Baku restaurant website; restaurant-card section accent displayed at 230–340px. Scene/backdrop: genuinely transparent background with real alpha, no ground plane or backdrop. Subject: an elegant sculptural dining still life: exactly two gently offset warm ivory ceramic dinner plates, with one softly folded pale sage linen napkin resting on the edge. Refined realistic ceramic rim and subtle linen weave. Style/medium: premium photorealistic 3D product render, restrained and sophisticated. Composition/framing: square image, three-quarter elevated view, entire plates and napkin fully visible, compact centered composition, generous transparent margin on all sides, clean silhouette at small display sizes. Lighting/mood: very soft warm studio light, calm and welcoming; gentle dimensional contact shadow contained close to the objects and fading fully to transparent; no rectangular shadow or opaque square background. Color palette: warm ivory ceramic and muted pale sage linen, visually compatible with walnut and champagne metal. Constraints: preserve genuine transparent alpha around and beneath the objects. No floor, background scene, platform, food, people, additional props, lettering, logo, watermark, or painted checkerboard.

Final dining-vignette prompt:

> Use case: product-mockup. Asset type: transparent decorative 3D PNG for OTUR, a calm premium Baku restaurant website; soft floating restaurant-partner section accent displayed at 200–300px. Scene/backdrop: genuinely transparent background with real alpha, no floor, platform, or surrounding scene. Subject: miniature architectural restaurant vignette composed of exactly one small round walnut dining table and two sculptural muted-sage upholstered chairs, with simple tiny ivory place settings on the table. Style/medium: premium photorealistic 3D model, restrained detail and sophisticated materials; subtle walnut grain and softly textured upholstery, visually cohesive with warm ivory ceramic and pale sage linen product renders. Composition/framing: square image, isometric three-quarter view, all furniture fully visible, clean full silhouette that reads clearly at 200–300px, compact centered arrangement with generous transparent margin. Lighting/mood: very soft warm studio light, calm and welcoming; gentle dimensional object self-shadows, any soft contact shadow contained close to furniture and fading fully to transparent, no square backdrop. Color palette: warm walnut, muted sage upholstery, tiny ivory table settings, compatible with champagne metal. Constraints: genuine transparent alpha around and between all objects. No floor, ground plane, platform, surrounding scene, people, food, lettering, text, logo, watermark, additional furnishings, or painted checkerboard.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
