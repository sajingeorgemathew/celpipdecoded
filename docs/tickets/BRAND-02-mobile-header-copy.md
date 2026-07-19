# BRAND-02 - Mobile Landing Header and Canadian Spelling Fix

## Goal

Fix the CELPIP Decoded landing-page header on small mobile screens and standardize visible user-facing copy from "practicing" to "practising".

## Mobile-header issue

The current landing header overflows on narrow screens.

Observed problems:

- The full horizontal CELPIP Decoded logo uses too much width.
- Additional navigation content becomes partially visible or duplicated.
- The Get started button wraps onto two lines.
- The mobile menu icon is pushed too close to the edge.
- The header creates horizontal overflow.

## Required mobile behaviour

On small screens:

- Show only one compact CELPIP Decoded brand treatment.
- Prefer the compact BrandMark or a deliberately shortened lockup.
- Do not show a second logo or partially visible navigation label.
- Hide desktop navigation links.
- Keep the mobile menu button fully visible.
- Keep the Get started button on one line.
- Use a shorter mobile CTA label only if necessary, such as "Start".
- Maintain a minimum touch target of approximately 44 pixels.
- Use sensible horizontal padding.
- Do not create horizontal scrolling.
- Do not let the CTA overlap the logo or menu button.

Recommended mobile order:

1. Compact brand mark or compact logo
2. Get started or Start CTA
3. Menu button

Desktop and tablet layouts should retain the full CELPIP Decoded horizontal logo and normal navigation.

## Responsive requirements

Test at minimum:

- 320px
- 360px
- 375px
- 390px
- 430px
- 768px
- Desktop width

At 320px, all header controls must fit within the viewport.

## Copy correction

Search active user-facing application source for:

- practicing
- Practicing

Change visible user-facing Canadian English copy to:

- practising
- Practising

Do not blindly rename:

- Variable names
- Function names
- Database fields
- Routes
- Slugs
- External API payloads
- Historical migrations
- Historical ticket documentation

Only update active user-facing copy and relevant current documentation where safe.

Do not change the spelling inside quoted third-party content unless it is CELPIP Decoded-authored interface copy.

## Scope

Likely files include:

- src/components/landing/LandingHeader.tsx
- Related responsive CSS or utility classes
- Active landing-page copy
- Active dashboard or module copy containing "practicing"

Inspect the actual source before editing.

## Brand requirements

Continue using:

- Ink navy #12314F
- Emerald-teal #0E9F6E
- Warm off-white #F4F1EA
- Existing BrandMark and BrandLogo components

Do not redesign the full brand or navigation.

## Accessibility

- Mobile menu button must have an accessible label.
- CTA must remain keyboard accessible.
- Focus states must remain visible.
- Do not use colour alone to communicate state.
- Do not reduce tap targets below practical mobile size.

## Validation

Run:

- npm run lint
- npm run build
- git diff --check

Manually verify:

- No horizontal scrolling on mobile
- Only one logo treatment appears
- Get started or Start stays on one line
- Menu icon remains fully visible
- Desktop navigation remains unchanged
- User-facing copy uses "practising"
- No routes, schemas, migrations, or database names changed

## Done criteria

- Mobile landing header fits at 320px
- CTA does not wrap
- Header does not overflow
- No duplicate or clipped logo/navigation content
- Mobile menu remains usable
- Active user-facing "practicing" copy is changed to "practising"
- npm run lint passes
- npm run build passes
- git diff --check passes
