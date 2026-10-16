# Health24 integration — test connection

Confirmed 2026-10-12 by Health24 support: the clinic is at the test connection stage; the test service requires an IP allowlist. Earlier production guidance was intended for another integration.

Documentation: https://dev-ehr.h24.ua/external_visit_api_doc.html
OpenAPI source: https://dev-ehr.h24.ua/swagger/external_visit.json
Production paths have the same names at ehr.h24.ua, but production credentials/readiness have not been confirmed.

## Current implementation

`api/health24/status.js` is a Vercel Node function outside `dist`. It obtains a server-only OAuth token through POST `/oauth/token` (`client_credentials`, scope `portal`), then reads GET `/api/v4/employees?legal_entity_id=<configured test ID>` to verify clinic access. It returns connection status and an active employee count; it never returns the token, secret, raw API response or patient data, and never creates appointments. Upstream redirects are rejected. Concurrent requests are coalesced and diagnostic results cached for five minutes per function instance.

Set the four variables in `.env.example` in the same Vercel project/environment. Credentials stay outside the repository. Set the base URL to **https://dev-ehr.h24.ua**, not production, for this test. Redeploy after changing variables. Open `/api/health24/status` on the deployment to check the result. `connected: true` proves authentication and employee-list access only.

The approved IP of a local workstation does not establish access from Vercel. If the diagnostic reports 403, ask Health24 how to permit test calls from the deployment; do not assume changing the site domain changes the outbound IP. Do not enable paid networking without approval.

## Work remaining

Homepage and doctor-page booking remain unchanged and do not create Health24 visits. Before enabling them, verify live authentication, clinic/division and employee IDs, actual schedule slot format, then connect the forms and validate a test submission. The supplied schema declares schedule entries as strings but contains only empty arrays in its example; slot duration must not be invented.

POST `/api/v4/visit_moderations` requires phone_number, first_name, last_name, gender, birth_date, employee_id, period_start, period_end. The existing contact-only form is insufficient. Use the documented plural endpoint (`visit_moderations`), despite support's abbreviated example. Do not use the direct `/visits` flow without implementing its documented patient verification steps.

Run `node --test tests/health24.test.js` for local verification using simulated API responses; these tests never contact Health24.

## Manual local connection test

On the approved workstation/network, open `scripts/check-health24-local.command` in Terminal (double-click it in Finder). Enter the test profile legal_entity_id supplied by Health24, then the client ID and secret at the hidden prompts. The checker calls only test OAuth and the clinic employee list; it does not store credentials, print staff names, or create visits. Node.js is required; the launcher uses an installed Node.js or the existing Codex bundled runtime. A local success does not establish Vercel access. Run on the same approved connection, without changing VPN/network; a home connection can also receive a different IP later.

For deployment, repeatedly adding observed Vercel IPs is not a stable allowlist. Choose managed fixed outbound IPs or host the API on a server with a reserved public outbound IP, while the static site can stay on Vercel. Confirm current costs and ownership before provisioning anything.

2026-10-16 clarification from Health24: legal_entity_id 17027 is not a test profile. Support will provide test-profile access. The local checker now asks for the test ID explicitly; no production clinic ID is used as a default. OAuth succeeded locally on 2026-10-16; employee lookup using 17027 returned JSON HTTP 500. Await the confirmed test ID and matching access before repeating clinic lookups.

The checker also supports clinic discovery: leave the first ID prompt blank to call the documented GET `/api/v4/legal_entities`, display organization IDs/names (without phone numbers), and select the confirmed test profile. It never picks an organization automatically. The portal login/password supplied by support are separate from OAuth client_id/client_secret; they must not be substituted into the API prompts.


## Verified test profile (2026-10-16)

The owner ran the local checker from the approved workstation using test legal_entity_id **22356**. OAuth and the employee list succeeded with **2 active employees**. This supersedes the earlier pending test-profile note. It does not establish production access to clinic 17027, schedule availability, visit creation, or network access from Vercel.

## Contact booking prepared for launch

`dist/contact-booking.js` currently routes all homepage, service, physician-card and physician-page booking buttons to the clinic phone and Telegram. It preserves the selected physician/service as visible context. It collects no personal data, shows no invented schedule, sends no automatic message and does not claim that an appointment was created. The clinic administrator confirms the visit. The former demonstration form is not offered to visitors, and its optional browser tool is not registered in contact mode.

Before switching to Health24 booking, confirm matching production credentials/entity, stable outbound access, the actual schedule response and a full approved test of visit creation. Add the required patient fields at that stage. Do not redirect the production contact actions into the test organization.

## Local schedule inspection

Run `zsh scripts/check-health24-local.command --schedule` from the repository on the approved workstation. Enter test entity 22356 and the OAuth credentials at the hidden prompts. After employee lookup, it reads each active employee's documented schedule endpoint for today through the next 13 days in Europe/Kyiv, bounded to 10 employees.

The report is saved to the Git-ignored `.health24-local/schedule.json` with private file permissions. It contains numeric employee IDs, date ranges, counts and up to three time-shaped slot samples for up to three dates per employee. Other strings are represented only by their length. It excludes employee names, contacts, OAuth credentials, tokens and arbitrary response fields. Empty schedules are retained as an availability result; no appointment duration or free time is invented. No visits are created. A successful run proves only read access from that workstation.

The report is a diagnostic, not a booking slot parser: the actual encoding must be confirmed before using it for period_start/period_end. Missing production access and the Vercel IP allowlist remain separate launch requirements. The schedule check has no public HTTP route.

If the schedule response fails strict validation, inspection now retains a bounded structural description for each employee and continues to the next employee. Only allowlisted field names, date keys, JSON types, lengths and time-shaped examples are retained; other names and strings are redacted. This records wrappers, object-shaped intervals or extra returned dates without treating them as usable booking slots. The normal schedule reader still rejects unsupported structures. Eleven mock tests pass, including partial inspection and redaction checks.
