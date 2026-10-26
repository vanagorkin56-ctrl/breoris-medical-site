# Quality workflows

## Change a section
1. Read the current decision record and inspect the working diff.
2. State the visitor problem being solved. Preserve approved content outside scope.
3. Edit the source/generator and the published output where both exist.
4. Run `python3 scripts/check-public-pages.py` for static navigation and metadata.
5. Check affected JavaScript with `node --check <file>`.
6. Inspect the changed section at a narrow phone width and desktop width. Check wrapping, photo crop, focus, button targets and page overflow.

## Change a carousel or control
Check first/last states, next/previous, keyboard arrows, Home/End, filters and empty results. A keyboard action should not wait for decorative scrolling. Verify that returning from a filtered set resets position. Never auto-advance cards.

## Change content
Verify facts against clinic-supplied material and appropriate primary sources. Distinguish service pages from articles. Preserve URLs or deliberately redirect them. Check title, H1, canonical, internal links and related content. Write the actual research date; do not claim physician review or measured search volume without evidence.

## Check booking entry
Open a booking action and verify the intended doctor/service is carried through. Inspect labels, price/status copy and close/back behavior. Stop before submitting a real appointment. Server tests use fixtures; a successful fixture test is not proof of a live booking.

## Publish
Inspect the staged diff, run focused checks, commit only intended files and deploy through the configured repository workflow. Verify the affected live page after deployment. Record the commit and actual results, including limitations. Do not remove preview noindex or modify DNS as incidental cleanup.

## Independent review pass
After implementation, review against the visitor task: what could confuse an older patient, which action is ambiguous, what fails with long text, what is only decorative? Report concrete observations rather than “perfect” or “all tested”. A separate agent is optional only when explicitly authorized by applicable instructions.
