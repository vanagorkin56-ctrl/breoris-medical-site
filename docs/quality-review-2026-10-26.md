# Quality review — 26 October 2026

| Before | After | Why |
| --- | --- | --- |
| Current design document mixed historical hero concepts and demo booking | Current specification, archived history, project memory and working rules | Prevent accidental reversal of approved changes |
| Mobile booking hints/consent/status used 12–14px text | Essential text 16px, step indicator 14px | Improve readability |
| Keyboard carousel arrows used smooth scrolling | Immediate keyboard movement; pointer retains smooth movement | Responsive keyboard navigation |
| Empty carousel could display 1 / 0 | 0 / 0; both arrows disabled | Accurate empty state |

## Checks completed before publication
- Static checker: 66 public home/service/blog/doctor pages; local URLs/assets, same-page anchors, unique IDs, one H1 and canonical per page; 66 unique sitemap URLs.
- JavaScript syntax check for mobile-experience.js.
- Browser at 390px: next/previous 1→2→1, End 14/14 with next disabled, cardiology filter resets to 1/1.
- Booking entry retains Tomakh; intro computed 16px/25.6px; page width and scroll width both 390px.
- Live desktop at 880px: current researched blog titles loaded; no horizontal page overflow.

## Limits
Local static server cannot serve Health24 endpoints. No patient data submitted; no live appointment created. Mobile checks use a browser iframe, not a physical handset. Older unrelated working-tree marketing edits were not included in this publication. Search ranking, real search volume, custom-domain DNS and medical review were not audited in this pass.
