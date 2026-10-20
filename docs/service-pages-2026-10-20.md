# Mobile readability and service pages — 20 October 2026

## Changes

- Mobile hero wordmark: real HTML text, 32–58px, independent of the video. The original MP4 and playback logic are unchanged.
- Four mobile service labels: 18px, two columns, minimum 64px targets. Consultation text wraps without shrinking.
- 26 Ukrainian service pages plus a service directory. Exact service names come from the existing homepage catalog. Unique introductions, visit/preparation information and questions are editable in `data/services.json`.
- Doctor links use existing profiles; no invented doctors, clinical reviewer or qualifications. Proctology availability and programme 40+ conditions are explicitly left for the clinic to confirm.
- Main service list links to explanatory pages. All 26 pages also have static links in homepage HTML for discovery without JavaScript.
- Existing booking API, authentication and patient data handling are unchanged.
- Canonical URLs and the 39-entry sitemap use `https://www.breoris-medical.com`, matching the current Vercel custom-domain redirect configuration.
- Public pages are indexable on the custom domain. All `*.vercel.app` hosts receive `X-Robots-Tag: noindex, nofollow`; private admin restrictions remain in place. Robots excludes admin and API.

## Important launch dependency

On 20 October the custom domain still serves the old site (nginx; www redirects to apex) and authoritative nameservers remain ns1/ns2.gooddnsserver.com. Domain/DNS switching is still required before these pages can be indexed on the clinic domain. No DNS or mail records were modified by this task. Search Console ownership/submission has not been verified. No ranking improvement is guaranteed.

## Content sources

Clinic services, address, doctor names and existing specialties: local homepage catalog and supplied clinic content. New text explains the visit; it does not prescribe treatment or claim guaranteed results. Clinic should review the wording, current service availability and programme conditions.

General ultrasound explanation and preparation guidance: https://www.nhs.uk/tests-and-treatments/ultrasound-scan/
General EEG definition: https://www.nhs.uk/tests-and-treatments/electroencephalogram/
Google content guidance: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
Vercel host-conditional headers: https://vercel.com/docs/project-configuration/vercel-json

## Build and verification

Run `python3 scripts/build-doctors.py`, then `python3 scripts/build-services.py` using a current Python 3; Node is used to read the shared frontend catalog. Doctor builds preserve service sitemap entries.

Verified 27 pages: exactly one H1 and title per page, unique content records, nonempty descriptions, indexable metadata, self canonicals, all local links/assets exist and sitemap has 39 URLs. Browser checked mobile widths 320 and 390 with no horizontal overflow; all four hero labels 18px. Service page body text 18px, structured data renders as WebPage/BreadcrumbList. Desktop uses original film. No patient submissions were made.
