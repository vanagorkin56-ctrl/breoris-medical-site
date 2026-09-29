---
name: Breoris Medical
description: Calm clinic editorial with real people, open space, and clear appointment requests.
colors:
  blue: "#235b92"
  blue-hover: "#174672"
  deep: "#163c5a"
  ink: "#203b4a"
  muted: "#5b6b75"
  line: "#dce4e7"
  pale: "#f2f6f7"
  white: "#fff"
  doctors-surface: "#f4f7f8"
  statement-surface: "#dbeeee"
  statement-ink: "#204e69"
  heading-muted: "#6992a7"
  focus: "#2a829b"
  field-border: "#bacbd3"
  option-border: "#c1d1d9"
  option-selected: "#e3f0f3"
  outline-border: "#a4b9c6"
  outline-hover: "#e5edef"
  white-hover: "#def2f2"
  error: "#a02828"
  error-surface: "#fff1ef"
  success: "#286958"
  success-surface: "#e1f1ec"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(3rem, 5.8vw, 5.3rem)"
    fontWeight: 500
    lineHeight: 1.07
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-.035em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "21px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-.035em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  caption:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  photo-subtle: "3px"
  field: "7px"
  preview: "8px"
  button: "9px"
  photo: "12px"
  dialog: "16px"
  circle: "50%"
spacing:
  field-gap: "16px"
  compact: "20px"
  mobile-gutter: "24px"
  content-gap: "28px"
  dialog-inset: "36px"
  section-mobile: "68px"
  section-desktop: "104px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "15px 23px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
  button-white:
    backgroundColor: "{colors.white}"
    textColor: "{colors.deep}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "15px 23px"
  button-white-hover:
    backgroundColor: "{colors.white-hover}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "15px 23px"
  button-outline-hover:
    backgroundColor: "{colors.outline-hover}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
  time-option:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 4px"
  booking-preview:
    backgroundColor: "{colors.pale}"
    rounded: "{rounded.preview}"
    padding: "20px"
---

# Design System: Breoris Medical

## Overview

**Creative North Star: "The clinic welcome brochure"**

The clinic welcome brochure is the established visual direction: open editorial grids, large humanist lettering, real clinic photography, white space, and restrained blue controls. One Medical and Neko inform the layout and craft; the supplied Breoris identity and Ukrainian content remain the brand authority.

This document records the completed static prototype, extracted from dist/styles.css, dist/index.html and dist/app.js on 2026-09-29. It captures the implemented system; surface-specific composition remains in .impeccable/surface.md. The supplied logo and factual portraits should retain their original identity.

**Key Characteristics:**

- Large, light-feeling Manrope headings.
- White and pale blue-gray surfaces with deep blue actions.
- Real rectangular photographs and modest rounded controls.
- Fine dividers, visible keyboard focus, and brief state transitions.

## Colors

The palette is cool, quiet and clinical, with deep blue action contrast and turquoise-tinted supporting surfaces. Frontmatter values are normative; contextual overlays and effects are recorded in the sidecar or source CSS.

### Primary

- **Breoris blue:** Primary buttons, active tabs, selected time options and contact banner.
- **Deep blue:** Hero fallback and text on white buttons; the darker hover blue strengthens action feedback.

### Secondary

- **Soft turquoise:** The statement surface and selected channel background provide gentle emphasis. The source also declares an aqua custom property, but no CSS rule currently consumes it; it is not an active UI primitive.

### Neutral

- **Ink and muted slate:** Main text and supporting labels respectively.
- **White and pale blue-gray:** Primary canvas and alternating service, doctor and preview surfaces.
- **Fine gray-blue lines:** Section, row and field boundaries.
- **Muted heading blue:** Secondary phrase in the introductory heading.
- **Error and success pairs:** Reserved for validation and the demonstration receipt indicator.

## Typography

**Display and Body Font:** Manrope, with Arial and sans-serif fallbacks. There is no separate display or mono family. Weight and space establish hierarchy.

### Hierarchy

- **Display:** The fluid hero style in frontmatter, with compact tracking and balanced wrapping. At 760px and below it becomes `clamp(2.65rem, 9.8vw, 4rem)` with line height 1.1; at 360px and below it is 40px.
- **Headline:** Fluid section headings. Feature and location headings use smaller local clamps; booking headings are 30px, becoming 26px on mobile.
- **Title:** Doctor names use the frontmatter title role; they reduce to 18px at 1000px and 17px at 760px.
- **Body:** Detailed paragraphs are generally 14px with generous line height. Introductory copy is 17px and hero supporting copy 18px, reducing to 15px on mobile. There is no global character-count limit; the intro copy has a 570px maximum width.
- **Label and caption:** Controls generally use 14px semibold; supporting labels and metadata use 12–13px. Ukrainian sentence case is retained.

## Layout

Desktop sections use 104px vertical spacing and `max(5vw, 24px)` side gutters. Above 1600px, gutters also center a 1420px content measure. The layout alternates asymmetric two-column editorial sections, three-column service lists and three-column physician grids. Doctor grid gaps are 44px vertically and 28px horizontally.

At 1000px, column gaps and heading sizes tighten. At 760px, most editorial sections stack, section spacing becomes 68px by 24px, and service and physician grids retain two columns. At 360px those two grids become one column and section gutters reduce to 20px. No horizontal card carousel is implemented.

The sticky header is 104px high on desktop and 82px on mobile. Navigation collapses into a vertical menu below 760px; the phone disappears below 1100px. A mobile booking bar is fixed to the bottom with safe-area padding and extra footer clearance. Anchor offsets are 110px desktop and 86px mobile.

## Elevation & Depth

Content is predominantly flat. Pale section fills, photography and thin dividers establish hierarchy. Shadows are reserved for mobile navigation, the fixed booking bar, dialogs and a photograph caption. The desktop header uses translucent white and 18px backdrop blur; reduced transparency replaces it with solid white. Dialog backdrops use a dark blue translucent fill and 5px blur.

### Shadow Vocabulary

- **Dialog:** `0 22px 100px #0b243e40`.
- **Mobile navigation:** `0 12px 20px #183b4f10`.
- **Mobile booking bar:** `0 -4px 22px #203b4a12`.
- **Photograph caption:** `text-shadow: 0 2px 5px #000`.

## Shapes

Images are rectangular: the clinic detail photo has a slight corner, while feature photos, doctor portraits and the map use the photo radius. Buttons use the button radius; fields and time options use the field radius. Dialog corners soften further on desktop and use the photo radius on mobile. Circular arrow and close controls provide small local accents. Dividers are normally 1px; selected tabs use a 2px underline.

Interface icons are inline, current-color SVG strokes. Standard icons are 20px, button arrows 22px, profile arrows 19px, social/footer arrows 15px and the success check 26px. Accordion plus/minus marks are two CSS strokes, avoiding font-dependent symbols.

## Components

### Buttons

Restrained, legible actions. Primary, white and outline variants share 15px by 23px padding, a 30px content gap and a 52px minimum height. The general minimum becomes 48px on mobile; header and bottom-bar controls have compact local sizes. Background and press transitions take 0.2s; pressing scales to 0.98. Disabled buttons use 0.45 opacity and a blocked cursor. Hover colors are in frontmatter. All keyboard controls retain a 3px focus outline with a 5px offset.

### Inputs / Fields

White fields use a 1px field border, field radius, 12px by 14px padding and 50px minimum height. Default text is 15px; booking fields are 16px, with booking selects reduced to 14px on mobile. Labels remain above fields. Validation displays a pale red message with dark red text and moves focus to the offending control. No distinct per-field invalid border is implemented.

### Chips / Time options

Time choices are compact rectangular buttons in a four-column grid with 10px gaps and a 46px minimum height. `aria-pressed=true` changes the background and border to blue and the text to white. Contact channels are native radios beneath styled labels; checked labels use the selected channel surface and blue border. Their keyboard focus is drawn on the visible label at a 3px offset.

### Cards / Containers

Doctor cards are unboxed: an image button, name, specialty and underlined booking action. Portraits use a 1.06 aspect ratio desktop, 0.83 on mobile, and 1.08 at the narrowest breakpoint; images crop from the top center. Hover scales the portrait to 1.035 over 0.45s with `cubic-bezier(.16, 1, .3, 1)`. A white circular arrow sits at the lower right. Booking preview containers use a pale surface and 20px inset, reducing to 16px on mobile.

### Navigation

Desktop links are 14px with 28px gaps and a thin underline that grows from the left over 0.2s on hover. The mobile menu uses a labeled toggle with expanded state. Service and feature tabs use muted labels; selected labels become blue and bold with a growing 2px underline over 0.25s. Arrow keys, Home and End move tab selection and focus.

### Service rows and disclosure

Services use flat, divided rows with a label and northeast arrow. Desktop rows have 22px vertical padding and 17px text; mobile rows use 14px text and an 80px minimum height. Hover turns the label blue and moves the arrow 3px up and right. Additional services use native disclosure sections with a trailing plus that becomes a minus when open.

### Dialogs and booking

Native dialogs preserve keyboard behavior. The general dialog is at most 900px wide; booking is at most 650px. Both scroll inside the viewport. The booking header and body use dividers, restrained spacing and a three-step progress label; the active step is blue and bold. Requested service or doctor carries into the form. Closing clears entered form data. The receipt is visibly a demonstration and retains an explicit confirmation status.

Content changes fade from 0.6 opacity and rise 8px over 0.28s with `cubic-bezier(.16, 1, .3, 1)`. Reduced motion disables transitions and animations and switches root smooth scrolling to auto.

## Do's and Don'ts

### Do:

- Do retain the supplied Breoris identity and real clinic and physician imagery.
- Do use blue for actions and selected states, with pale surfaces separating major sections.
- Do keep Ukrainian labels readable and preserve visible keyboard focus.
- Do honor reduced motion and reduced transparency preferences.
- Do keep service, doctor and appointment context continuous between views.

### Don't:

- Don't turn the open service lists into raised tile grids.
- Don't add decorative shadows to ordinary content cards.
- Don't replace interface icons with platform-dependent text glyphs.
- Don't present a requested time or a demonstration receipt as a confirmed appointment.
