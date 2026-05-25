import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { colors, fonts, fontSizes, radius, spacing } from '../../brand/tokens/brand-tokens';

// ── API config ────────────────────────────────────────────────────
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const BASE    = 'https://api.openweathermap.org';

// ── Weather code → emoji ──────────────────────────────────────────
const weatherEmoji: Record<string, string> = {
  '01d':'☀️','01n':'🌙','02d':'⛅','02n':'⛅',
  '03d':'☁️','03n':'☁️','04d':'☁️','04n':'☁️',
  '09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌧️',
  '11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️',
  '50d':'🌫️','50n':'🌫️',
};

// ── Helpers ───────────────────────────────────────────────────────
const windDir = (deg: number) =>
  ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];

const aqiLabel = (v: number) =>
  ['','Good','Fair','Moderate','Poor','Very Poor'][v] ?? '—';

const aqiColor = (v: number) =>
  ['','#4ade80','#84cc16','#eab308','#f97316','#ef4444'][v] ?? '#888';

const uvRisk = (v: number) =>
  v <= 2 ? 'Low' : v <= 5 ? 'Moderate' : v <= 7 ? 'High' : 'Very High';

const fmtHour = (ts: number, offset: number) => {
  const d = new Date((ts + offset) * 1000);
  const h = d.getUTCHours();
  return `${h % 12 || 12}${h < 12 ? 'a' : 'p'}`;
};

const fmtTime = (ts: number, offset: number) => {
  const d = new Date((ts + offset) * 1000);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
};

const dayAbbr = (ts: number, offset: number) => {
  const d = new Date((ts + offset) * 1000);
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getUTCDay()];
};

// ── Types ─────────────────────────────────────────────────────────
interface WeatherData {
  current: any;
  hourly:  any[];
  daily:   any[];
  tzOffset: number;
}

// ── Main component ────────────────────────────────────────────────
export default function WeatherScreen() {
  const [data, setData]           = useState<WeatherData | null>(null);
  const [aqi, setAqi]             = useState<any>(null);
  const [city, setCity]           = useState('Locating…');
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [aiCard, setAiCard]       = useState<{ type: string; text: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAi, setActiveAi]   = useState<string | null>(null);
  const [time, setTime]           = useState(new Date());

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Fetch weather
  const fetchWeather = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Get location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 53.5461, lon = -113.4937; // Edmonton fallback

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
      }

      // Fetch weather + AQI + reverse geocode in parallel
      const [wRes, aqiRes, geoRes] = await Promise.all([
        fetch(`${BASE}/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
        fetch(`${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
        fetch(`${BASE}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`),
      ]);

      if (!wRes.ok) throw new Error('Weather fetch failed');

      const [w, aqiData, geo] = await Promise.all([
        wRes.json(), aqiRes.json(), geoRes.json(),
      ]);

      setData({
        current:  w.current,
        hourly:   w.hourly?.slice(0, 12) ?? [],
        daily:    w.daily?.slice(0, 7) ?? [],
        tzOffset: w.timezone_offset ?? 0,
      });
      setAqi(aqiData.list?.[0]);
      if (geo[0]) setCity(`${geo[0].name}, ${geo[0].country}`);

    } catch (e: any) {
      setError('Could not load weather. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  // ── Render: loading ──
  if (loading) return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Loading your weather…</Text>
      </View>
    </SafeAreaView>
  );

  // ── Render: error ──
  if (error) return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorText}>{error}</Text>
        <TouchableOpacity style={s.retryBtn} onPress={() => fetchWeather()}>
          <Text style={s.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const w  = data!.current;
  const tz = data!.tzOffset;
  const icon = w.weather[0].icon;
  const emoji = weatherEmoji[icon] ?? '🌡️';
  const temp = Math.round(w.temp);
  const feels = Math.round(w.feels_like);
  const isWinter = temp < -10;

  const timeStr = time.toLocaleTimeString('en-CA', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchWeather(true)}
            tintColor={colors.primary}
          />
        }
      >

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <Text style={s.city}>📍 {city}</Text>
          <Text style={s.timeText}>
            Updated {timeStr}
          </Text>
        </View>

        {/* ── Hero temp ── */}
        <View style={s.heroRow}>
          <View>
            <Text style={s.tempBig}>{temp}°</Text>
            <Text style={s.desc}>{w.weather[0].description}</Text>
            <Text style={s.feelsLike}>
              Feels {feels}° · {windDir(w.wind_deg)} {Math.round(w.wind_speed * 3.6)} km/h
            </Text>
          </View>
          <Text style={s.heroEmoji}>{emoji}</Text>
        </View>

        {/* ── Stats grid ── */}
        <View style={s.statsGrid}>
          {[
            { val: `${w.humidity}%`,                          lbl: 'Humidity'   },
            { val: `${w.uvi} · ${uvRisk(w.uvi)}`,            lbl: 'UV index'   },
            { val: aqiLabel(aqi?.main?.aqi),                  lbl: 'Air quality',
              col: aqiColor(aqi?.main?.aqi) },
            { val: w.visibility ? `${(w.visibility/1000).toFixed(0)}km` : '—',
              lbl: 'Visibility' },
          ].map((item, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statVal, item.col ? { color: item.col } : {}]}>
                {item.val}
              </Text>
              <Text style={s.statLbl}>{item.lbl}</Text>
            </View>
          ))}
        </View>

        {/* ── Sunrise / Sunset / Dew point ── */}
        <View style={s.sunCard}>
          <View style={s.sunItem}>
            <Text style={s.sunIcon}>🌅</Text>
            <Text style={s.sunVal}>{fmtTime(w.sunrise, tz)}</Text>
            <Text style={s.sunLbl}>Sunrise</Text>
          </View>
          <View style={s.sunDivider} />
          <View style={s.sunItem}>
            <Text style={s.sunIcon}>🌇</Text>
            <Text style={s.sunVal}>{fmtTime(w.sunset, tz)}</Text>
            <Text style={s.sunLbl}>Sunset</Text>
          </View>
          <View style={s.sunDivider} />
          <View style={s.sunItem}>
            <Text style={s.sunIcon}>💧</Text>
            <Text style={s.sunVal}>{Math.round(w.dew_point)}°</Text>
            <Text style={s.sunLbl}>Dew point</Text>
          </View>
        </View>

        {/* ── Hourly forecast ── */}
        <Text style={s.sectionLabel}>Hourly</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data!.hourly.map((h: any, i: number) => (
            <View key={i} style={[s.hourCard, i === 0 && s.hourCardActive]}>
              <Text style={s.hourTime}>{i === 0 ? 'Now' : fmtHour(h.dt, tz)}</Text>
              <Text style={s.hourEmoji}>{weatherEmoji[h.weather[0].icon] ?? '🌡️'}</Text>
              <Text style={s.hourTemp}>{Math.round(h.temp)}°</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── 7-day forecast ── */}
        <Text style={s.sectionLabel}>7-day forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data!.daily.map((d: any, i: number) => (
            <View key={i} style={[s.dayCard, i === 0 && s.hourCardActive]}>
              <Text style={s.dayName}>{i === 0 ? 'Today' : dayAbbr(d.dt, tz)}</Text>
              <Text style={s.hourEmoji}>{weatherEmoji[d.weather[0].icon] ?? '🌡️'}</Text>
              <Text style={s.dayHi}>{Math.round(d.temp.max)}°</Text>
              <Text style={s.dayLo}>{Math.round(d.temp.min)}°</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Edmonton winter alert ── */}
        {isWinter && (
          <View style={s.winterAlert}>
            <Text style={s.winterTitle}>
              ⚠️ Edmonton winter advisory
            </Text>
            <Text style={s.winterText}>
              {temp < -20
                ? `Extreme cold: ${temp}°C. Limit time outside. Cover all exposed skin.`
                : `Cold alert: ${temp}°C. Dress in layers. Watch for black ice on roads.`}
            </Text>
          </View>
        )}

        {/* ── AI suggestions ── */}
        <Text style={s.sectionLabel}>AI suggestions</Text>

        {/* AI result card */}
        {(aiLoading || aiCard) && (
          <View style={s.aiResultCard}>
            {aiLoading ? (
              <View style={s.aiLoadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={s.aiLoadingText}>Thinking…</Text>
              </View>
            ) : aiCard && (
              <>
                <Text style={s.aiResultTitle}>
                  {activeAi === 'outfit'   ? '👔 Outfit of the day'  :
                   activeAi === 'activity' ? '🏃 Activity window'    :
                                             '🚗 Commute risk'}
                </Text>
                <Text style={s.aiResultText}>{aiCard.text}</Text>
              </>
            )}
          </View>
        )}

        {/* AI buttons */}
        <View style={s.aiGrid}>
          {[
            { type: 'outfit',   icon: '👔', title: 'Outfit',   sub: 'What to wear today'     },
            { type: 'activity', icon: '🏃', title: 'Activity', sub: 'Best outdoor window'    },
            { type: 'commute',  icon: '🚗', title: 'Commute',  sub: 'Driving conditions',
              full: true },
          ].map(({ type, icon, title, sub, full }) => (
            <TouchableOpacity
              key={type}
              style={[s.aiBtn, full && s.aiBtnFull,
                activeAi === type && aiCard ? s.aiBtnActive : {}]}
              onPress={() => {
                setActiveAi(type);
                setAiCard({ type, text: `AI ${title} suggestions coming soon! Connect Claude API to enable.` });
              }}
              disabled={aiLoading}
            >
              <Text style={s.aiBtnIcon}>{icon}</Text>
              <Text style={s.aiBtnTitle}>{title}</Text>
              <Text style={s.aiBtnSub}>{sub}</Text>
            </TouchableOpacity>
          ))}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  loadingText: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    fontFamily: fonts.body,
  },
  errorIcon: { fontSize: 32 },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  retryBtn: {
    backgroundColor: `${colors.primary}22`,
    borderWidth: 0.5,
    borderColor: `${colors.primary}55`,
    borderRadius: radius.md,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  retryText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontFamily: fonts.medium,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  city: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    fontFamily: fonts.body,
  },
  timeText: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
  },

  // Hero
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing[4],
  },
  tempBig: {
    fontSize: 84,
    fontWeight: '300',
    color: colors.textDarkPrimary,
    letterSpacing: -4,
    lineHeight: 88,
    fontFamily: fonts.light,
  },
  desc: {
    fontSize: fontSizes.lg,
    color: colors.textDarkSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
    fontFamily: fonts.body,
  },
  feelsLike: {
    fontSize: fontSizes.sm,
    color: colors.textDarkTertiary,
    marginTop: 3,
    fontFamily: fonts.body,
  },
  heroEmoji: {
    fontSize: 68,
    lineHeight: 76,
    marginTop: 8,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    padding: spacing[2],
    alignItems: 'center',
  },
  statVal: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  statLbl: {
    fontSize: 9,
    color: colors.textDarkTertiary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
    textAlign: 'center',
  },

  // Sun card
  sunCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  sunItem: { alignItems: 'center', gap: 3 },
  sunIcon: { fontSize: 18 },
  sunVal: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  sunLbl: {
    fontSize: 10,
    color: colors.textDarkTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: fonts.body,
  },
  sunDivider: {
    width: 0.5,
    backgroundColor: colors.borderDark,
  },

  // Section label
  sectionLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    color: colors.textDarkTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[2],
    fontFamily: fonts.medium,
  },

  // Hourly
  hourCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    padding: spacing[2],
    alignItems: 'center',
    minWidth: 58,
    marginRight: spacing[2],
    marginBottom: spacing[3],
    gap: 2,
  },
  hourCardActive: {
    borderColor: `${colors.primary}55`,
    backgroundColor: `${colors.primary}12`,
  },
  hourTime: {
    fontSize: 10,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
    textTransform: 'uppercase',
  },
  hourEmoji: { fontSize: 16 },
  hourTemp: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },

  // Daily
  dayCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.md,
    padding: spacing[2],
    alignItems: 'center',
    minWidth: 66,
    marginRight: spacing[2],
    marginBottom: spacing[3],
    gap: 2,
  },
  dayName: {
    fontSize: 10,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
  },
  dayHi: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  dayLo: {
    fontSize: 11,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
  },

  // Winter alert
  winterAlert: {
    backgroundColor: `${colors.accent}10`,
    borderWidth: 0.5,
    borderColor: `${colors.accent}40`,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  winterTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.accent,
    marginBottom: 4,
    fontFamily: fonts.medium,
  },
  winterText: {
    fontSize: fontSizes.sm,
    color: `${colors.accent}cc`,
    lineHeight: 20,
    fontFamily: fonts.body,
  },

  // AI
  aiResultCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: `${colors.primary}40`,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  aiLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  aiLoadingText: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    fontFamily: fonts.body,
  },
  aiResultTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textDarkSecondary,
    marginBottom: spacing[2],
    fontFamily: fonts.medium,
  },
  aiResultText: {
    fontSize: fontSizes.sm,
    color: colors.textDarkPrimary,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  aiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  aiBtn: {
    width: '48%',
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  aiBtnFull: {
    width: '100%',
  },
  aiBtnActive: {
    borderColor: `${colors.primary}55`,
    backgroundColor: `${colors.primary}0d`,
  },
  aiBtnIcon: { fontSize: 22, marginBottom: spacing[1] },
  aiBtnTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  aiBtnSub: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 2,
    fontFamily: fonts.body,
  },
});