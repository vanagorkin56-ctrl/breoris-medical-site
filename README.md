# Breoris Medical — design prototype

Single-page Ukrainian site for review, built with HTML, CSS and JavaScript. Serve `dist/` with any static server.

## Included
- Supplied Breoris branding and an official website photo of the clinic waiting area.
- All 26 service names from the current website, grouped into four categories.
- 14 specialists: 12 supplied cards plus Hrytsai and Honchar from the current website.
- Detailed profiles with original full artwork available separately.
- Three-step booking demonstration with dependent physician selection, preferred date/time, contact channel and validation.
- Responsive navigation, sticky mobile action, original location/map and social links.

## Boundaries
- The booking flow never sends or stores personal data. Closing it resets the form.
- Times are requests, not actual available slots. Health24 integration and Supabase are not implemented.
- No protected administration route or production authentication is included in this website iteration. Earlier admin concept remains in the conversation's visualization files.
- Public content comes from the clinic website and supplied cards; clinic approval is still required before replacing the live site.
- `noindex,nofollow` is intentional for this private design preview. Remove it only for the approved production launch.
- The original SVG wordmark contains unsupported embedded SVG fonts. `logo.png` preserves the exact supplied lettering; the symbol remains SVG.

## Assets
User-supplied: logo.png, allakhverdiev.png, tomakh/pavlova/polnytska/pokaichuk/mishchenko/sushko/orlov/sokrut/kovalchuk/arslanova/baldetska.jpg, logo.svg, favicon.svg.
Official website images: https://breoris-medical.com/images/ (matching original filenames in assets/). Retrieved 2026-09-29. Raster provenance is also embedded in metadata.
The laboratory and day-hospital sections use real clinic photos supplied by the owner. The check-up scene is AI-generated using the supplied portrait of Kateryna Sushko and clinic interior references, approved by the user. Ultrasound retains its illustrative image. Physician profile portraits remain unchanged.

## Languages and discovery

The page supports Ukrainian, Russian and English. The header selector saves the preference locally and shares the selected locale in the `?lang=` URL. Metadata and alternate-language links are provided, and `dist/llms.txt` summarizes the clinic using verified public details. Search phrasing is reflected in the page title, description, semantic headings, image alt text and clinic structured data.

The `noindex,nofollow` directive remains in place because this is still a private design preview; indexing should be enabled as part of the clinic-approved production launch.

## Interface refinement

The site uses DM Sans for sharper screen typography, a custom-styled specialty selector, restrained section reveal on scroll and responsive CTA feedback. All new motion honors `prefers-reduced-motion`.

## Verification
Local references and JavaScript syntax checked. Desktop booking tested through validation and Viber receipt; selection from Sokrut's profile carried into the form. Desktop and 390px display reviewed. No real appointments submitted.

## Current hero animation

The first screen uses `dist/assets/motion/breoris-opening-smooth.mp4`, based on the second replay in the user-supplied 2026-10-04 screen recording. The player chrome, blank top margin and a brief blue artifact near the final booking area and the recorded cursor were removed. The original extracted file remains as `breoris-opening.mp4`. The live caption and booking action retain the site's font and UA/RU/EN translations. The film fills the hero surface without a card, preserves its full composition, and plays once per page load. The live caption and button fade in during the quiet final part of the film, simultaneously with the service labels. Playback then holds the actual final video frame to avoid a poster transition. On mobile the complete frame stays visible with the live booking action below it.

`dist/assets/motion/breoris-opening-first.webp` matches the video's first frame during loading; `breoris-opening-still.webp` shows the complete brand frame for reduced-motion, Save-Data and playback failure. The former hero heading and support text are now in a separate section directly below the film, paired with the real clinic waiting-area photograph `breoris-medical.jpg`. The earlier body-map Remotion source remains in `../breoris-motion/` but is no longer loaded by the homepage. The trust section follows the new copy-and-photo section. Physical Safari iOS autoplay and visual desktop/mobile verification remain outstanding.

## Patient journey refinement

The homepage now names the main services directly below the animated first screen, uses more direct service copy, and avoids unverified treatment and result-speed promises. A general booking action starts with help choosing a service, while service and physician actions keep their selection. The demo dialog and receipt state clearly that no request is sent and offer the real phone and Telegram routes. The mobile contact widget is compact to reduce overlap with the fixed booking bar.

The clinic's [Instagram profile](https://www.instagram.com/breoris_medical/) was supplied as a brand and service reference. Five supplied price-list screenshots are transcribed in `dist/pricing.js` and used for the booking estimate and receipt. Services without a supplied price ask patients to confirm it with an administrator. The receipt states that this is an estimate and the appointment request is not sent. Google Maps reviews are prepared in `dist/google-reviews.js`; see `GOOGLE_REVIEWS.md` for activation.

The earlier marketing revision was reviewed at desktop and 390px mobile width, including Ukrainian and English copy. Its screenshots are in `qa/marketing-mobile.png`, `qa/marketing-booking-demo.png`, and `qa/marketing-request-preview.png`. For the 2026-10-02 pricing and design revision, JavaScript syntax, local asset references, 28 transcribed price entries, minimum-price qualifiers and medicine exclusions were checked. The browser tool blocked the local `file://` preview, so this revision still needs visual desktop/mobile review.

Hero cleanup (2026-10-10): repaired the recording seam and clipped lower decorative dot without changing the ECG or timing; original video retained. `scripts/repair-hero-seam.py` processes decoded 1440×816 PNG frames. Playback now reveals content using presented video frames, with a timeupdate fallback. The contact widget uses one circular launcher, a brief two-cycle ring animation, and reduced-motion support.

## Vercel preview deployment

Import this repository, use its root as Root Directory, and keep the framework preset as Other. `vercel.json` publishes the ready-to-serve `dist` directory without a build command. Doctor pages are pre-generated and committed; after editing `data/doctors.json` or shared page templates, run `python3 scripts/build-doctors.py` and commit the resulting files.

Real booking and Health24 are not connected. Homepage booking remains a demonstration; doctor page endpoints in `dist/doctor-pages-config.js` are empty. Reviews are manually supplied static content, so no Google API key is required. Keep server credentials outside `dist`. Preview noindex directives remain enabled.

Release check (2026-10-10): all local HTML link/asset targets and JavaScript syntax passed. Headless Chrome checks passed at 1440px and 390px: feature images, contact panel open/Escape close, booking dialog open/close, physician accordion, no horizontal overflow or uncaught JavaScript errors. External embeds were excluded from this local test. Real appointment submission remains unconfigured.
