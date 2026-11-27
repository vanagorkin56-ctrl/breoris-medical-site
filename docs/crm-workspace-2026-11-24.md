# Internal CRM workspace — 24 November 2026

Release update: both migrations are now applied, and commit `7403ed3` is published to the Vercel production application. Custom-domain DNS cutover remains outstanding. See `output/release-2026-11-24/release.md` and the top of project memory for current verification and acceptance limitations; preparation-time pending statements below are historical.

The user asked to manage clinic enquiries through the website's own administrator cabinet, as a CRM, and replace the literal reception photograph with a general brand visual. Implementation is in `site-client-nov24`, branch `codex/client-revisions-nov24`. Publication remains pending.

## Working behaviour

- One private workspace at `/admin/` handles appointment, declaration, EKOPFO and vaccination enquiries. Lists use real database counts and server pagination, literal text/phone search, doctor, stage and priority filters.
- Staff can create an enquiry received by phone or at the clinic, choose the physician, agree a Kyiv appointment time, record a responsible staff name, priority, next-contact date and internal notes, then complete or cancel the enquiry.
- The day calendar shows confirmed, unresolved visits. Contact directory groups enquiries by phone and links back to their history; it does not claim that a shared phone uniquely identifies a patient.
- Changes and notes are recorded in a protected activity log. Optimistic versions prevent overwriting another administrator's changes; confirmation overlap checks and idempotent creation remain enforced in the database.
- Declaration enquiries have no appointment-only fields. Completing an enquiry records administrative work and does not electronically sign a legal declaration. There is no direct Health24 appointment creation or invented synchronization.
- Existing active administrator authentication and private database policies remain required. The interface uses administrator session tokens, not service-role credentials. Patient details are not stored in localStorage. Logout clears private fields and rows.
- Manual entry records staff confirmation that the patient requested contact; it is explicitly distinguished from consent submitted through the website.

The user rejected the first abstract glass photograph. Contact forms now use an anonymous illustrative consultation photograph focused on a clinician’s coat and hands in natural light. Source and exact prompt: [visual record](contact-consultation-prompt-2026-11-24.md). The actual clinic introduction/gallery and doctor photographs are unchanged.

## Checks performed

- 42 server tests and 7 PostgreSQL-compatible database tests passed (49 total), including authentication, active membership, outsider/anonymous isolation, immutable audit, manual-entry provenance, idempotency, optimistic conflicts, persisted declaration-kind checks, historical visit annotation, overlapping time protection, literal search and pagination.
- 78 public pages / 72 sitemap URLs passed local links, assets, anchors, H1 and canonical checks. Changed JavaScript syntax and whitespace checks passed.
- Browser QA used an in-memory local PostgreSQL-compatible fixture with entirely fictional contact data. The actual API handlers were exercised; no clinic or external database was contacted. Website declaration submission visibly returned a receipt, then appeared as a new website-sourced enquiry in CRM.
- Manual declaration creation, completion, note history, persistence after page reload, calendar and contact directory were checked in the browser. Previously saved responsible staff and next-contact values persisted. Public form cleared its contact fields on reopening.
- Desktop workspace and the new form photograph were inspected. At 390 × 844, the workspace, detail dialog and declaration form have no horizontal page/dialog overflow. Physical iPhone/Safari was not tested.
- Screenshots and full test results are in `output/crm-2026-11-24/`. The fixture server in that folder is QA-only and is excluded from the published `dist` and API tree.

## Live rollout dependency

Apply these migrations in order to the configured private clinic database, skipping an already applied predecessor:

1. `database/callback-requests-setup.sql` — original setup for a new database only.
2. `database/administrator-requests-migration.sql` — slot-free website enquiries.
3. `database/crm-workspace-migration.sql` — private CRM fields, history and RPCs.

The CRM migration seeds no patients and creates no administrator accounts. Keep existing server-only variables and active administrator memberships. Publish the complete version, including the new API routes and image, after the migrations. Confirm live administrator login and a clinic-approved test request before accepting live operation.

No production migration or publication was performed. The hosting connector returned 403 for the project and listed no accessible teams. Local fixture success does not establish live availability. Vaccination prices remain pending from the clinic.
