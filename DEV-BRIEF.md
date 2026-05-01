# Cody Drug Rx — Website Development Brief (v2)

## Project Overview

We are building a high-end, visually dramatic website for **Cody Drug Rx**, a compounding pharmacy. The site's primary purpose is **brand credibility and provider acquisition** — it should make a statement about legitimacy and attention to detail. It is NOT a core business tool; it's a visual hub that funnels users to external portals.

**Live mockup:** https://beige-wallaby-234485.hostingersite.com/
**Design reference sites:** https://wearestokt.com/ (vibe), https://www.farmminerals.com/ (flow/function)

---

## Brand Guidelines

- **Primary colors:** Black and white
- **Accent colors:** Red (#E50914 / #d32020) and Cyan (#00f2fe)
- **Background direction:** BRIGHTER — moving away from near-black. Clean, bright backgrounds with the product as the hero focal point.
- **Typography:** Playfair Display (headings), Inter (body)
- **Design philosophy:** "Integrated movement" — the brand's color and energy should live *inside* the product, not layered on top. Think luxury pharmaceutical meets editorial fashion. Bright, confident, airy — not dark and moody.

---

## MAJOR DESIGN PIVOT — Hero Section

**The 3D vial model has been replaced with scroll-driven PNG sequence animations.** Two separate video sequences (converted from MP4 to WebP frame sequences at 15fps) drive the hero and mid-page visuals:

- **Sequence 1 (vial-fall-2, 88 frames):** Hero background — plays as the user scrolls through the top section. Located at `/public/assets/vial-fall-2/`. Height: 180vh for faster playback.
- **Sequence 2 (vial-fall-1, 89 frames, starts at frame 40):** Mid-page cinematic moment between Dot Matrix Banner and Expert Care. Located at `/public/assets/vial-fall-1/`. Height: 450vh. Starts hidden behind the section above and is revealed as user scrolls. Has scroll-driven zoom effect that continues even after frames end. Text overlays ("PRECISION COMPOUNDING" / "PERSONALIZED MEDICINE") animate letter-by-letter on top of the video, flanking the vial.
- **Three.js has been completely removed** from the build — JS bundle went from 1,388KB to 352KB.
- The **cyan (#00f2fe)** accent appears in the treatment animation alongside red and green.

---

## Site Architecture

| Page | Sub-pages/Details |
|------|-------------------|
| **Home** | Hero with scroll-driven video sequences, service panels, treatment animation, provider/patient funnel |
| **About Us** | Services (Compounding, Vaccines, MedSync), Careers, Events, Licenses |
| **Providers** | Provider Portal, Price List (flip-through or printable PDF) |
| **Resources** | Blog/educational content |
| **Products** | Supplements (Shopify integration), Compounds |
| **Contact** | Contact form, location info |

**Top-level buttons (redirects):**
- Provider Portal → https://portal.codydrugrx.com/
- Live Rx Consult → telehealth link
- Refill → redirect to RxLocal

---

## Home Page — Current Section Layout (Top to Bottom)

### 1. Hero Section (Scroll-Driven PNG Sequence)
- **Scroll-driven video sequence** (88 WebP frames) as the hero background — brighter aesthetic, vial as centerpiece
- Overlay content sits on top via negative margin technique
- **Overlay:** "Cody Drug Rx" branding (top right), black subtitle text, two CTA buttons with hard drop-shadow style (red front, white shadow behind)
- "Compounded for You" heading (bottom left)
- Glass data panels (Formulation ID, Synthesis Progress) that hide on scroll
- Drop-down chevron menu (top right) for navigation

### 2. Red Carousel Banner
- Full-width red background with scrolling white text: "Specialty Medications · Custom Compounding · Prescription Delivery · Quality Assurance"
- Hard white drop-shadow on text
- CSS infinite scroll animation

### 3. Three Service Panels (Black / White / Red cards)
- "Precision in Every Dose" (black card with vial image)
- "Advanced Rx Formulations" (white card with vial image, red CTA)
- "Contact & Services" (red card with contact info)
- Scroll-triggered fade-in animations with staggered delays
- Rounded corners, 8px border-radius

### 4. Two-Panel Section (Black + Red)
- Left: full-bleed product photography on black background
- Right: red light therapy image with overlay text ("The Future of Skin Wellness"), eyebrow label, body copy, white CTA
- Seamless — no gaps/margins between panels or adjacent sections

### 5. Dot Matrix Banner
- Canvas-based dot grid (180px tall)
- "Cody Drug Rx" text revealed as dots shrink on hover
- Red accent dots scattered throughout
- Scroll-triggered wave-in animation

### 6. Scroll Sequence 2 + Text Reveal
- Second PNG sequence (89 frames, starts at frame 40) with scroll-driven playback
- Starts hidden behind the section above, revealed as you scroll
- "PRECISION COMPOUNDING" (left, black+red) and "PERSONALIZED MEDICINE" (right, red+black) animate letter-by-letter over the video
- Continuous zoom effect that persists even after frames end
- Expert Care section slides on top with parallax overlap (margin-top: -60vh)

### 7. Expert Care & Wellness Solutions (3-column panel)
- Left: dark background with pharmacy image, service bullet list
- Middle: white panel with feature icons (Medication Management, Wellness Screenings), black CTA
- Right: dark panel with doctor portrait, red CTA

### 8. Red Icon Showcase
- Full-width red (#b81c1c) background
- 4 white line icons: Specialty Medications, Custom Compounding, Prescription Delivery, Quality Assurance
- Top box-shadow for depth separation

### 9. Treatment Animation (CSS/JS)
- Cycles through 3 drug types: **Semaglutide (red), Tirzepatide (cyan), Lipo-B (green)**
- Animated dropper fills vial → pulse travels connection line → person silhouette transforms
- 6-second loop per cycle, slows to 0.25x on hover
- Dynamic color theming via CSS custom properties

### 10. Dot Matrix Interactive Section
- Large canvas dot grid with hover ripple effect

### 11. Process Steps
- Numbered steps: Consultation, Formulation, Delivery, Support
- Scroll-triggered staggered animations

---

## Color System

| Color | Hex | Usage |
|-------|-----|-------|
| **Black** | #09090b / #0a0a0a | Primary backgrounds, text on light |
| **White** | #ffffff | Primary backgrounds (brighter direction), text on dark |
| **Red** | #E50914 / #d32020 | Accent — CTAs, highlights, Semaglutide branding, energy |
| **Cyan** | #00f2fe | Accent — Tirzepatide branding, secondary energy, UI highlights |
| **Green** | #20d366 | Tertiary — Lipo-B branding, success states |

---

## Key Technical Details

- **Stack:** React 18, Vite 8
- **Animation:** Framer Motion for scroll/reveal, CSS keyframes for treatment animation, requestAnimationFrame for dot matrix canvas and scroll sequences
- **Images:** All WebP format for performance
- **Hero:** Scroll-driven PNG sequence (no Three.js — significantly lighter)
- **ScrollSequence component** supports: `totalFrames`, `framePath`, `height`, `startFrame`, `endFrame`, `triggerMode` ("viewport" or "top"), `sticky`, render-prop `children` for overlays, and `onProgress` callback
- **Previous 3D assets:** GLB model files retained as backup in `/public/models/`
- **Build output:** ~352KB JS (gzipped ~109KB)

---

## Lillian's Critical Feedback (Must Address)

1. **REMOVE** the scrolling logo banner — cannot share provider info publicly
2. **REMOVE** the phrases "Compounded for You" and "CodyDrugRx" standalone branding (feels unnecessary)
3. **REMOVE** full-color pictures/icons that look off-brand
4. **Navigation:** Side menu NOT preferred due to sub-menu depth. If kept, must be a slide-out bar like FarmMinerals. Consider a traditional top nav.
5. **Animations must be EVERGREEN** — use neutral/generic vials, not product-specific ones that become obsolete
6. **Primary CTA:** Sign up as a provider (portal) and Learn More (blog)
7. **User funnel:** Immediate Provider vs. Patient path on landing
8. **Color balance:** Primary = black & white, red & cyan = accent only
9. **Brighter overall aesthetic** — moving away from all-dark design

---

## Key Functions Still Needed

- [ ] Live chat integration (connects to Microsoft Teams)
- [ ] Shopify reflection for supplements
- [ ] Searchable inventory (open to suggestions)
- [ ] Email signup
- [ ] Provider Portal redirect button
- [ ] Telehealth (Live Rx Consult) redirect
- [ ] RxLocal refill redirect
- [ ] Provider/Patient funnel on homepage
- [ ] Price list page (flip-through or printable PDF)
- [ ] All sub-pages (About, Providers, Resources, Products, Contact, Events, Licenses, Careers)

---

## Design Direction Summary

Think: **Aesop meets clinical luxury, but BRIGHT.** Clean, airy hero with cinematic scroll-driven product videos as the focal point. Bright white backgrounds balanced with dark sections for contrast. Red and cyan used as energetic accents — never overwhelming. Typography is editorial and confident. Every element reinforces that this is a serious, high-end pharmacy. Movement should feel integrated and intentional, not decorative. The product lives at the center of the visual narrative.
