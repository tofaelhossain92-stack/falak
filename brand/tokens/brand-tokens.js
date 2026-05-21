// ─────────────────────────────────────────────
// Falak Brand Tokens
// App: Falak (فَلَك) — Weather & Prayer companion
// Version: 1.0.0
// ─────────────────────────────────────────────

export const colors = {
  // ── Primary palette ──────────────────────────
  primary:        '#5a7fd4',   // Falak Blue — main interactive colour
  primaryDark:    '#3558b8',   // Deep Sky — pressed states, dark variant
  primaryLight:   '#8aaee8',   // Sky Light — disabled, subtle backgrounds

  // ── Accent ───────────────────────────────────
  accent:         '#e8a030',   // Star Gold — Islamic/spiritual elements only
  accentLight:    '#c07818',   // Gold Dark — light mode gold text
  accentSubtle:   'rgba(232,160,48,0.12)', // Gold background tint

  // ── Prayer / Tahajjud ────────────────────────
  prayer:         '#2dd4bf',   // Dawn Teal — prayer tab, Tahajjud card
  prayerDark:     '#0f8f7a',   // Teal Dark — light mode prayer text
  prayerSubtle:   'rgba(45,212,191,0.1)',  // Teal background tint

  // ── Backgrounds ──────────────────────────────
  bgDark:         '#060c1e',   // Night Sky — primary dark background
  bgDarkCard:     'rgba(255,255,255,0.07)', // Card surface on dark
  bgDarkCardHover:'rgba(255,255,255,0.11)', // Card hover on dark
  bgLight:        '#f0f5ff',   // Moonlight — primary light background
  bgLightCard:    '#ffffff',   // Card surface on light
  bgLightCardAlt: '#f5f8ff',   // Alternate card on light

  // ── Text ─────────────────────────────────────
  textDarkPrimary:   '#f0f5ff',              // Primary text on dark
  textDarkSecondary: 'rgba(240,245,255,0.6)',// Secondary text on dark
  textDarkTertiary:  'rgba(240,245,255,0.38)',// Hint text on dark
  textLightPrimary:  '#1a2540',              // Primary text on light
  textLightSecondary:'rgba(26,37,64,0.55)',  // Secondary text on light
  textLightTertiary: 'rgba(26,37,64,0.38)', // Hint text on light

  // ── Borders ──────────────────────────────────
  borderDark:     'rgba(255,255,255,0.1)',   // Card border on dark
  borderLight:    'rgba(26,37,64,0.12)',     // Card border on light

  // ── Semantic ─────────────────────────────────
  success:        '#4ade80',
  warning:        '#f6c94e',
  danger:         '#f87171',
  dangerLight:    '#c0392b',

  // ── Ramadan special ──────────────────────────
  ramadanGold:    '#f6c94e',
  ramadanGoldBg:  'rgba(246,201,78,0.08)',
};

export const fonts = {
  display:  'CormorantGaramond-Light',    // Wordmark, Arabic companion
  serif:    'CormorantGaramond-Regular',  // Verse display
  body:     'DMSans-Regular',             // All UI body text
  medium:   'DMSans-Medium',              // Labels, headings
  light:    'DMSans-Light',               // Taglines, captions
};

export const fontSizes = {
  xs:   10,
  sm:   12,
  md:   14,
  base: 15,
  lg:   17,
  xl:   20,
  '2xl':24,
  '3xl':32,
  '4xl':42,
  display: 56,
};

export const fontWeights = {
  light:   '300',
  regular: '400',
  medium:  '500',
};

export const letterSpacing = {
  tight:  -0.3,
  normal:  0,
  wide:    1,
  wider:   2,
  widest:  4,
};

export const radius = {
  none: 0,
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  '2xl':24,
  full: 9999,
};

export const spacing = {
  '0':  0,
  '1':  4,
  '2':  8,
  '3':  12,
  '4':  16,
  '5':  20,
  '6':  24,
  '8':  32,
  '10': 40,
  '12': 48,
  '16': 64,
};

export const shadows = {
  // React Native shadow props
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const animation = {
  fast:   150,
  normal: 250,
  slow:   400,
};

// ── Convenience: full dark theme object ──────
export const darkTheme = {
  bg:           colors.bgDark,
  bgCard:       colors.bgDarkCard,
  text:         colors.textDarkPrimary,
  textMuted:    colors.textDarkSecondary,
  textHint:     colors.textDarkTertiary,
  border:       colors.borderDark,
  primary:      colors.primary,
  accent:       colors.accent,
  prayer:       colors.prayer,
};

// ── Convenience: full light theme object ─────
export const lightTheme = {
  bg:           colors.bgLight,
  bgCard:       colors.bgLightCard,
  text:         colors.textLightPrimary,
  textMuted:    colors.textLightSecondary,
  textHint:     colors.textLightTertiary,
  border:       colors.borderLight,
  primary:      colors.primaryDark,
  accent:       colors.accentLight,
  prayer:       colors.prayerDark,
};

export default { colors, fonts, fontSizes, fontWeights, radius, spacing, animation, darkTheme, lightTheme };
