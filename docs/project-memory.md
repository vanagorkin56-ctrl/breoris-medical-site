# Breoris Medical: project memory

Updated 26 October 2026. This is the current decision record; older reports are historical evidence.

## Purpose and audience
A clinic website for patients in Dnipro, including older visitors using phones. Help a visitor find a service, understand approximate cost, choose a doctor and request/book an appointment. Readable text and clear appointment status take priority over decorative movement.

## Approved decisions
- Brand: Breoris Medical, white and pale blue surfaces, blue actions, genuine clinic and doctor photographs. AMBY is a reference for compact browsing, not a source to copy branding or claims.
- Home languages: UA and EN only. Service, doctor and blog pages currently use Ukrainian.
- Preserve the approved desktop and mobile brand films. No replay button. Static fallback is acceptable when autoplay is unavailable.
- Services follow the first screen. On phones doctors, our approach, gallery and blog use swipe tracks with explicit left/right arrows and counters; no automatic advance.
- Gallery starts with the day hospital ward, then gynecology, procedure room and massage room. No near-duplicate lounge photographs.
- Feature label: “Денний стаціонар та інфузійна терапія”; stable booking value remains “Денний стаціонар”.
- Removed the repeated “Не просто результати…” introduction and large lounge photograph. Do not restore them through a generator.
- Blog has 26 individually written articles. Editorial source is `data/blog-articles.json`; query research is in `docs/blog-research-2026-10-25.md`. Keyword hypotheses are not measured demand.

## Sources and implementation
- `dist/` is the published static website; `api/` and `server/` implement server functions.
- `data/services.json`: service content; `data/blog-articles.json`: articles.
- `scripts/build-services.py`, `scripts/build-blog.py`, `scripts/build-doctors.py`: page generation.
- `scripts/mobile_layout.py`, `scripts/clinic_gallery.py`, `scripts/ui_refinements.py`: reusable homepage transformations.
- `dist/mobile-experience.js/css`: mobile carousels. `dist/ui-refinements.css`: shared controls/icons. `dist/hero-motion.js/css`: approved film behavior.
- Health24 handles connected doctors. Supabase supports requests and administrator-defined windows for other doctors. Preserve existing validation and confirmation semantics.

## Publication and open dependencies
- Repository: `vanagorkin56-ctrl/breoris-medical-site`, branch main, Vercel publishes `dist` without a build command.
- Preview: https://breoris-medical-site-dist.vercel.app/
- Intended domain: breoris-medical.com / www.breoris-medical.com. DNS handover remains a separate task; verify before changing canonical/indexing rules.
- The Vercel preview intentionally uses noindex/nofollow. Do not remove this as a generic SEO improvement.
- No Search Console or Ads query export has been provided. No measured keyword volume or ranking improvement can be claimed.
- Medical review by the clinic, actual handset/Safari testing and a production booking round trip are separate from static/browser QA; do not imply they occurred.

## Recent decisions
| Date | Decision | Evidence |
| --- | --- | --- |
| 25 Oct 2026 | Only UA/EN; consistent outlined icons and carousel arrows | 27bcd66, f2d84da |
| 25 Oct 2026 | Four distinct rooms, ward first | 6e6bc22, 6690663 |
| 25 Oct 2026 | Clarify infusion/day care label; preserve service ID | a9eb722 |
| 25 Oct 2026 | Remove duplicate introductory block | 18edcef |
| 25 Oct 2026 | Publish 26 researched articles | e39e438 |
