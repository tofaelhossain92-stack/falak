import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { colors, fonts, fontSizes, radius, spacing } from '../../brand/tokens/brand-tokens';
import {
  setupNotifications,
  schedulePrayerNotifications,
  scheduleTahajjudAlarm,
  setupNotificationListener,
  playAdhan,
  calcTahajjudWakeTime,
} from '../../services/adhan-service';
import AdhanPlayer from '../../components/AdhanPlayer';

// ── Constants ─────────────────────────────────────────────────────
const ALADHAN_BASE = 'https://api.aladhan.com/v1';
const METHOD       = 2; // ISNA — North America
const SCHOOL       = 1; // Hanafi

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌙', Sunrise: '🌅', Dhuhr: '☀️',
  Asr: '🌤️', Maghrib: '🌇', Isha: '🌃',
};

const PRAYER_ARABIC: Record<string, string> = {
  Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر',
  Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
};

const FARD_PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const ALL_PRAYERS  = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const AYAH_ARABIC  = 'إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَـٰبًۭا مَّوْقُوتًۭا';
const AYAH_ENGLISH = '"Indeed, prayer has been decreed upon the believers a decree of specified times."';
const AYAH_REF     = 'Surah An-Nisa 4:103';

// ── Helpers ───────────────────────────────────────────────────────
const toMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const nowMinutes = (): number => {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
};

const to12hr = (time24: string): string => {
  if (!time24) return '—';
  const [h24, m] = time24.split(':').map(Number);
  const ampm = h24 < 12 ? 'AM' : 'PM';
  const h12  = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const fmtCountdown = (mins: number): string => {
  if (mins <= 0) return 'Now';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const calcTahajjud = (ishaTime: string, fajrTime: string) => {
  const isha  = toMinutes(ishaTime);
  const fajr  = toMinutes(fajrTime) + (toMinutes(fajrTime) < isha ? 1440 : 0);
  const night = fajr - isha;
  const third = Math.floor(night / 3);
  const start = isha + (third * 2);
  const startMins = start % 1440;
  const h    = Math.floor(startMins / 60);
  const m    = startMins % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12  = h % 12 || 12;
  const endH = Math.floor(toMinutes(fajrTime) / 60);
  const endM = toMinutes(fajrTime) % 60;
  const endAmpm = endH < 12 ? 'AM' : 'PM';
  const endH12  = endH % 12 || 12;
  return {
    start: `${h12}:${String(m).padStart(2,'0')} ${ampm}`,
    end:   `${endH12}:${String(endM).padStart(2,'0')} ${endAmpm}`,
  };
};

// ── Types ─────────────────────────────────────────────────────────
interface PrayerTimings {
  Fajr: string; Sunrise: string; Dhuhr: string;
  Asr: string;  Maghrib: string; Isha: string;
  [key: string]: string;
}

interface HijriDate {
  day: string;
  month: { en: string; ar: string };
  year: string;
  weekday: { en: string };
}

// ── Countdown hook ────────────────────────────────────────────────
function useCountdown(timings: PrayerTimings | null) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  if (!timings) return { name: '', time: '', minsLeft: 0 };
  const now = nowMinutes();
  for (const p of FARD_PRAYERS) {
    const t12  = to12hr(timings[p]);
    const mins = toMinutes(t12);
    if (mins > now) return { name: p, time: t12, minsLeft: mins - now };
  }
  const fajr12 = to12hr(timings.Fajr);
  const fajrMins = toMinutes(fajr12) + 1440;
  return { name: 'Fajr', time: fajr12, minsLeft: fajrMins - now };
}

// ── Main component ────────────────────────────────────────────────
export default function PrayerScreen() {
  const [timings, setTimings]   = useState<PrayerTimings | null>(null);
  const [hijri, setHijri]       = useState<HijriDate | null>(null);
  const [city, setCity]         = useState('Locating…');
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [checked, setChecked]   = useState<Record<string, boolean>>({});
  const [adhanVisible, setAdhanVisible] = useState(false);
  const [adhanPrayer, setAdhanPrayer]   = useState('');
  const [adhanIsFajr, setAdhanIsFajr]   = useState(false);
  const listenerRef = useRef<any>(null);

  const next = useCountdown(timings);

  const fetchPrayers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let lat = 53.5461, lon = -113.4937;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
      }

      try {
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.EXPO_PUBLIC_WEATHER_API_KEY}`
        );
        const geo = await geoRes.json();
        if (geo[0]) setCity(`${geo[0].name}, ${geo[0].country}`);
      } catch { setCity('Edmonton, CA'); }

      const today = new Date();
      const dd    = String(today.getDate()).padStart(2, '0');
      const mm    = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy  = today.getFullYear();

      const res  = await fetch(
        `${ALADHAN_BASE}/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lon}&method=${METHOD}&school=${SCHOOL}`
      );
      const data = await res.json();

     if (data.code === 200) {
  setTimings(data.data.timings);
  setHijri(data.data.date.hijri);
  const now = nowMinutes();
  const autoDone: Record<string, boolean> = {};
  for (const p of FARD_PRAYERS) {
    const t12 = to12hr(data.data.timings[p]);
    autoDone[p] = toMinutes(t12) < now;
  }
  setChecked(autoDone);

  // Setup notifications and schedule adhan
  await setupNotifications();
  await schedulePrayerNotifications(data.data.timings);
  const wakeTime = calcTahajjudWakeTime(
    data.data.timings.Isha,
    data.data.timings.Fajr
  );
  await scheduleTahajjudAlarm(wakeTime);
if (listenerRef.current) {
  listenerRef.current.remove();
}
listenerRef.current = setupNotificationListener();
} else {
  throw new Error('Prayer times fetch failed');
}
    } catch (e: any) {
  console.error('Prayer fetch error:', e?.message || e);
  setError('Could not load prayer times. Pull down to retry.');
} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPrayers(); }, [fetchPrayers]);

  const togglePrayer = (name: string) =>
    setChecked(prev => ({ ...prev, [name]: !prev[name] }));

  if (loading) return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Loading prayer times…</Text>
      </View>
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => fetchPrayers()}>
          <Text style={s.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const isha12   = timings ? to12hr(timings.Isha)  : '';
  const fajr12   = timings ? to12hr(timings.Fajr)  : '';
  const tahajjud = timings ? calcTahajjud(isha12, fajr12) : { start: '', end: '' };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPrayers(true)}
            tintColor={colors.primary}
          />
        }
      >
        {/* Top bar */}
        <View style={s.topBar}>
          <View>
            <Text style={s.screenTitle}>Prayer times</Text>
            {hijri && (
              <Text style={s.hijri}>{hijri.day} {hijri.month.en} {hijri.year} AH</Text>
            )}
          </View>
          <Text style={s.location}>📍 {city}</Text>
        </View>

        {/* Next prayer banner */}
        {next.name ? (
          <View style={s.nextBanner}>
            <View>
              <Text style={s.nextLabel}>Next prayer</Text>
              <Text style={s.nextName}>{PRAYER_ICONS[next.name]} {next.name}</Text>
              <Text style={s.nextArabic}>{PRAYER_ARABIC[next.name]} · {next.time}</Text>
            </View>
            <View style={s.countdownBox}>
              <Text style={s.countdownNum}>{fmtCountdown(next.minsLeft)}</Text>
              <Text style={s.countdownLabel}>remaining</Text>
            </View>
          </View>
        ) : null}

        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, {
            width: `${Math.min((FARD_PRAYERS.filter(p => checked[p]).length / FARD_PRAYERS.length) * 100, 100)}%`
          }]} />
        </View>

        {/* Prayer list */}
        <Text style={s.sectionLabel}>Today's prayers</Text>
        {timings && ALL_PRAYERS.map((prayer) => {
          const time12  = to12hr(timings[prayer]);
          const isDone  = !!checked[prayer];
          const isNext  = next.name === prayer;
          const isSunrise = prayer === 'Sunrise';
          return (
            <View key={prayer} style={[s.prayerCard, isNext && s.prayerCardNext, isDone && !isNext && s.prayerCardDone]}>
              <View style={s.prayerRow}>
                <View style={s.prayerLeft}>
                  {!isSunrise ? (
                    <TouchableOpacity style={[s.checkbox, isDone && s.checkboxDone]} onPress={() => togglePrayer(prayer)}>
                      {isDone && <Text style={s.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  ) : <View style={[s.checkbox, { borderColor: 'transparent' }]} />}
                  <View>
                    <Text style={[s.prayerName, isDone && !isNext && s.textDim]}>{PRAYER_ICONS[prayer]} {prayer}</Text>
                    <Text style={[s.prayerArabic, isDone && !isNext && s.textDim]}>{PRAYER_ARABIC[prayer]}</Text>
                  </View>
                </View>
                <View style={s.prayerRight}>
                  <Text style={[s.prayerTime, isNext && s.prayerTimeNext]}>{time12}</Text>
                  {isNext && <Text style={s.prayerCountdownSmall}>{fmtCountdown(next.minsLeft)}</Text>}
                </View>
              </View>
              {!isSunrise && (
                <View style={s.aiRow}>
                  <TouchableOpacity style={s.aiBtn} onPress={() => Alert.alert(`After ${prayer}`, 'AI tasks & dhikr — Connect Claude API to enable.')}>
                    <Text style={s.aiBtnIcon}>🤲</Text>
                    <View><Text style={s.aiBtnTitle}>After {prayer}</Text><Text style={s.aiBtnSub}>AI tasks & dhikr</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.aiBtn, s.aiBtnGold]} onPress={() => Alert.alert(`Nafl — ${prayer}`, 'Connect Claude API to enable Sunnah guidance.')}>
                    <Text style={s.aiBtnIcon}>📿</Text>
                    <View><Text style={s.aiBtnTitle}>Nafl prayers</Text><Text style={s.aiBtnSub}>Sunnah guide</Text></View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* Tahajjud */}
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
              <Text style={s.tahajjudTime}>{tahajjud.start} – {tahajjud.end}</Text>
              <Text style={s.tahajjudTimeSub}>Last third of night</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.tahajjudBtns}>
            {[
              { icon: '🤲', title: 'How to pray',     sub: 'AI guide + hadith'     },
              { icon: '📖', title: 'Duʿas to recite', sub: 'Sunnah supplications'  },
              { icon: '⭐', title: 'Virtue',           sub: 'Quran & hadith'        },
            ].map((btn, i) => (
              <TouchableOpacity key={i} style={s.tahajjudBtn} onPress={() => Alert.alert(btn.title, 'Connect Claude API to enable AI-powered Islamic guidance.')}>
                <Text style={s.tahajjudBtnIcon}>{btn.icon}</Text>
                <Text style={s.tahajjudBtnTitle}>{btn.title}</Text>
                <Text style={s.tahajjudBtnSub}>{btn.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Witr */}
        <View style={s.witrCard}>
          <Text style={s.witrIcon}>🌙</Text>
          <View style={s.witrBody}>
            <Text style={s.witrTitle}>Witr prayer</Text>
            <Text style={s.witrSub}>After Tahajjud · before Fajr · {fajr12}</Text>
          </View>
          <Text style={s.witrRakah}>3 rakʿahs</Text>
        </View>

        {/* Qibla */}
        <Text style={s.sectionLabel}>Qibla direction</Text>
        <View style={s.qiblaCard}>
          <Text style={s.qiblaIcon}>🧭</Text>
          <View style={s.qiblaBody}>
            <Text style={s.qiblaTitle}>{city} faces <Text style={s.qiblaAngle}>31° NE</Text> toward Makkah</Text>
            <Text style={s.qiblaSub}>Face northeast when praying</Text>
          </View>
        </View>

        {/* Daily Ayah */}
        <Text style={s.sectionLabel}>Daily reminder</Text>
        <View style={s.ayahCard}>
          <Text style={s.ayahArabic}>{AYAH_ARABIC}</Text>
          <View style={s.ayahDivider} />
          <Text style={s.ayahEnglish}>{AYAH_ENGLISH}</Text>
          <Text style={s.ayahRef}>{AYAH_REF}</Text>
        </View>

        {/* Method info */}
        <View style={s.methodCard}>
          <Text style={s.methodText}>🕌 ISNA (North America) · Hanafi · AlAdhan API</Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Adhan player overlay */}
      <AdhanPlayer
        prayer={adhanPrayer}
        isFajr={adhanIsFajr}
        visible={adhanVisible}
        onDismiss={() => setAdhanVisible(false)}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: colors.bgDark },
  scroll:{ flex: 1, paddingHorizontal: spacing[4] },
  center:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  loadingText:{ fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },
  errorIcon:{ fontSize: 32 },
  errorText:{ fontSize: fontSizes.sm, color: colors.textDarkSecondary, textAlign: 'center', fontFamily: fonts.body },
  retryBtn:{ backgroundColor: `${colors.primary}22`, borderWidth: 0.5, borderColor: `${colors.primary}55`, borderRadius: radius.md, paddingHorizontal: spacing[5], paddingVertical: spacing[2] },
  retryText:{ fontSize: fontSizes.sm, color: colors.primary, fontFamily: fonts.medium },
  topBar:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: spacing[4], paddingBottom: spacing[2] },
  screenTitle:{ fontSize: fontSizes.lg, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  hijri:{ fontSize: fontSizes.xs, color: colors.accent, marginTop: 2, fontFamily: fonts.body },
  location:{ fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },
  nextBanner:{ backgroundColor: `${colors.primary}18`, borderWidth: 0.5, borderColor: `${colors.primary}55`, borderRadius: radius.lg, padding: spacing[4], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: spacing[2] },
  nextLabel:{ fontSize: fontSizes.xs, color: `${colors.primary}aa`, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, fontFamily: fonts.medium },
  nextName:{ fontSize: fontSizes.xl, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  nextArabic:{ fontSize: fontSizes.sm, color: colors.textDarkSecondary, marginTop: 2, fontFamily: fonts.body },
  countdownBox:{ alignItems: 'flex-end' },
  countdownNum:{ fontSize: 28, fontWeight: '300', color: colors.primary, fontFamily: fonts.light },
  countdownLabel:{ fontSize: fontSizes.xs, color: colors.textDarkTertiary, fontFamily: fonts.body },
  progressTrack:{ height: 3, backgroundColor: `${colors.primary}20`, borderRadius: radius.full, marginBottom: spacing[4], overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  sectionLabel:{ fontSize: fontSizes.xs, fontWeight: '500', color: colors.textDarkTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing[2], marginTop: spacing[4], fontFamily: fonts.medium },
  prayerCard:{ backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing[3], marginBottom: spacing[2] },
  prayerCardNext:{ backgroundColor: `${colors.primary}0d`, borderColor: `${colors.primary}55` },
  prayerCardDone:{ opacity: 0.55 },
  prayerRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prayerLeft:{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  checkbox:{ width: 20, height: 20, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.borderDark, alignItems: 'center', justifyContent: 'center' },
  checkboxDone:{ backgroundColor: '#4ade80', borderColor: '#4ade80' },
  checkmark:{ fontSize: 10, color: colors.bgDark, fontWeight: '700' },
  prayerName:{ fontSize: fontSizes.md, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  prayerArabic:{ fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginTop: 1, fontFamily: fonts.body },
  prayerRight:{ alignItems: 'flex-end' },
  prayerTime:{ fontSize: fontSizes.md, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  prayerTimeNext:{ color: colors.primary },
  prayerCountdownSmall:{ fontSize: fontSizes.xs, color: colors.primary, marginTop: 1, fontFamily: fonts.body },
  textDim:{ color: colors.textDarkTertiary },
  aiRow:{ flexDirection: 'row', gap: spacing[2], marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 0.5, borderTopColor: colors.borderDark },
  aiBtn:{ flex: 1, backgroundColor: `${colors.primary}12`, borderWidth: 0.5, borderColor: `${colors.primary}25`, borderRadius: radius.md, padding: spacing[2], flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  aiBtnGold:{ backgroundColor: `${colors.accent}0a`, borderColor: `${colors.accent}22` },
  aiBtnIcon:{ fontSize: 14 },
  aiBtnTitle:{ fontSize: 11, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  aiBtnSub:{ fontSize: 10, color: colors.textDarkTertiary, marginTop: 1, fontFamily: fonts.body },
  tahajjudCard:{ backgroundColor: `${colors.prayer}0a`, borderWidth: 0.5, borderColor: `${colors.prayer}35`, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[2] },
  tahajjudHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  tahajjudLeft:{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  tahajjudIcon:{ fontSize: 24 },
  tahajjudTitle:{ fontSize: fontSizes.md, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  tahajjudArabic:{ fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginTop: 1, fontFamily: fonts.body },
  tahajjudTimeBox:{ alignItems: 'flex-end' },
  tahajjudTime:{ fontSize: fontSizes.sm, fontWeight: '500', color: colors.prayer, fontFamily: fonts.medium },
  tahajjudTimeSub:{ fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginTop: 1, fontFamily: fonts.body },
  divider:{ height: 0.5, backgroundColor: `${colors.prayer}18`, marginBottom: spacing[3] },
  tahajjudBtns:{ flexDirection: 'row', gap: spacing[2] },
  tahajjudBtn:{ flex: 1, backgroundColor: `${colors.prayer}0d`, borderWidth: 0.5, borderColor: `${colors.prayer}22`, borderRadius: radius.md, padding: spacing[2], alignItems: 'center', gap: 4 },
  tahajjudBtnIcon:{ fontSize: 16 },
  tahajjudBtnTitle:{ fontSize: 10, fontWeight: '500', color: colors.textDarkPrimary, textAlign: 'center', fontFamily: fonts.medium },
  tahajjudBtnSub:{ fontSize: 9, color: colors.textDarkTertiary, textAlign: 'center', fontFamily: fonts.body },
  witrCard:{ backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[2] },
  witrIcon:{ fontSize: 20 },
  witrBody:{ flex: 1 },
  witrTitle:{ fontSize: fontSizes.sm, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  witrSub:{ fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginTop: 1, fontFamily: fonts.body },
  witrRakah:{ fontSize: fontSizes.xs, color: colors.textDarkSecondary, fontFamily: fonts.body },
  qiblaCard:{ backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[4], marginBottom: spacing[2] },
  qiblaIcon:{ fontSize: 32 },
  qiblaBody:{ flex: 1 },
  qiblaTitle:{ fontSize: fontSizes.md, color: colors.textDarkPrimary, fontFamily: fonts.body, lineHeight: 22 },
  qiblaAngle:{ fontWeight: '500', color: colors.primary, fontFamily: fonts.medium },
  qiblaSub:{ fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginTop: 4, fontFamily: fonts.body },
  ayahCard:{ backgroundColor: `${colors.accent}08`, borderWidth: 0.5, borderColor: `${colors.accent}25`, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[2] },
  ayahArabic:{ fontSize: 18, color: colors.textDarkPrimary, textAlign: 'right', lineHeight: 32, fontFamily: fonts.serif, marginBottom: spacing[3] },
  ayahDivider:{ height: 0.5, backgroundColor: `${colors.accent}20`, marginBottom: spacing[3] },
  ayahEnglish:{ fontSize: fontSizes.sm, color: colors.textDarkSecondary, lineHeight: 22, fontStyle: 'italic', fontFamily: fonts.body, marginBottom: spacing[2] },
  ayahRef:{ fontSize: fontSizes.xs, color: colors.accent, fontFamily: fonts.medium },
  methodCard:{ backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.md, padding: spacing[3], marginBottom: spacing[2], alignItems: 'center' },
  methodText:{ fontSize: fontSizes.xs, color: colors.textDarkTertiary, fontFamily: fonts.body, textAlign: 'center' },
});