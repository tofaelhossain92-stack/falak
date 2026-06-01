import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radius, spacing } from '../brand/tokens/brand-tokens';

// ── Types ─────────────────────────────────────────────────────────
interface PrayerReminder {
  enabled:  boolean;
  advance:  number; // minutes before
}

interface TahajjudSettings {
  enabled:   boolean;
  wakeMode:  'lastThird' | 'midnight' | 'custom';
  customTime:string;
  days:      boolean[];
  sound:     'silent' | 'vibrate' | 'adhan';
}

const PRAYERS = [
  { name: 'Fajr',    icon: '🌙', time: '4:20 AM' },
  { name: 'Dhuhr',   icon: '☀️', time: '1:07 PM' },
  { name: 'Asr',     icon: '🌤️', time: '6:13 PM' },
  { name: 'Maghrib', icon: '🌇', time: '9:52 PM' },
  { name: 'Isha',    icon: '🌃', time: '11:22 PM' },
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ADVANCE_OPTIONS = [0, 5, 10, 15, 20, 30];
const SOUND_OPTIONS = [
  { key: 'silent',  label: 'Silent',  icon: '🔕' },
  { key: 'vibrate', label: 'Vibrate', icon: '📳' },
  { key: 'adhan',   label: 'Adhan',   icon: '🔊' },
];
const WAKE_MODES = [
  { key: 'lastThird', label: 'Last third', sub: 'Recommended' },
  { key: 'midnight',  label: 'Midnight',   sub: 'After midnight' },
  { key: 'custom',    label: 'Custom',      sub: 'Set your time' },
];

// ── Main component ────────────────────────────────────────────────
export default function RemindersScreen() {
  const [prayerReminders, setPrayerReminders] = useState<Record<string, PrayerReminder>>(
    Object.fromEntries(PRAYERS.map(p => [p.name, { enabled: true, advance: 10 }]))
  );
  const [globalAdvance, setGlobalAdvance] = useState(10);
  const [tahajjud, setTahajjud] = useState<TahajjudSettings>({
    enabled:    true,
    wakeMode:   'lastThird',
    customTime: '02:00',
    days:       [true, false, false, false, false, true, true],
    sound:      'adhan',
  });

  const togglePrayer = (name: string) => {
    setPrayerReminders(prev => ({
      ...prev,
      [name]: { ...prev[name], enabled: !prev[name].enabled },
    }));
  };

  const toggleDay = (index: number) => {
    const newDays = [...tahajjud.days];
    newDays[index] = !newDays[index];
    setTahajjud(prev => ({ ...prev, days: newDays }));
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Reminders</Text>
        </View>

        {/* Global advance notice */}
        <Text style={s.sectionLabel}>Default advance notice</Text>
        <View style={s.card}>
          <View style={s.advanceRow}>
            <Text style={s.advanceLabel}>Remind me before prayer</Text>
            <View style={s.advancePills}>
              {ADVANCE_OPTIONS.map(mins => (
                <TouchableOpacity
                  key={mins}
                  style={[s.pill, globalAdvance === mins && s.pillActive]}
                  onPress={() => setGlobalAdvance(mins)}
                >
                  <Text style={[s.pillText, globalAdvance === mins && s.pillTextActive]}>
                    {mins === 0 ? 'At time' : `${mins}m`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Prayer reminders */}
        <Text style={s.sectionLabel}>Prayer reminders</Text>
        <View style={s.card}>
          {PRAYERS.map((prayer, i) => (
            <View key={prayer.name} style={[s.prayerRow, i === PRAYERS.length - 1 && s.lastRow]}>
              <Text style={s.prayerIcon}>{prayer.icon}</Text>
              <View style={s.prayerInfo}>
                <Text style={s.prayerName}>{prayer.name}</Text>
                <Text style={s.prayerTime}>
                  {prayer.time} · {globalAdvance === 0 ? 'at prayer time' : `${globalAdvance} min before`}
                </Text>
              </View>
              <Switch
                value={prayerReminders[prayer.name]?.enabled ?? true}
                onValueChange={() => togglePrayer(prayer.name)}
                trackColor={{ false: colors.borderDark, true: `${colors.primary}80` }}
                thumbColor={prayerReminders[prayer.name]?.enabled ? colors.primary : colors.textDarkTertiary}
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
            </View>
          ))}
        </View>

        {/* Tahajjud reminder */}
        <Text style={[s.sectionLabel, { color: `${colors.prayer}cc` }]}>Tahajjud reminder</Text>
        <View style={[s.card, { borderColor: `${colors.prayer}30` }]}>

          {/* Main toggle */}
          <View style={[s.prayerRow, { paddingBottom: spacing[3] }]}>
            <Text style={s.prayerIcon}>🌌</Text>
            <View style={s.prayerInfo}>
              <Text style={s.prayerName}>Tahajjud</Text>
              <Text style={[s.prayerTime, { color: colors.prayer }]}>Wake at last third of night</Text>
            </View>
            <Switch
              value={tahajjud.enabled}
              onValueChange={() => setTahajjud(prev => ({ ...prev, enabled: !prev.enabled }))}
              trackColor={{ false: colors.borderDark, true: `${colors.prayer}80` }}
              thumbColor={tahajjud.enabled ? colors.prayer : colors.textDarkTertiary}
              style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
            />
          </View>

          {tahajjud.enabled && (
            <>
              {/* Wake time mode */}
              <View style={s.subSection}>
                <Text style={s.subLabel}>Wake time preference</Text>
                <View style={s.wakeModeRow}>
                  {WAKE_MODES.map(mode => (
                    <TouchableOpacity
                      key={mode.key}
                      style={[
                        s.wakeModeBtn,
                        tahajjud.wakeMode === mode.key && s.wakeModeBtnActive,
                      ]}
                      onPress={() => setTahajjud(prev => ({ ...prev, wakeMode: mode.key as any }))}
                    >
                      <Text style={[s.wakeModeBtnTitle, tahajjud.wakeMode === mode.key && s.wakeModeBtnTitleActive]}>
                        {mode.label}
                      </Text>
                      <Text style={s.wakeModeBtnSub}>{mode.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Days of week */}
              <View style={s.subSection}>
                <Text style={s.subLabel}>Remind on</Text>
                <View style={s.daysRow}>
                  {DAY_LABELS.map((day, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[s.dayBtn, tahajjud.days[i] && s.dayBtnActive]}
                      onPress={() => toggleDay(i)}
                    >
                      <Text style={[s.dayBtnText, tahajjud.days[i] && s.dayBtnTextActive]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sound style */}
              <View style={s.subSection}>
                <Text style={s.subLabel}>Notification style</Text>
                <View style={s.soundRow}>
                  {SOUND_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[s.soundBtn, tahajjud.sound === opt.key && s.soundBtnActive]}
                      onPress={() => setTahajjud(prev => ({ ...prev, sound: opt.key as any }))}
                    >
                      <Text style={s.soundBtnIcon}>{opt.icon}</Text>
                      <Text style={[s.soundBtnLabel, tahajjud.sound === opt.key && s.soundBtnLabelActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Adhan note */}
              {tahajjud.sound === 'adhan' && (
                <View style={s.adhanNote}>
                  <Text style={s.adhanNoteText}>
                    🎵 Adhan al-Fajr by Mishary Rashid Alafasy will play at your Tahajjud wake time
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={s.saveBtn}
          onPress={() => {
            Alert.alert('Saved', 'Your reminder settings have been saved.');
            router.back();
          }}
        >
          <Text style={s.saveBtnText}>Save reminders</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.bgDark },
  scroll:       { flex: 1, paddingHorizontal: spacing[4] },
  header:       { paddingTop: spacing[4], paddingBottom: spacing[2] },
  backText:     { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body, marginBottom: spacing[2] },
  title:        { fontSize: fontSizes.lg, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  sectionLabel: { fontSize: fontSizes.xs, fontWeight: '500', color: colors.textDarkTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing[2], marginTop: spacing[4], fontFamily: fonts.medium },
  card:         { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, paddingHorizontal: spacing[4], marginBottom: spacing[2] },
  lastRow:      { borderBottomWidth: 0 },

  advanceRow:   { paddingVertical: spacing[3], gap: spacing[3] },
  advanceLabel: { fontSize: fontSizes.sm, color: colors.textDarkPrimary, fontFamily: fonts.body },
  advancePills: { flexDirection: 'row', gap: spacing[2], flexWrap: 'wrap' },
  pill:         { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, backgroundColor: `${colors.primary}0a`, borderWidth: 0.5, borderColor: colors.borderDark },
  pillActive:   { backgroundColor: `${colors.primary}22`, borderColor: `${colors.primary}55` },
  pillText:     { fontSize: fontSizes.xs, color: colors.textDarkSecondary, fontFamily: fonts.body },
  pillTextActive:{ color: colors.primary, fontFamily: fonts.medium },

  prayerRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 0.5, borderBottomColor: colors.borderDark, gap: spacing[3] },
  prayerIcon:   { fontSize: 18, width: 28 },
  prayerInfo:   { flex: 1 },
  prayerName:   { fontSize: fontSizes.sm, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  prayerTime:   { fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginTop: 2, fontFamily: fonts.body },

  subSection:   { paddingVertical: spacing[3], borderTopWidth: 0.5, borderTopColor: `${colors.prayer}18` },
  subLabel:     { fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginBottom: spacing[2], fontFamily: fonts.body },

  wakeModeRow:  { flexDirection: 'row', gap: spacing[2] },
  wakeModeBtn:  { flex: 1, backgroundColor: `${colors.prayer}08`, borderWidth: 0.5, borderColor: `${colors.prayer}18`, borderRadius: radius.md, padding: spacing[2], alignItems: 'center' },
  wakeModeBtnActive: { backgroundColor: `${colors.prayer}18`, borderColor: `${colors.prayer}45` },
  wakeModeBtnTitle:  { fontSize: fontSizes.xs, fontWeight: '500', color: colors.textDarkSecondary, fontFamily: fonts.medium },
  wakeModeBtnTitleActive: { color: colors.prayer },
  wakeModeBtnSub:    { fontSize: 9, color: colors.textDarkTertiary, fontFamily: fonts.body, marginTop: 2 },

  daysRow:      { flexDirection: 'row', gap: spacing[2] },
  dayBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.prayer}08`, borderWidth: 0.5, borderColor: `${colors.prayer}18`, alignItems: 'center', justifyContent: 'center' },
  dayBtnActive: { backgroundColor: `${colors.prayer}22`, borderColor: `${colors.prayer}50` },
  dayBtnText:   { fontSize: fontSizes.xs, color: colors.textDarkTertiary, fontFamily: fonts.medium },
  dayBtnTextActive: { color: colors.prayer },

  soundRow:     { flexDirection: 'row', gap: spacing[2] },
  soundBtn:     { flex: 1, backgroundColor: `${colors.prayer}08`, borderWidth: 0.5, borderColor: `${colors.prayer}18`, borderRadius: radius.md, padding: spacing[2], alignItems: 'center', gap: 4 },
  soundBtnActive: { backgroundColor: `${colors.prayer}18`, borderColor: `${colors.prayer}45` },
  soundBtnIcon:   { fontSize: 16 },
  soundBtnLabel:  { fontSize: fontSizes.xs, color: colors.textDarkSecondary, fontFamily: fonts.body },
  soundBtnLabelActive: { color: colors.prayer, fontFamily: fonts.medium },

  adhanNote:    { paddingVertical: spacing[3], borderTopWidth: 0.5, borderTopColor: `${colors.prayer}18` },
  adhanNoteText:{ fontSize: fontSizes.xs, color: `${colors.prayer}aa`, fontFamily: fonts.body, lineHeight: 18 },

  saveBtn:      { backgroundColor: `${colors.primary}22`, borderWidth: 0.5, borderColor: `${colors.primary}55`, borderRadius: radius.lg, padding: spacing[4], alignItems: 'center', marginTop: spacing[4] },
  saveBtnText:  { fontSize: fontSizes.md, fontWeight: '500', color: colors.primary, fontFamily: fonts.medium },
});
