

## Plan: Add Hero Carousel to Email Business Landing Page

### What
Add a hero carousel (same style as the Website page) to the top of the Email Business landing page (`step === 0`), with 3 slides focused on professional email creation for drivers.

### How

**1. Reuse the existing `website-slide-*.jpg` assets** (or the same pattern) with email-themed slide content:
- Slide 1: "Seu E-mail Profissional" — credibility and authority messaging
- Slide 2: "Passe Confiança para Hotéis e Empresas" — professional image
- Slide 3: "Saia do Gmail Comum" — differentiation and branding

**2. Create `EmailHeroCarousel` component** inside `src/pages/EmailBusiness.tsx`:
- Same structure as `WebsiteHeroCarousel` in Website.tsx (auto-play every 6s, prev/next arrows, dot indicators, gradient overlay with title + subtitle)
- Use the same 3 website slide images as background (they're generic luxury transport photos that work for both contexts)

**3. Insert the carousel** at the top of the landing page section (inside `step === 0`, before the badge/title/benefits), replacing the current static header with the carousel followed by the existing plan cards and CTA.

### Files to edit
- `src/pages/EmailBusiness.tsx` — add `EMAIL_SLIDES` constant, `EmailHeroCarousel` component, and render it at the top of the landing view

