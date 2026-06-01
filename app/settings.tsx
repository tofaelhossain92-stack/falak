import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radius, spacing } from '../brand/tokens/brand-tokens';

// ── Types ─────────────────────────────────────────────────────────
interface Settings {
  calculationMethod: string;
  asrMethod:         string;
  hijriOffset:       number;
  showSunrise:       boolean;
  temperatureUnit:   string;
  theme:             string;
  language:          string;
  arabicNumerals:    boolean;
  aiSuggestions:     boolean;
  quranReflections:  boolean;
  weatherBriefings:  boolean;
}

const DEFAULT_SETTINGS: Settings = {
  calculationMethod: 'ISNA',
  asrMethod:         'Hanafi',
  hijriOffset:       0,
  showSunrise:       true,
  temperatureUnit:   '°C',
  theme:             'Dark',
  language:          'English',
  arabicNumerals:    false,
  aiSuggestions:     true,
  quranReflections:  true,
  weatherBriefings:  true,
};

// ── Section label ─────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return <Text style={s.sectionLabel}>{title}</Text>;
}

// ── Link row ──────────────────────────────────────────────────────
function LinkRow({ icon, label, value, onPress }: {
  icon: string; label: string; value?: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress}>
      <Text style={s.rowIcon}>{icon}</Text>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// ── Toggle row ────────────────────────────────────────────────────
function ToggleRow({ icon, label, value, onToggle }: {
  icon: string; label: string; value: boolean; onToggle: () => void;
}) {
  return (
    <View style={s.row}>
      <Text style={s.rowIcon}>{icon}</Text>
      <Text style={s.rowLabel}>{label}</Text>
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

// ── Picker modal helper ───────────────────────────────────────────
function showPicker(title: string, options: string[], current: string, onSelect: (v: string) => void) {
  Alert.alert(
    title,
    `Current: ${current}`,
    [
      ...options.map(opt => ({
        text: opt === current ? `✓ ${opt}` : opt,
        onPress: () => onSelect(opt),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]
  );
}

// ── Main component ────────────────────────────────────────────────
export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const update = (key: keyof Settings, value: any) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const toggle = (key: keyof Settings) =>
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Settings</Text>
        </View>

        {/* Prayer */}
        <SectionLabel title="Prayer" />
        <View style={s.card}>
          <LinkRow
            icon="🕌" label="Calculation method"
            value={settings.calculationMethod}
            onPress={() => showPicker(
              'Calculation method',
              ['ISNA', 'Muslim World League', 'Umm al-Qura', 'Karachi (HEC)', 'Egypt'],
              settings.calculationMethod,
              v => update('calculationMethod', v)
            )}
          />
          <LinkRow
            icon="📿" label="Asr method"
            value={settings.asrMethod}
            onPress={() => showPicker(
              'Asr method',
              ['Hanafi', 'Shafi / Maliki / Hanbali'],
              settings.asrMethod,
              v => update('asrMethod', v)
            )}
          />
          <LinkRow
            icon="📅" label="Hijri date offset"
            value={`${settings.hijriOffset >= 0 ? '+' : ''}${settings.hijriOffset} days`}
            onPress={() => showPicker(
              'Hijri date offset',
              ['-2 days', '-1 day', '0 days', '+1 day', '+2 days'],
              `${settings.hijriOffset >= 0 ? '+' : ''}${settings.hijriOffset} days`,
              v => {
                const num = parseInt(v.replace(' days','').replace(' day',''));
                update('hijriOffset', isNaN(num) ? 0 : num);
              }
            )}
          />
          <ToggleRow
            icon="🌅" label="Show Sunrise"
            value={settings.showSunrise}
            onToggle={() => toggle('showSunrise')}
          />
        </View>

        {/* App */}
        <SectionLabel title="App" />
        <View style={s.card}>
          <LinkRow
            icon="🌙" label="Theme"
            value={settings.theme}
            onPress={() => showPicker(
              'Theme',
              ['Dark', 'Light', 'Auto'],
              settings.theme,
              v => update('theme', v)
            )}
          />
          <LinkRow
            icon="🌡️" label="Temperature unit"
            value={settings.temperatureUnit}
            onPress={() => showPicker(
              'Temperature unit',
              ['°C', '°F'],
              settings.temperatureUnit,
              v => update('temperatureUnit', v)
            )}
          />
          <LinkRow
            icon="🌐" label="Language"
            value={settings.language}
            onPress={() => showPicker(
              'Language',
              ['English', 'Arabic', 'Bangla', 'Urdu', 'French'],
              settings.language,
              v => update('language', v)
            )}
          />
          <ToggleRow
            icon="٣" label="Arabic numerals"
            value={settings.arabicNumerals}
            onToggle={() => toggle('arabicNumerals')}
          />
        </View>

        {/* AI features */}
        <SectionLabel title="AI features" />
        <View style={s.card}>
          <ToggleRow
            icon="✨" label="AI suggestions"
            value={settings.aiSuggestions}
            onToggle={() => toggle('aiSuggestions')}
          />
          <ToggleRow
            icon="📖" label="Quran reflections"
            value={settings.quranReflections}
            onToggle={() => toggle('quranReflections')}
          />
          <ToggleRow
            icon="🌤️" label="Weather briefings"
            value={settings.weatherBriefings}
            onToggle={() => toggle('weatherBriefings')}
          />
        </View>

        {/* Support */}
        <SectionLabel title="Support" />
        <View style={s.card}>
          <LinkRow icon="❓" label="Help & FAQ"     value="" onPress={() => Alert.alert('Help', 'Coming soon.')} />
          <LinkRow icon="💬" label="Send feedback"  value="" onPress={() => Alert.alert('Feedback', 'Coming soon.')} />
          <LinkRow icon="⭐" label="Rate the app"   value="" onPress={() => Alert.alert('Rate', 'Coming soon.')} />
          <LinkRow icon="ℹ️" label="App version"    value="v1.0.0" onPress={() => {}} />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.bgDark },
  scroll:       { flex: 1, paddingHorizontal: spacing[4] },
  header:       { paddingTop: spacing[4], paddingBottom: spacing[2], gap: spacing[1] },
  backText:     { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body, marginBottom: spacing[2] },
  title:        { fontSize: fontSizes.lg, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  sectionLabel: { fontSize: fontSizes.xs, fontWeight: '500', color: colors.textDarkTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing[2], marginTop: spacing[4], fontFamily: fonts.medium },
  card:         { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, paddingHorizontal: spacing[4], marginBottom: spacing[2] },
  row:          { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 0.5, borderBottomColor: colors.borderDark, gap: spacing[3] },
  rowIcon:      { fontSize: 16, width: 24, textAlign: 'center' },
  rowLabel:     { flex: 1, fontSize: fontSizes.sm, color: colors.textDarkPrimary, fontFamily: fonts.body },
  rowValue:     { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },
  chevron:      { fontSize: 18, color: colors.textDarkTertiary, marginLeft: spacing[1] },
});
