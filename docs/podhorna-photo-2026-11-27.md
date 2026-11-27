# Current correction: complete branded card

The user clarified that the full supplied physician card is required, including clinic logo, name and blue information panel, consistent with the other doctors. The portrait-only implementation below is superseded.

Current source crop from `IMG_7111 3.PNG`: x=0, y=177, 1290 × 2293, preserving the whole card and excluding only phone UI. Resized to 1080 × 1920, JPEG quality 90, matching the other physician artwork. No generation, retouching or redrawing. Shared asset and generated dimensions were updated. Current verification/publication record: `output/podhorna-branded-card-2026-11-27/`.

---

# Podhorna portrait replacement — 27 November 2026

Source supplied by the user: `/Users/ivangorkin/Downloads/IMG_7111 3.PNG` (1290 × 2796). Replace only the existing doctor photograph, with no new physician facts.

The portrait is a direct crop at x=430, y=300, 672 × 882, exported as JPEG quality 90 to `dist/assets/doctors/podhorna.jpg`. The existing user preference for an exact photo crop without generation is retained. No face/body alteration, background generation or image expansion was used. The phone UI and text panel are excluded. The original attachment is retained at its original location; a lossless crop is in the local evidence folder.

The homepage, doctor directory and physician profile share that asset. `data/doctors.json` records the new source and dimensions; `scripts/build-doctors.py --doctor podhorna` synchronizes generated profile/directory markup. Stable physician ID, URL, specialties and appointment context are unchanged.

Validation: 78 public pages pass links/assets, H1/canonical and anchor checks; whitespace check passes. Desktop and 390px mobile profile inspected, with natural dimensions 672 × 882 and no horizontal document overflow. No patient data or booking submitted. Screenshots and live publication details are retained in `output/podhorna-photo-2026-11-27/`.
