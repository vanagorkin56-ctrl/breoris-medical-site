# Clinic corrections — 24 November 2026

Release update: both migrations are now applied, and commit `7403ed3` is published to the Vercel production application. Custom-domain DNS cutover remains outstanding. See `output/release-2026-11-24/release.md` and the top of project memory for current verification and acceptance limitations; preparation-time pending statements below are historical.

## Source and location

The client asked to implement the agreed corrections and supplied the full Ukrainian clinic introduction and a screenshot of the Kaplia-style contact form. Changes are on `codex/client-revisions-nov24` in `/Users/ivangorkin/Documents/ChatGPT/Bioris/site-client-nov24`.

The baseline is local `fd51c55`, whose tree matches the published 22 November revision recorded in the original workspace. The original dirty `site/` is preserved. Do not publish its older files over this revision.

## Implemented

- Clinic-supplied introduction reproduced in full; English equivalent uses the existing editorial translation mechanism.
- Six starting prices synchronized in catalogue cards, service pages, applicable doctor profiles and appointment estimates. The approved starting prices are in `data/consultation-starting-prices.json`.
- Gastroenterology card includes nutrition and dietetics while its existing booking value and URL remain stable.
- EKOPFO and vaccination added to the service catalogue, search, directory and request form. EKOPFO links to its existing detailed preparation page. No vaccination inventory or price is invented.
- Ten supplied physician labels synchronized across the roster, directory, profiles and request catalogue. Hrytsai's neurology/category/degree are now confirmed by the client's message; no experience or fee was added to her profile. Sushko has only gastroenterology. Sirenko's existing ID and URL remain stable, with the client's requested Honchar (Sirenko) name.
- All public booking buttons use `administrator-booking.js/css`. One contact form replaces provider schedule selection. Date and time are optional preferences; patients can ask for help choosing a service or doctor. Full selected physician details wrap below the native selector on narrow screens.
- The new request endpoint uses server-validated catalogue data, consent, same-origin JSON, bot filtering, database idempotency and shared database rate limits. It returns a receipt only after persistence, always with `confirmed:false`. No Health24 request is needed to load the form or submit it.
- The former public Health24 appointment-creation route now rejects direct booking, including requests from cached forms. Internal Health24 identifiers and integration code remain available for a separately authorized future change.
- The administrator queue displays service, preferred date/time, optional email/comment and lets staff assign a doctor before confirmation. New requests are not automatically treated as confirmed. Existing patients/slots are retained by the migration.
- The fourth slide already has the approved sage green palette. Campaign data, colour stylesheet and approved images are unchanged.

## Declaration reference confirmed

The client-supplied Google Forms link was opened read-only on 24 November. It redirects to a form titled **Garvis — Твоя територія здоров’я!**, listing Garvis locations rather than Breoris. No form fields were filled or submitted. The user selected the reference-only option: declaration enquiries must go to the Breoris administrator. The homepage button now opens a dedicated declaration form mode with name/phone, optional email/comment and consent. Physician/service/date/time and price fields are hidden. The server validates the declaration mode and persists its purpose in the existing `requested_service` queue field. Success text describes an enquiry and does not claim the declaration is completed. Garvis is not an active public destination.

The user additionally confirmed EKOPFO **from UAH 5,000**. The existing clinic-supplied Instagram description is used in the service record; the starting price is synchronized across catalogue cards, UA/EN detail pages and request estimates. Vaccination pricing remains pending; no fee was invented.

## Deployment dependency

Before enabling submissions in production, apply `database/administrator-requests-migration.sql` to the existing clinic request database (after the initial setup if it is a new database). Keep its configured server-only Supabase variables and active administrator membership. The migration extends the existing private queue rather than creating appointments or seeding patient data.

The live database migration and publication have not been performed. The connected Vercel project read returned 403 under its configured scope; the available team list was empty. No hosting settings or production data were changed. A working administrator login/queue and one clinic-approved production request are needed for final live acceptance.

## Checks actually performed

- 78 public HTML pages: local links/assets, anchors, H1 and canonical checks passed; 72 unique sitemap URLs.
- 38 Node server tests passed, including all-doctor requests without Health24, field validation, failed persistence, cross-origin rejection and disabled direct appointment creation.
- Four PostgreSQL-compatible database tests passed: original queue checks plus the new migration, slot-free persistence, idempotency, anonymous/outsider privacy, administrator assignment and confirmation.
- Browser: Ukrainian desktop at 1440×900, Ukrainian phone form at 390×844 and 320×740, English clinic introduction at 320px. No horizontal document/form overflow observed.
- Sokrut profile carries the correct doctor and endocrinology service into the form; the short ultrasound label is visible. The full physician label wraps on narrow screens.
- A local fixture submission showed “Заявку отримано” and explicitly pending status, without contacting Health24, Supabase or the clinic. Reopening clears name and phone.
- Declaration mode checked at desktop and 390px mobile, with a successful local-only fixture response. Its purpose is verified in the server persistence payload; no real data sent.
- EKOPFO shows UAH 5,000 on its service page and request estimate.
- New vaccination service was found through search and its page opened. All six service starting prices were checked in generated output.
- Changed JavaScript syntax and whitespace checks passed. No real patient request or appointment was submitted. Physical iPhone/Safari and production submission were not tested.

Evidence is in `output/client-revision-2026-11-24/`. The local fixture server is QA-only and must not be published as an application endpoint.

## Regeneration

Run `python3 scripts/build-doctors.py` (or `--doctor ID` for a focused profile update), `python3 scripts/build-services.py`, and `python3 scripts/build-appointment-catalog.py` after relevant source changes. The service builder now replaces only the catalogue block and preserves the approved homepage campaign, introduction, gallery and blog.
