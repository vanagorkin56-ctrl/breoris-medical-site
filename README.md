# Breoris Medical — design prototype

Single-page Ukrainian site for review, built with HTML, CSS and JavaScript. Serve `dist/` with any static server.

## Included
- Real supplied Breoris branding and clinic interior photography.
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
Four new 1536×1024 illustrative clinical photographs replace the low-resolution ultrasound, laboratory, check-up and day-hospital photos. They contain no real physician likenesses or clinic logos. Supplied physician portraits remain authentic and unchanged.

## Languages and discovery

The page supports Ukrainian, Russian and English. The header selector saves the preference locally and shares the selected locale in the `?lang=` URL. Metadata and alternate-language links are provided, and `dist/llms.txt` summarizes the clinic using verified public details. Search phrasing is reflected in the page title, description, semantic headings, image alt text and clinic structured data.

The `noindex,nofollow` directive remains in place because this is still a private design preview; indexing should be enabled as part of the clinic-approved production launch.

## Interface refinement

The site uses DM Sans for sharper screen typography, a custom-styled specialty selector, restrained section reveal on scroll and responsive CTA feedback. All new motion honors `prefers-reduced-motion`.

## Verification
Local references and JavaScript syntax checked. Desktop booking tested through validation and Viber receipt; selection from Sokrut's profile carried into the form. Desktop and 390px display reviewed. No real appointments submitted.

## Signature motion — Inside → Insight

The hero now uses the separately rendered desktop and mobile films in `dist/assets/motion/`. `hero-motion.js` automatically loops a native video after the responsive poster loads, respects reduced motion and Save-Data, and pauses offscreen or in hidden tabs. There is no on-screen pause control. `hero-motion.css` maintains safe areas and explicit dimensions. `motion-review.html` provides independent playback and downloads. A lightweight SVG scroll transition connects the hero to the introductory content.

Source project, storyboard, provenance and rebuild instructions: `../breoris-motion/README.md`. The glass anatomy is illustrative; the physician is the original supplied Breoris portrait. This remains a local design preview.
