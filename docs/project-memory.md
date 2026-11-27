# Podhorna portrait — 27 November 2026

- User requested replacing the existing physician photograph with the supplied `IMG_7111 3.PNG`. Doctor ID `podhorna` and profile URL are unchanged.
- Replaced shared `dist/assets/doctors/podhorna.jpg` with a direct crop from that screenshot: x=430, y=300, width=672, height=882. JPEG quality 90; no generated face, retouching or background replacement. The status bar, clinic logo and text panel are outside the crop. The shared asset covers homepage cards, directory and profile.
- Updated image provenance/dimensions in `data/doctors.json` and regenerated only Podhorna’s profile plus the shared directory. Physician facts and all other portraits are unchanged.
- Static validation passed 78 pages. Desktop and 390px mobile profile checked; no horizontal overflow. Release evidence is in `output/podhorna-photo-2026-11-27/`.

# Release status — 24 November 2026

- Release branch `codex/client-revisions-nov24-release` contains the reviewed clinic corrections and CRM. First preview exposed the Hobby limit of 12 functions; contacts now use the authenticated requests route with `view=contacts`, reducing 13 functions to 12. No upgrade required.
- Both database migrations were applied successfully to Supabase project `ikrhumtauxwccnjrrijd` after explicit user approval. Live checks confirmed the new columns, RLS, server-only submission, ordinary-account isolation and active-administrator RPC access. No patient data was created or printed.
- Published repository main commit `7403ed365b97d54ffa7e7295dabf6a338dac7baa`: Vercel production `dpl_AkVYzRR1Ho8m2YLa7PgcCKu7qMxE`, READY. Application: `https://breoris-medical-site-dist.vercel.app/`; CRM: `/admin/`. The form, catalogue, EKOPFO price and login page load; private contacts reject unauthenticated access. Actual administrator email/password login and a clinic-approved real request remain acceptance checks.
- Custom-domain handover is still separate: apex and www resolve to old host `65.21.20.126` under gooddnsserver.com; Vercel confirms misconfiguration. The apex visibly serves the previous site. DNS was not changed; the user was asked which provider manages it. Do not claim the new site is live on the clinic domain yet.
- Final checks: 43 server tests, 7 local database tests and 78 public pages passed. Supabase Security Advisor rerun: 0 errors, 4 reviewed warnings; no unrelated Auth settings changed. Vercel error/fatal scan returned no groups. Evidence: `output/release-2026-11-24/release.md`. Earlier pending-publication notes below describe preparation history and are superseded by this section.

# Breoris Medical: project memory

## Form photograph correction — 24 November 2026

- The user rejected the blue/ivory glass image. Contact forms now use `dist/assets/campaigns/contact-consultation-nov24.jpg`, an anonymous illustrative consultation photograph focused on a clinician’s coat and hands, with soft daylight and no visible face. Do not restore the rejected glass photograph or describe the new illustration as an actual Breoris physician/clinic. Genuine clinic/gallery and physician photos remain unchanged.
- Built-in image_gen; current prompt and provenance: `docs/contact-visual-prompt-2026-11-24.md`. This correction is local and unpublished.

## Internal CRM and general form visual — 24 November 2026

- User explicitly requested a CRM inside the website administrator cabinet. `/admin/` now includes appointment/declaration lists, server search and filters, real overview counts, pagination, confirmed day calendar and a phone-grouped contact directory. Staff can create phone/on-site enquiries, assign a doctor, agree a time, record responsible staff, priority, next contact and notes, complete/cancel work, and view immutable change history.
- Existing active-administrator access remains required. User session tokens and database row/column policies protect private records; no patient details in localStorage. Manual contact confirmation has distinct staff provenance. A completed declaration enquiry is not a signed declaration.
- Apply `database/crm-workspace-migration.sql` after `administrator-requests-migration.sql` before rollout. Neither was applied to production. Publication is still blocked by hosting connector access (403/no teams).
- Historical first version (subsequently rejected): contact forms used the conceptual blue/ivory glass photograph `dist/assets/campaigns/contact-glass-nov24.jpg`. Genuine clinic/gallery and doctor photographs remain intact. Built-in image_gen provenance and exact prompt are in `docs/contact-visual-prompt-2026-11-24.md`.
- 42 server tests + 7 database tests pass; 78 public pages checked. Browser checks on fictional local data verified website form → stored CRM enquiry, staff creation, completion, saved notes/history, calendar, contacts, field reset, desktop and 390px mobile without horizontal overflow. No real patient records submitted. See `docs/crm-workspace-2026-11-24.md` and `output/crm-2026-11-24/`.

## Client-requested administrator booking and content corrections — 24 November 2026

- Current implementation is `/Users/ivangorkin/Documents/ChatGPT/Bioris/site-client-nov24`, branch `codex/client-revisions-nov24`, based on `fd51c55` (published 22 November tree). Original dirty workspace is preserved.
- The client now explicitly requires all booking through an administrator, including doctors connected to Health24. This supersedes the previous direct-booking decision. One contact form replaces schedule selection. A pending request is still not a confirmed appointment.
- Clinic supplied all ten physician labels and full introduction. Hrytsai’s neurology, highest category, degree and associate professorship are now clinic-confirmed. Sushko is gastroenterologist only. Sirenko is displayed as Honchar (Sirenko), keeping `honchar` and the existing URL.
- Six consultation starting prices updated. Gastroenterology card includes nutrition/dietetics. Vaccination and EKOPFO are present in the service catalogue. Existing green fourth-slide colour is retained.
- New administrator-request persistence and queue changes require `database/administrator-requests-migration.sql` before live use. The old public direct-appointment endpoint is disabled in this revision. No production migration or publication has occurred.
- User confirmed the Garvis declaration form is a reference only. The Breoris declaration button opens a dedicated contact-request mode; requests are stored with `requested_service = Декларація з терапевтом`. It collects name/phone and optional email/comment, without passport or tax ID fields. It is an enquiry, not a completed declaration.
- User confirmed EKOPFO starting price of UAH 5,000; service cards, detail pages (UA/EN) and request estimates are synchronized. Description reuses the clinic-supplied Instagram material already in the project. Vaccination prices are still to be supplied.
- Verification: 78 public pages, 38 server tests and four database tests pass; UA desktop/mobile and EN mobile introduction checked. A local-only fixture submission verifies pending status and field reset. No real appointments or patient requests were submitted.
- Hosting connector cannot access the project (403, no available teams). See `docs/client-revision-2026-11-24.md` and `output/client-revision-2026-11-24/` for evidence and live acceptance dependencies.


## Light green campaign and doctor specialty audit — 22 November 2026

- User requested a lighter green fourth slide and verification of physician labels against supplied DOC.UA screenshots. Fourth theme now uses sage `#c7dbb8`, dark green text and a lighter photo overlay; approved image, layout and other three themes retained.
- Roster/callback labels synchronized to confirmed specialties; current name Сіренко Оксана Юріївна retains internal ID `honchar`. Sushko therapy added to filters. Old Health24 “Невропатолог” is displayed as “Невролог”; ultrasound aliases normalized without applying consultation fees.
- Health24 still calls Pokaichuk a therapist, conflicting with confirmed neurology. Gateway blocks that mismatched provider schedule/submission and offers the existing administrator-confirmed callback path instead. All provider IDs remain unchanged; a correctly updated provider specialty automatically restores direct booking.
- User could not confirm Hrytsai. Her card remains with “Спеціальність уточнюється” and clinic phone; unverified neurology claims and booking options withheld until the clinic confirms. Arslanova retains the clinic-supplied massage label, without claiming DOC.UA verification.
- Audit and remaining clinic dependencies: `docs/doctor-specialty-audit-2026-11-22.md`. Local release evidence: `output/doctor-audit-green-2026-11-22/`. Nineteen focused booking tests and 75-page static check passed. No real patient booking submitted. Existing callback scheduling-service dependency remains unresolved.
- Live rollout verified: 16 booking options for 14 confirmed/clinic-supplied clinicians, with Pokaichuk as neurology callback and Hrytsai withheld. Callback schedule still returns HTTP 503. The schedule-stage message now offers clinic phone/Telegram; it does not tell the visitor to resend a request that has not been submitted. Both initial Vercel deployments succeeded.

## Fourth campaign: preparation for EKOPFO — 13 November 2026

- User requested a fourth live homepage slide, using clinic-supplied Instagram screenshots IMG_7075–7083.PNG as service information. Added “Підготовка до ЕКОПФО” with the poster heading “Готуєтесь до ЕКОПФО?” and the same desktop copy/photo layout, mobile adaptation, selectable UA/EN typography and 5-second advance as the existing series.
- Generated one new conceptual editorial photograph with built-in image_gen: real-looking medical document folder, ivory paper and metal clip behind textured glass. No doctor likeness, real clinic interior or patient records are depicted. Original PNG and exact generation prompt are saved in the workspace release folder; the website uses a 1086×1448 JPEG. Palette: muted teal `#286a76`, white and mint accents, consistent with the existing blue/mint series. Do not replace earlier approved slide images.
- Both new poster and “Дізнатися більше” links open the matching UA/EN direction page. Added detailed clinic-supplied consultation/examination/review/referral stages and the documented conditional UAH 5,000–8,000 preparation fee. Initial consultation and additional examinations/consultations are separately charged as described by the clinic. No consultation fee or physician assignment was invented. Standard booking receives the EKOPFO context; existing scheduling-service limitations remain unchanged.
- General referral/decision wording checked against the Ministry of Health pages on required documents and the patient pathway on 13 November. The treating physician prepares the referral; the expert team makes the assessment decision. New pages link these official sources and distinguish clinic-supplied service fees from official process information.
- Carousel count and End key derive from slide count (four); last/first navigation works. Added cancelled-touch recovery so an interrupted gesture can resume the existing autoplay schedule. Generator supports `--direction ekopfo-preparation` to create only the new two direction pages, preserving existing six. Sitemap appends the two new URLs.
- Checked desktop 1440×900, mobile 390×660 UA and 320×568 EN: no horizontal overflow, content/action above the fixed bar, four dots and correct links/count. Mobile new direction page puts its title and booking action before the photograph. Static checks passed 75 public pages / 69 sitemap URLs; affected Python/JavaScript syntax and whitespace checks passed. Booking dialog context inspected; no real appointment submitted.

## Homepage responsive correction — 13 November 2026

- User reported a broken mobile logo and a cropped-looking desktop opening. Optimized the genuine transparent PNG in place from 6563×3088 / 878,518 bytes to 656×308 / 104,916 bytes; no branding or image generation. New homepage logo URL includes a cache version, and the shared header constrains its aspect ratio and height.
- Desktop campaign now uses available viewport height with natural content growth; copy size and spacing adapt to window height. Right-side photographs still fill the full panel. Removed the second slide's extra image zoom and moved poster link arrows to the upper right, clear of the contact widget.
- Mobile image height adapts to viewport height, with a compact 72px header (64px on the narrowest phones). Copy is never clipped. Mobile booking remains in the opaque fixed bottom bar; the duplicate inline booking button is hidden, leaving “Дізнатися більше” under each description. SVG arrows replace emoji-prone diagonal arrow characters in the campaign. Per-slide palettes, genuine branding and 5-second autoplay are preserved.
- Generator changes preserve unrelated translation blocks, including the newly added Podhorna physician. Source and generated homepage were updated together; unrelated direction pages were not regenerated.
- Verified all three themes at 1280×720, plus the full-panel layout at 1440×900. At 390×660 and 320×568 the logo loads and supporting copy/action remains above the fixed bar; slide controls can require a short scroll at the smallest size. UA/EN narrow-phone checks, menu positioning, phone disclosure/Escape and horizontal overflow checks passed. 73 public pages / 67 sitemap URLs passed the static checker. No physical iPhone or appointment submission was used for QA.

## Added physician — 13 November 2026

- Added **Подгорна Дар’я Андріївна** (use the clinic's supplied spelling, not “Підгорна”), ID `podhorna`, profile `/ua/doctors/podhorna-daria-andriivna/`.
- Clinic-supplied screenshots IMG_9729.PNG and IMG_7048–7050.PNG establish ultrasound diagnostics, 3 years' experience, adults and children aged 2+, education, continuing education and ten listed ultrasound studies. No unsupported fees or qualifications were added.
- User explicitly requested cropping the supplied screenshot without generation. Published portrait is an exact 320×420 pixel crop at x=195, y=145; no generated face or background. Instagram interface and viewer thumbnails are excluded.
- Added to homepage roster, ultrasound filter, doctor directory, route map and sitemap; UA/EN homepage name translations included. Existing physician profiles are preserved by the new `build-doctors.py --doctor podhorna` option. Sitemap updates preserve article and direction URLs.
- Health24's public directory did not include this physician on 13 November. The existing administrator-confirmed callback directory automatically includes her through the shared roster. Do not invent a Health24 ID or available hours. Clinic staff must add request windows through the existing administration flow.
- Live verification after that publication found HTTP 503 `service_unavailable` from the callback availability endpoint for both `podhorna` and the existing `pavlova`. Treat this as an unresolved shared scheduling-service dependency, not an empty calendar or verified online booking. It was not altered by the responsive homepage correction.
- Local verification: 73 public pages and 67 unique sitemap URLs passed link/assets, anchors, H1 and canonical checks; new portrait, facts and all ten studies inspected; ultrasound filter returns five specialists including her. No horizontal overflow at 390px. Five existing callback tests and affected JavaScript/Python syntax checks passed. No real appointment submitted.

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
