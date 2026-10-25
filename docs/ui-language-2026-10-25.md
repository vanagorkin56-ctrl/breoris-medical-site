# Public languages and icon refinements — 2026-10-25

- Homepage public locale options: Ukrainian (UA) and English (EN). Russian and invalid legacy URL locales normalize to Ukrainian while keeping the anchor; a stored Russian preference also falls back to Ukrainian. Existing internal legacy dictionaries are unreachable through supported language selection.
- Removed Russian hreflang and language discovery link. Updated llms.txt to describe the current appointment flow.
- Applied emil-design-eng guidance: consistent 52px carousel controls, 120ms press feedback, visible focus, pointer-specific hover and reduced-motion support.
- Shared Tabler outline icons for service categories, search, carousel navigation and card arrows. Source: https://github.com/tabler/tabler-icons. MIT license preserved in dist/assets/ui/tabler/LICENSE.
- Shared styling is included in doctor, service and blog pages, and preserved by generation helpers.

## Verification

- Local legacy ?lang=ru URL normalized to ?lang=uk, retaining #poslugi.
- UA/EN selector contains exactly two options; English selection updates page language and content.
- Mobile doctor next arrow advances to 2/14 and previous returns to first card; native swipe behavior remains.
- Static checks: 55 home/service/blog pages have valid local assets, links, anchors, one H1 and canonical; sitemap contains 66 unique URLs. All 65 nested Ukrainian pages include shared styling exactly once. CSS icon assets resolve locally. JavaScript syntax checked.
- No hero media, Health24 API or booking data changes.
