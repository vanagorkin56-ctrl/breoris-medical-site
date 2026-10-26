# Breoris Medical: working rules

Read `docs/project-memory.md`, `DESIGN.md`, and `docs/quality-workflow.md` before changing the website. User instructions take precedence. These documents record decisions, not permission gates.

## Rules
- Inspect Git status first. Preserve unrelated working changes; stage only the requested changes.
- Keep approved brand media, genuine clinic photographs and physician identities. Do not redesign the hero as incidental polish.
- Keep booking service identifiers stable when editing labels. Health24 and Supabase have different confirmation flows. A pending request is not a confirmed appointment.
- Never create real patient appointments for routine QA or expose patient data/credentials in logs, fixtures, screenshots or commits.
- Publish only factual clinic claims and supported prices. Do not invent reviews, physician review of articles, search volumes, rankings or service availability.
- Public language choices are Ukrainian and English. Ukrainian-only articles must not be presented as translated pages.
- Update generators and generated output together where relevant. Do not run broad generators over unrelated edits without inspecting their output.
- Use the focused checks in `docs/quality-workflow.md`; record what was actually verified and any limitations.
- Update project memory after a user-approved change in direction. Keep historical experiments out of the current design specification.
