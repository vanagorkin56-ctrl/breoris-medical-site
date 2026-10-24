# Mobile navigation and clinic blog, 24 October 2026

Scope: improve the phone experience using existing clinic content and brand assets. Hero films, desktop doctor layout and booking API remain unchanged.

- Doctors: all 14 site profiles in one native swipe track on phones, previous/next buttons, visible position, keyboard arrows/Home/End and no autoplay. Specialty filtering resets to the first match. Desktop retains six initial profiles and show-all.
- The approach, clinic photographs and homepage article previews use the same phone controls; desktop remains a grid.
- Mobile services use compact rows in a bounded list. Search, categories, prices and all service links remain available.
- Blog hub `/ua/blog/` includes search/categories and 26 articles derived from the existing `data/services.json`. Article pages have readable paragraphs, an outline, related articles and a link to the corresponding service/doctor/pricing page.
- Service URLs remain stable. Their long visit/preparation descriptions now live in linked blog articles; commercial pages retain specialty, staff, prices and booking information.
- Added blog links to homepage navigation/footer and new blog/service pages. Shared generator resolves relative navigation consistently.
- New controls and homepage previews are translated. Full articles remain Ukrainian, like the existing service pages; translated previews label the Ukrainian article destination.
- No fabricated reviews, medical reviewer credentials or new treatment claims. Article publisher is the clinic; existing NHS patient-information links are retained for ultrasound and EEG.

Build: run `scripts/build-blog.py`, `scripts/build-services.py`, then `scripts/build-blog.py` with Python 3. The helpers preserve homepage routes and existing sitemap URLs.

Verification: JS syntax; generated page/link/asset/canonical checks; mobile next/previous doctor, native horizontal scrolling, End at final doctor, specialty reset, clinic cards and language switching; blog search/no-results/outline; desktop layout. Booking is checked after deployment by opening the form without submitting patient details.

Previously uncommitted marketing edits remain separate from this release.
