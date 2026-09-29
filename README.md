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
No new patient or doctor images were generated. Portrait crops use CSS only; original cards are retained.

## Verification
Local references and JavaScript syntax checked. Desktop booking tested through validation and Viber receipt; selection from Sokrut's profile carried into the form. Desktop and 390px display reviewed. No real appointments submitted.
