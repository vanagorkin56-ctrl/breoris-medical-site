# Breoris Medical: current design system

Updated 26 October 2026. Historical prototypes are archived in `docs/design-history-2026-09-29.md`. Current decisions are in `docs/project-memory.md`.

## Visual direction
Calm, readable clinic website with real people and rooms, open space, restrained outlines and clearly visible blue actions. Use the supplied logo. Do not replace genuine portraits or clinic photographs with generated substitutes.

## Color and type
- Primary blue #235b92, hover #174672, deep blue #163c5a.
- Text #203b4a; muted text #5b6b75; borders #dce4e7; pale surfaces #f2f6f7; white #fff.
- Existing font stack uses DM Sans and Manrope with Arial/sans-serif fallbacks. Preserve the established roles in CSS rather than introducing another font.
- Target 16px or larger for essential body/form information; mobile service names 18–19px, doctor names 23px, specialties 17px. Metadata can be smaller when it is not needed to complete a task.
- Avoid fixed-height text containers, cropped names and forced single-line headings. Check long Ukrainian text and English separately.

## Layout and controls
- Breakpoint for mobile tracks: 760px. Use native horizontal scrolling and scroll snap, visible neighboring-card edge, 52px round arrows and current/total counter.
- No carousel autoplay. Disable navigation at the ends. Keyboard navigation is immediate; reduced-motion preferences disable movement.
- Primary actions are blue; secondary actions use an outline or text underline. Controls have visible focus and explicit labels. Keep touch targets at least 44px where practical.
- Use the existing Tabler outline icons, currentColor and consistent stroke weight; decorative icons are hidden from assistive technology.
- Prefer flat sections and restrained borders. Do not add decorative effects that hide content or delay booking.

## First screen and photographs
- Keep approved `breoris-opening-smooth.mp4` desktop and `breoris-opening-mobile.mp4` mobile films, poster fallback and live selectable text.
- Playback once per page load. Autoplay failure, reduced motion or data-saving can show the static fallback. No replay button.
- Gallery order: day hospital ward, gynecology room, procedure room, massage room. Captions describe visible rooms without inventing capabilities.
- Preserve the approved portrait crop and clear booking actions on doctor cards.

## Content and appointment states
- One H1 per page; descriptive H2 sections; services near the beginning of the homepage.
- UA and EN homepage; actual Ukrainian articles have Ukrainian navigation. Do not expose Russian as a selectable language.
- Keep approximate prices explicitly approximate. Pending administrator confirmation must remain visibly pending.
- No generic promises, invented expertise, fabricated reviews or unsupported medical conclusions.

## Completion
A section is ready when its content is accurate, controls work, text is readable at mobile and desktop widths, keyboard focus remains usable, and there is no horizontal page overflow. Use `docs/quality-workflow.md` and record the checks actually performed.
