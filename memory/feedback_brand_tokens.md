---
name: feedback-brand-tokens
description: All UI colours must come from brand/tokens/brand-tokens.js — never hardcode hex values in components
metadata:
  type: feedback
---

Every UI component must import and use only colours (and other design tokens) from `brand/tokens/brand-tokens.js`. No raw hex values, rgba literals, or named colours are permitted in component files.

**Why:** User explicitly set this rule before any component work began — enforces design system consistency for the Falak app.

**How to apply:** On every component edit or creation, verify all colour references resolve to `colors.*`, `darkTheme.*`, or `lightTheme.*` from brand-tokens. Same rule applies to spacing, fontSizes, radius, shadows, and animation — always use the token, never a magic number.
