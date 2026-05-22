import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSizes, radius, spacing } from '../../brand/tokens/brand-tokens';

// ── Mock prayer data ──────────────────────────────────────────────
const PRAYERS = [
  { name: 'Fajr',    arabic: 'الفجر', time: '4:38 AM',  icon: '🌙', done: false, isNext: true  },
  { name: 'Sunrise', arabic: 'الشروق', time: '6:12 AM', icon: '🌅', done: false, isNext: false, isSunrise: true },
  { name: 'Dhuhr',   arabic: 'الظهر', time: '1:27 PM',  icon: '☀️', done: true,  isNext: false },
  { name: 'Asr',     arabic: 'العصر', time: '5:14 PM',  icon: '🌤️', done: true,  isNext: false },
  { name: 'Maghrib', arabic: 'المغرب', time: '9:08 PM', icon: '🌇', done: true,  isNext: false },
  { name: 'Isha',    arabic: 'العشاء', time: '10:48 PM',icon: '🌃', done: true,  isNext: false },
];

const HIJRI = '17 Dhul Qaʿdah 1447 AH';

const AYAH_ARABIC = 'إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَـٰبًۭا مَّوْقُوتًۭا';
const AYAH_ENGLISH = '"Indeed, prayer has been decreed upon the believers a decree of specified times."';
const AYAH_REF = 'Surah An-Nisa 4:103';

// ── Countdown timer ───────────────────────────────────────────────
function useCountdown() {
  const [mins, setMins] = useState(52);
  useEffect(() => {
    const t = setInterval(() => setMins(m => m > 0 ? m - 1 : 0), 60000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── AI suggestion handler ─────────────────────────────────────────
function showAI(type: string, prayer: string) {
  const messages: Record<string, string> = {
    after: `After ${prayer} — AI suggestions coming soon!\n\nThis will show dhikr and tasks based on Quran & Hadith.`,
    nafl:  `Nafl prayers for ${prayer} — coming soon!\n\nThis will show Sunnah rak'ahs with Hadith references.`,
  };
  Alert.alert(type === 'after' ? `After ${prayer}` : `Nafl — ${prayer}`, messages[type]);
}

// ── Main component ────────────────────────────────────────────────
export default function PrayerScreen() {
  const countdown = useCountdown();
  const [checkedPrayers, setCheckedPrayers] = useState<Record<string, boolean>>(
    Object.fromEntries(PRAYERS.map(p => [p.name, p.done]))
  );

  const togglePrayer = (name: string) => {
    setCheckedPrayers(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <View>
            <Text style={s.screenTitle}>Prayer times</Text>
            <Text style={s.hijri}>{HIJRI}</Text>
          </View>
          <Text style={s.location}>📍 Edmonton, AB</Text>
        </View>

        {/* ── Next prayer banner ── */}
        <View style={s.nextBanner}>
          <View>
            <Text style={s.nextLabel}>Next prayer</Text>
            <Text style={s.nextName}>🌙 Fajr</Text>
            <Text style={s.nextArabic}>الفجر · 4:38 AM</Text>
          </View>
          <View style={s.countdownBox}>
            <Text style={s.countdownNum}>{countdown}</Text>
            <Text style={s.countdownLabel}>remaining</Text>
          </View>
        </View>

        {/* ── Progress bar ── */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: '65%' }]} />
        </View>

        {/* ── Section label ── */}
        <Text style={s.sectionLabel}>Today's prayers</Text>

        {/* ── Prayer list ── */}
        {PRAYERS.map((prayer) => {
          const isDone = checkedPrayers[prayer.name];
          const isNext = prayer.isNext;
          return (
            <View
              key={prayer.name}
              style={[
                s.prayerCard,
                isNext && s.prayerCardNext,
                isDone && !isNext && s.prayerCardDone,
              ]}
            >
              {/* Prayer row */}
              <View style={s.prayerRow}>
                <View style={s.prayerLeft}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={[s.checkbox, isDone && s.checkboxDone]}
                    onPress={() => togglePrayer(prayer.name)}
                  >
                    {isDone && <Text style={s.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  {/* Icon + name */}
                  <View>
                    <Text style={[s.prayerName, isDone && !isNext && s.textDim]}>
                      {prayer.icon} {prayer.name}
                    </Text>
                    <Text style={[s.prayerArabic, isDone && !isNext && s.textDim]}>
                      {prayer.arabic}
                    </Text>
                  </View>
                </View>
                <View style={s.prayerRight}>
                  <Text style={[s.prayerTime, isNext && s.prayerTimeNext]}>
                    {prayer.time}
                  </Text>
                  {isNext && (
                    <Text style={s.prayerCountdownSmall}>{countdown}</Text>
                  )}
                </View>
              </View>

              {/* AI buttons — only for fard prayers (not Sunrise) */}
              {!prayer.isSunrise && (
                <View style={s.aiRow}>
                  <TouchableOpacity
                    style={s.aiBtn}
                    onPress={() => showAI('after', prayer.name)}
                  >
                    <Text style={s.aiBtnIcon}>🤲</Text>
                    <View>
                      <Text style={s.aiBtnTitle}>After {prayer.name}</Text>
                      <Text style={s.aiBtnSub}>AI tasks & dhikr</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.aiBtn, s.aiBtnGold]}
                    onPress={() => showAI('nafl', prayer.name)}
                  >
                    <Text style={s.aiBtnIcon}>📿</Text>
                    <View>
                      <Text style={s.aiBtnTitle}>Nafl prayers</Text>
                      <Text style={s.aiBtnSub}>Sunnah guide</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* ── Tahajjud card ── */}
        <Text style={s.sectionLabel}>Night prayer</Text>
        <View style={s.tahajjudCard}>
          <View style={s.tahajjudHeader}>
            <View style={s.tahajjudLeft}>
              <Text style={s.tahajjudIcon}>🌌</Text>
              <View>
                <Text style={s.tahajjudTitle}>Tahajjud</Text>
                <Text style={s.tahajjudArabic}>تهجد · Night vigil prayer</Text>
              </View>
            </View>
            <View style={s.tahajjudTimeBox}>
              <Text style={s.tahajjudTime}>2:10 – 3:50 AM</Text>
              <Text style={s.tahajjudTimeSub}>Last third of night</Text>
            </View>
          </View>

          {/* Time window bar */}
          <View style={s.timeBar}>
            <View style={s.timeBarFill} />
          </View>
          <View style={s.timeBarLabels}>
            <Text style={s.timeBarLabel}>Isha 10:48 PM</Text>
            <Text style={[s.timeBarLabel, { color: colors.prayer }]}>Best: last third ↑</Text>
            <Text style={s.timeBarLabel}>Fajr 4:38 AM</Text>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Tahajjud AI buttons */}
          <View style={s.tahajjudBtns}>
            <TouchableOpacity style={s.tahajjudBtn} onPress={() => Alert.alert('How to pray Tahajjud', 'AI guide coming soon — will include step-by-step with Hadith references.')}>
              <Text style={s.tahajjudBtnIcon}>🤲</Text>
              <Text style={s.tahajjudBtnTitle}>How to pray</Text>
              <Text style={s.tahajjudBtnSub}>AI guide + hadith</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.tahajjudBtn} onPress={() => Alert.alert('Duʿas for Tahajjud', 'Sunnah supplications coming soon.')}>
              <Text style={s.tahajjudBtnIcon}>📖</Text>
              <Text style={s.tahajjudBtnTitle}>Duʿas to recite</Text>
              <Text style={s.tahajjudBtnSub}>Sunnah supplications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.tahajjudBtn} onPress={() => Alert.alert('Virtue of Tahajjud', 'Quranic and Hadith references coming soon.')}>
              <Text style={s.tahajjudBtnIcon}>⭐</Text>
              <Text style={s.tahajjudBtnTitle}>Virtue</Text>
              <Text style={s.tahajjudBtnSub}>Quran & hadith</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Witr reminder */}
        <View style={s.witrCard}>
          <Text style={s.witrIcon}>🌙</Text>
          <View style={s.witrBody}>
            <Text style={s.witrTitle}>Witr prayer</Text>
            <Text style={s.witrSub}>After Tahajjud · before Fajr</Text>
          </View>
          <Text style={s.witrRakah}>3 rakʿahs</Text>
        </View>

        {/* ── Qibla card ── */}
        <Text style={s.sectionLabel}>Qibla direction</Text>
        <View style={s.qiblaCard}>
          <Text style={s.qiblaIcon}>🧭</Text>
          <View style={s.qiblaBody}>
            <Text style={s.qiblaTitle}>Edmonton faces <Text style={s.qiblaAngle}>31° NE</Text> toward Makkah</Text>
            <Text style={s.qiblaSub}>Face northeast when praying</Text>
          </View>
        </View>

        {/* ── Daily Ayah ── */}
        <Text style={s.sectionLabel}>Daily reminder</Text>
        <View style={s.ayahCard}>
          <Text style={s.ayahArabic}>{AYAH_ARABIC}</Text>
          <View style={s.ayahDivider} />
          <Text style={s.ayahEnglish}>{AYAH_ENGLISH}</Text>
          <Text style={s.ayahRef}>{AYAH_REF}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  screenTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  hijri: {
    fontSize: fontSizes.xs,
    color: colors.accent,
    marginTop: 2,
    fontFamily: fonts.body,
  },
  location: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    fontFamily: fonts.body,
  },

  // Next prayer banner
  nextBanner: {
    backgroundColor: `${colors.primary}18`,
    borderWidth: 0.5,
    borderColor: `${colors.primary}55`,
    borderRadius: radius.lg,
    padding: spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing[2],
  },
  nextLabel: {
    fontSize: fontSizes.xs,
    color: `${colors.primary}aa`,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    fontFamily: fonts.medium,
  },
  nextName: {
    fontSize: fontSizes.xl,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  nextArabic: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    marginTop: 2,
    fontFamily: fonts.body,
  },
  countdownBox: {
    alignItems: 'flex-end',
  },
  countdownNum: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.primary,
    fontFamily: fonts.light,
  },
  countdownLabel: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
  },

  // Progress bar
  progressTrack: {
    height: 3,
    backgroundColor: `${colors.primary}20`,
    borderRadius: radius.full,
    marginBottom: spacing[4],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
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

  // Prayer card
  prayerCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  prayerCardNext: {
    backgroundColor: `${colors.primary}0d`,
    borderColor: `${colors.primary}55`,
  },
  prayerCardDone: {
    opacity: 0.55,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  checkmark: {
    fontSize: 10,
    color: colors.bgDark,
    fontWeight: '700',
  },
  prayerName: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  prayerArabic: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 1,
    fontFamily: fonts.body,
  },
  prayerRight: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  prayerTimeNext: {
    color: colors.primary,
  },
  prayerCountdownSmall: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    marginTop: 1,
    fontFamily: fonts.body,
  },
  textDim: {
    color: colors.textDarkTertiary,
  },

  // AI buttons
  aiRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 0.5,
    borderTopColor: colors.borderDark,
  },
  aiBtn: {
    flex: 1,
    backgroundColor: `${colors.primary}12`,
    borderWidth: 0.5,
    borderColor: `${colors.primary}25`,
    borderRadius: radius.md,
    padding: spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  aiBtnGold: {
    backgroundColor: `${colors.accent}0a`,
    borderColor: `${colors.accent}22`,
  },
  aiBtnIcon: {
    fontSize: 14,
  },
  aiBtnTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  aiBtnSub: {
    fontSize: 10,
    color: colors.textDarkTertiary,
    marginTop: 1,
    fontFamily: fonts.body,
  },

  // Tahajjud
  tahajjudCard: {
    backgroundColor: `${colors.prayer}0a`,
    borderWidth: 0.5,
    borderColor: `${colors.prayer}35`,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  tahajjudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  tahajjudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  tahajjudIcon: {
    fontSize: 24,
  },
  tahajjudTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  tahajjudArabic: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 1,
    fontFamily: fonts.body,
  },
  tahajjudTimeBox: {
    alignItems: 'flex-end',
  },
  tahajjudTime: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.prayer,
    fontFamily: fonts.medium,
  },
  tahajjudTimeSub: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 1,
    fontFamily: fonts.body,
  },
  timeBar: {
    height: 4,
    backgroundColor: `${colors.prayer}15`,
    borderRadius: radius.full,
    marginBottom: spacing[1],
    overflow: 'hidden',
  },
  timeBarFill: {
    position: 'absolute',
    left: '62%',
    width: '25%',
    height: '100%',
    backgroundColor: colors.prayer,
    borderRadius: radius.full,
  },
  timeBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  timeBarLabel: {
    fontSize: 9,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
  },
  divider: {
    height: 0.5,
    backgroundColor: `${colors.prayer}18`,
    marginBottom: spacing[3],
  },
  tahajjudBtns: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  tahajjudBtn: {
    flex: 1,
    backgroundColor: `${colors.prayer}0d`,
    borderWidth: 0.5,
    borderColor: `${colors.prayer}22`,
    borderRadius: radius.md,
    padding: spacing[2],
    alignItems: 'center',
    gap: 4,
  },
  tahajjudBtnIcon: {
    fontSize: 16,
  },
  tahajjudBtnTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    textAlign: 'center',
    fontFamily: fonts.medium,
  },
  tahajjudBtnSub: {
    fontSize: 9,
    color: colors.textDarkTertiary,
    textAlign: 'center',
    fontFamily: fonts.body,
  },

  // Witr
  witrCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  witrIcon: {
    fontSize: 20,
  },
  witrBody: {
    flex: 1,
  },
  witrTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  witrSub: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 1,
    fontFamily: fonts.body,
  },
  witrRakah: {
    fontSize: fontSizes.xs,
    color: colors.textDarkSecondary,
    fontFamily: fonts.body,
  },

  // Qibla
  qiblaCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[2],
  },
  qiblaIcon: {
    fontSize: 32,
  },
  qiblaBody: {
    flex: 1,
  },
  qiblaTitle: {
    fontSize: fontSizes.md,
    color: colors.textDarkPrimary,
    fontFamily: fonts.body,
    lineHeight: 22,
  },
  qiblaAngle: {
    fontWeight: '500',
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  qiblaSub: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 4,
    fontFamily: fonts.body,
  },

  // Ayah
  ayahCard: {
    backgroundColor: `${colors.accent}08`,
    borderWidth: 0.5,
    borderColor: `${colors.accent}25`,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  ayahArabic: {
    fontSize: 18,
    color: colors.textDarkPrimary,
    textAlign: 'right',
    lineHeight: 32,
    fontFamily: fonts.serif,
    marginBottom: spacing[3],
  },
  ayahDivider: {
    height: 0.5,
    backgroundColor: `${colors.accent}20`,
    marginBottom: spacing[3],
  },
  ayahEnglish: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
    fontFamily: fonts.body,
    marginBottom: spacing[2],
  },
  ayahRef: {
    fontSize: fontSizes.xs,
    color: colors.accent,
    fontFamily: fonts.medium,
  },
  bgDarkCard: colors.bgDarkCard,
  borderDark: colors.borderDark,
});