# Breoris Medical: project memory

## Approved homepage campaign — 13 November 2026

- User approved installation of the revised campaign on the live site after reviewing version 03. Photographs fill the entire right panel with no surrounding mint frame, corners or inset card. Desktop service copy is positioned lower, with a top inset of roughly 100–145px.
- Reuse the approved abstract photographic series: anonymous profile behind frosted glass, woman and man behind textured glass, and an optical lens over a leaf. These are conceptual campaign images; do not describe them as clinic patients, rooms or physicians. Published JPEG copies preserve the approved photographs while reducing transfer size.
- Each slide has its own left-side palette: neurology blue `#235b92`, women's/men's health mint `#d8eeea`, NHSU pale blue `#dcebf5`. Controls and text follow the active theme. Poster headlines remain selectable, bilingual HTML text: “Болить голова?”, “Чи потрібен огляд?”, “Скринінг 40+”. Poster links open the related existing Ukrainian articles.
- Retain the three service directions, their factual descriptions, direction-page links, normal booking triggers and 5-second automatic advance. Do not restore the repeated clinic/location eyebrow or over-photo logo.
- Mobile uses a full-width near-square photograph followed by a compact service heading, short description and actions. At 320px the full description and booking action are above the fixed booking bar; slide controls can require a short scroll. No text truncation or horizontal overflow.
- Source: `data/home-directions.json` campaign fields and `scripts/home_campaign.py`; generator supports `--home-only` to preserve existing direction pages. Layout is in `dist/home-campaign.css`.
- Local verification: 72 public pages passed link/asset, anchor, H1 and canonical checks; affected JavaScript and Python syntax passed. Visually checked all three themes at desktop and mobile, UA/EN switching, 320/390px overflow and photo placement. Standard booking dialog opens locally; the static local server does not provide the clinic API. No appointment submitted. Live verification is recorded in the release note.

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
- Removed the pale statement banner “Breoris MEDICAL — коли важливо…” on 26 October 2026 at the user’s request, on all viewports. Additional services lead directly into the blog.
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
