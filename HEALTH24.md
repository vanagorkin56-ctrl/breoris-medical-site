# Health24 integration — test connection

Confirmed 2026-10-12 by Health24 support: the clinic is at the test connection stage; the test service requires an IP allowlist. Earlier production guidance was intended for another integration.

Documentation: https://dev-ehr.h24.ua/external_visit_api_doc.html
OpenAPI source: https://dev-ehr.h24.ua/swagger/external_visit.json
Production paths have the same names at ehr.h24.ua, but production credentials/readiness have not been confirmed.

## Current implementation

`api/health24/status.js` is a Vercel Node function outside `dist`. It obtains a server-only OAuth token through POST `/oauth/token` (`client_credentials`, scope `portal`), then reads GET `/api/v4/employees?legal_entity_id=17027` to verify clinic access. It returns connection status and an active employee count; it never returns the token, secret, raw API response or patient data, and never creates appointments. Upstream redirects are rejected. Concurrent requests are coalesced and diagnostic results cached for five minutes per function instance.

Set the four variables in `.env.example` in the same Vercel project/environment. Credentials stay outside the repository. Set the base URL to **https://dev-ehr.h24.ua**, not production, for this test. Redeploy after changing variables. Open `/api/health24/status` on the deployment to check the result. `connected: true` proves authentication and employee-list access only.

The approved IP of a local workstation does not establish access from Vercel. If the diagnostic reports 403, ask Health24 how to permit test calls from the deployment; do not assume changing the site domain changes the outbound IP. Do not enable paid networking without approval.

## Work remaining

Homepage and doctor-page booking remain unchanged and do not create Health24 visits. Before enabling them, verify live authentication, clinic/division and employee IDs, actual schedule slot format, then connect the forms and validate a test submission. The supplied schema declares schedule entries as strings but contains only empty arrays in its example; slot duration must not be invented.

POST `/api/v4/visit_moderations` requires phone_number, first_name, last_name, gender, birth_date, employee_id, period_start, period_end. The existing contact-only form is insufficient. Use the documented plural endpoint (`visit_moderations`), despite support's abbreviated example. Do not use the direct `/visits` flow without implementing its documented patient verification steps.

Run `node --test tests/health24.test.js` for local verification using simulated API responses; these tests never contact Health24.
