import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSizes, radius, spacing } from '../../brand/tokens/brand-tokens';

// ── Islamic events ────────────────────────────────────────────────
const EVENTS = [
  { icon: '🕋', name: 'Dhul Hijjah begins',  date: 'Jun 28',  detail: '9 blessed days' },
  { icon: '🌙', name: 'Day of Arafah',        date: 'Jun 5',   detail: 'Fast recommended' },
  { icon: '🎉', name: 'Eid al-Adha',          date: 'Jun 6',   detail: 'Takbeer from Fajr' },
  { icon: '⭐', name: 'Islamic New Year 1449', date: 'Jun 26',  detail: '1 Muharram' },
  { icon: '🌟', name: 'Ashura',               date: 'Jul 5',   detail: 'Fast recommended' },
];

// ── Settings state ────────────────────────────────────────────────
type Settings = {
  prayerReminders: boolean;
  tahajjudAlarm: boolean;
  aiSuggestions: boolean;
  quranReflections: boolean;
  weatherBriefings: boolean;
  darkMode: boolean;
};

// ── Link row component ────────────────────────────────────────────
function LinkRow({ icon, label, value, onPress, danger }: {
  icon: string; label: string; value?: string;
  onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={s.linkRow} onPress={onPress}>
      <Text style={s.linkIcon}>{icon}</Text>
      <Text style={[s.linkLabel, danger && s.linkLabelDanger]}>{label}</Text>
      {value ? (
        <Text style={s.linkValue}>{value}</Text>
      ) : (
        <Text style={s.linkChevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Toggle row component ──────────────────────────────────────────
function ToggleRow({ icon, label, value, onToggle }: {
  icon: string; label: string;
  value: boolean; onToggle: () => void;
}) {
  return (
    <View style={s.linkRow}>
      <Text style={s.linkIcon}>{icon}</Text>
      <Text style={s.linkLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.borderDark, true: `${colors.primary}80` }}
        thumbColor={value ? colors.primary : colors.textDarkTertiary}
        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
      />
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function MoreScreen() {
  const [settings, setSettings] = useState<Settings>({
    prayerReminders:   true,
    tahajjudAlarm:     true,
    aiSuggestions:     true,
    quranReflections:  true,
    weatherBriefings:  true,
    darkMode:          true,
  });

  const toggle = (key: keyof Settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const soon = (feature: string) =>
    Alert.alert('Coming soon', `${feature} will be available in a future update.`);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <Text style={s.screenTitle}>More</Text>
        </View>

        {/* ── Profile card ── */}
        <View style={s.profileCard}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>TA</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>Tofael Ahmed</Text>
            <Text style={s.profileEmail}>tofael@email.com</Text>
            <View style={s.profileBadges}>
              <View style={s.badge}>
                <Text style={s.badgeText}>📍 Edmonton, CA</Text>
              </View>
              <View style={[s.badge, s.badgeTeal]}>
                <Text style={[s.badgeText, s.badgeTextTeal]}>ISNA · Hanafi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Prayer streak ── */}
        <View style={s.streakRow}>
          <View style={s.streakItem}>
            <Text style={[s.streakNum, { color: colors.accent }]}>14</Text>
            <Text style={s.streakLabel}>Day streak</Text>
          </View>
          <View style={s.streakDivider} />
          <View style={s.streakItem}>
            <Text style={[s.streakNum, { color: '#4ade80' }]}>87%</Text>
            <Text style={s.streakLabel}>This month</Text>
          </View>
          <View style={s.streakDivider} />
          <View style={s.streakItem}>
            <Text style={[s.streakNum, { color: colors.primary }]}>312</Text>
            <Text style={s.streakLabel}>Total prayers</Text>
          </View>
        </View>

        {/* ── Quick grid ── */}
        <View style={s.quickGrid}>
          <TouchableOpacity style={s.quickCard} onPress={() => soon('Account')}>
            <Text style={s.quickIcon}>👤</Text>
            <Text style={s.quickTitle}>My account</Text>
            <Text style={s.quickSub}>Profile & streak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.quickCard, s.quickCardTeal]} onPress={() => soon('Reminders')}>
            <Text style={s.quickIcon}>🔔</Text>
            <Text style={s.quickTitle}>Reminders</Text>
            <Text style={s.quickSub}>All notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.quickCard, s.quickCardGold]} onPress={() => soon('Islamic Calendar')}>
            <Text style={s.quickIcon}>📅</Text>
            <Text style={s.quickTitle}>Islamic calendar</Text>
            <Text style={s.quickSub}>Events & dates</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.quickCard} onPress={() => soon('Settings')}>
            <Text style={s.quickIcon}>⚙️</Text>
            <Text style={s.quickTitle}>Settings</Text>
            <Text style={s.quickSub}>App preferences</Text>
          </TouchableOpacity>
        </View>

        {/* ── Upcoming Islamic events ── */}
        <Text style={s.sectionLabel}>Upcoming Islamic events</Text>
        <View style={s.card}>
          {EVENTS.map((event, i) => (
            <View key={i} style={[s.eventRow, i === EVENTS.length - 1 && s.eventRowLast]}>
              <Text style={s.eventIcon}>{event.icon}</Text>
              <View style={s.eventBody}>
                <Text style={s.eventName}>{event.name}</Text>
                <Text style={s.eventDetail}>{event.detail}</Text>
              </View>
              <Text style={s.eventDate}>{event.date}</Text>
            </View>
          ))}
        </View>

        {/* ── Prayer settings ── */}
        <Text style={s.sectionLabel}>Prayer</Text>
        <View style={s.card}>
          <LinkRow icon="🕌" label="Calculation method" value="ISNA"    onPress={() => soon('Calculation method')} />
          <LinkRow icon="📿" label="Asr method"          value="Hanafi"  onPress={() => soon('Asr method')} />
          <LinkRow icon="📅" label="Hijri date offset"   value="+0 days" onPress={() => soon('Hijri offset')} />
          <LinkRow icon="🌅" label="Show Sunrise"        value=""        onPress={() => soon('Sunrise')} />
        </View>

        {/* ── Reminders ── */}
        <Text style={s.sectionLabel}>Reminders</Text>
        <View style={s.card}>
          <ToggleRow icon="🔔" label="Prayer reminders"   value={settings.prayerReminders}  onToggle={() => toggle('prayerReminders')} />
          <ToggleRow icon="🌌" label="Tahajjud alarm"      value={settings.tahajjudAlarm}     onToggle={() => toggle('tahajjudAlarm')} />
          <LinkRow   icon="🔊" label="Adhan sound"        value="Soft nasheed" onPress={() => soon('Adhan sound')} />
          <LinkRow   icon="⏰" label="Advance notice"     value="10 min"       onPress={() => soon('Advance notice')} />
        </View>

        {/* ── AI features ── */}
        <Text style={s.sectionLabel}>AI features</Text>
        <View style={s.card}>
          <ToggleRow icon="✨" label="AI suggestions"      value={settings.aiSuggestions}    onToggle={() => toggle('aiSuggestions')} />
          <ToggleRow icon="📖" label="Quran reflections"   value={settings.quranReflections} onToggle={() => toggle('quranReflections')} />
          <ToggleRow icon="🌤️" label="Weather briefings"   value={settings.weatherBriefings} onToggle={() => toggle('weatherBriefings')} />
        </View>

        {/* ── App settings ── */}
        <Text style={s.sectionLabel}>App</Text>
        <View style={s.card}>
          <LinkRow icon="🌙" label="Theme"              value="Auto (dark)" onPress={() => soon('Theme')} />
          <LinkRow icon="🌡️" label="Temperature unit"  value="°C"          onPress={() => soon('Temperature')} />
          <LinkRow icon="🌐" label="Language"           value="English"     onPress={() => soon('Language')} />
        </View>

        {/* ── Legal ── */}
        <Text style={s.sectionLabel}>Legal & info</Text>
        <View style={s.card}>
          <LinkRow icon="📄" label="Terms of service"    onPress={() => soon('Terms of service')} />
          <LinkRow icon="🔒" label="Privacy policy"      onPress={() => soon('Privacy policy')} />
          <LinkRow icon="🛡️" label="Data & permissions"  onPress={() => soon('Data & permissions')} />
          <LinkRow icon="📋" label="Open source licenses" onPress={() => soon('Licenses')} />
          <LinkRow icon="ℹ️" label="About Falak"         value="v1.0.0" onPress={() => soon('About')} />
        </View>

        {/* ── Support ── */}
        <Text style={s.sectionLabel}>Support</Text>
        <View style={s.card}>
          <LinkRow icon="❓" label="Help & FAQ"     onPress={() => soon('Help')} />
          <LinkRow icon="💬" label="Send feedback"  onPress={() => soon('Feedback')} />
          <LinkRow icon="⭐" label="Rate the app"   onPress={() => soon('Rate')} />
        </View>

        {/* ── Account actions ── */}
        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.card}>
          <LinkRow icon="🚪" label="Sign out"       onPress={() => Alert.alert('Sign out', 'Sign out functionality coming soon.')} />
          <LinkRow icon="🗑️" label="Delete account" onPress={() => Alert.alert('Delete account', 'This action is permanent. Coming soon.')} danger />
        </View>

        {/* ── Prayer times disclaimer ── */}
        <View style={s.disclaimerCard}>
          <Text style={s.disclaimerTitle}>⚠️ Prayer times disclaimer</Text>
          <Text style={s.disclaimerText}>
            Prayer times are calculated using standard astronomical methods. Always verify with your local mosque for official times, especially for Jumu'ah and during Ramadan.
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerArabic}>جزاكم الله خيرًا</Text>
          <Text style={s.footerText}>Made with 🤍 for the Muslim community</Text>
          <Text style={s.footerSub}>Falak · فَلَك · v1.0.0</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },

  // Top bar
  topBar: {
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  screenTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },

  // Profile
  profileCard: {
    backgroundColor: `${colors.primary}0d`,
    borderWidth: 0.5,
    borderColor: `${colors.primary}30`,
    borderRadius: radius.lg,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[3],
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}25`,
    borderWidth: 1.5,
    borderColor: `${colors.primary}45`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  profileEmail: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    marginTop: 2,
    fontFamily: fonts.body,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: `${colors.accent}15`,
    borderWidth: 0.5,
    borderColor: `${colors.accent}30`,
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
  },
  badgeTeal: {
    backgroundColor: `${colors.prayer}12`,
    borderColor: `${colors.prayer}28`,
  },
  badgeText: {
    fontSize: 10,
    color: colors.accent,
    fontFamily: fonts.body,
  },
  badgeTextTeal: {
    color: colors.prayer,
  },

  // Streak row
  streakRow: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing[4],
  },
  streakItem: {
    alignItems: 'center',
  },
  streakNum: {
    fontSize: fontSizes['2xl'],
    fontWeight: '300',
    fontFamily: fonts.light,
  },
  streakLabel: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 2,
    fontFamily: fonts.body,
  },
  streakDivider: {
    width: 0.5,
    backgroundColor: colors.borderDark,
  },

  // Quick grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  quickCard: {
    width: '48%',
    backgroundColor: `${colors.primary}0a`,
    borderWidth: 0.5,
    borderColor: `${colors.primary}22`,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  quickCardTeal: {
    backgroundColor: `${colors.prayer}08`,
    borderColor: `${colors.prayer}20`,
  },
  quickCardGold: {
    backgroundColor: `${colors.accent}08`,
    borderColor: `${colors.accent}20`,
  },
  quickIcon: {
    fontSize: 22,
    marginBottom: spacing[2],
  },
  quickTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  quickSub: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 2,
    fontFamily: fonts.body,
  },

  // Section label
  sectionLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    color: colors.textDarkTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[2],
    marginTop: spacing[4],
    fontFamily: fonts.medium,
  },

  // Card
  card: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },

  // Link row
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderDark,
    gap: spacing[3],
  },
  linkIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  linkLabel: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.textDarkPrimary,
    fontFamily: fonts.body,
  },
  linkLabelDanger: {
    color: '#f87171',
  },
  linkValue: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    fontFamily: fonts.body,
  },
  linkChevron: {
    fontSize: 18,
    color: colors.textDarkTertiary,
  },

  // Events
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderDark,
    gap: spacing[3],
  },
  eventRowLast: {
    borderBottomWidth: 0,
  },
  eventIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  eventBody: {
    flex: 1,
  },
  eventName: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  eventDetail: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 1,
    fontFamily: fonts.body,
  },
  eventDate: {
    fontSize: fontSizes.sm,
    color: colors.accent,
    fontFamily: fonts.medium,
  },

  // Disclaimer
  disclaimerCard: {
    backgroundColor: `${colors.accent}08`,
    borderWidth: 0.5,
    borderColor: `${colors.accent}20`,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  disclaimerTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.accent,
    marginBottom: spacing[2],
    fontFamily: fonts.medium,
  },
  disclaimerText: {
    fontSize: fontSizes.sm,
    color: `${colors.accent}cc`,
    lineHeight: 20,
    fontFamily: fonts.body,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  footerArabic: {
    fontSize: fontSizes.md,
    color: colors.textDarkSecondary,
    fontFamily: fonts.serif,
  },
  footerText: {
    fontSize: fontSizes.sm,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
  },
  footerSub: {
    fontSize: fontSizes.xs,
    color: `${colors.textDarkTertiary}80`,
    fontFamily: fonts.body,
  },
});
