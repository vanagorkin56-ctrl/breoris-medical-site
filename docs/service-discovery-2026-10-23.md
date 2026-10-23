# Service discovery, 23 October 2026

Preserved the blue brand palette, DM Sans/Manrope, original hero films, all 26 service URLs, doctor profiles and booking hooks. Existing homepage placed several introductory sections ahead of the service catalogue. No backend or patient data changes.

Changes:
- Large linked service cards immediately after the hero; existing doctor roster follows.
- Eight featured directions initially, full catalogue expansion, category filters, labelled search, clear control, result count and no-results assistance.
- Search recognises Ukrainian, Russian and English terms and common names such as щитовидка. This is navigation, not diagnosis.
- All 26 service links exist in static HTML and remain usable without JavaScript.
- Separate service directory uses the same search and starts expanded.
- Starting prices and detailed tables reuse `pricing.js` / `consultation-prices.js`; no new prices invented. Estimates and medicines exclusions are labelled. Rebuild after price updates.
- Call and Telegram assistance beside the catalogue.
- Real clinic photographs from existing assets; no substitute promotional video created.
- New homepage copy translated into Ukrainian, Russian and English. Service information pages remain Ukrainian, as before.

Missing clinic-owned materials: licence/legal entity details and an actual clinic tour video. These are not fabricated or published as placeholders.

Verification: JS syntax, generated link/asset checks, browser search (synonym and no-results), all26 expansion, category filtering, locale switching, desktop and390px layout, service detail/price table, booking opens with selected service. Local static preview cannot serve API routes; check booking catalogue again after deployment without submitting a patient form.

Pre-existing uncommitted marketing edits to README, homepage, i18n and refresh.css are retained separately and excluded from this change's commit.
