import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  radius,
  shadows,
} from '../../brand/tokens/brand-tokens';

// ── Mock data ─────────────────────────────────────────────────────────────────

const WEATHER = {
  location: 'Edmonton, AB',
  updatedAt: '2:47 PM',
  temp: -15,
  feelsLike: -23,
  emoji: '⛅',
  description: 'Partly Cloudy',
  windSpeed: 18,
  windDir: 'NW',
  sun: {
    sunrise: '8:14 AM',
    sunset: '5:02 PM',
    dewPoint: -18,
  },
  hourly: [
    { time: 'Now',   emoji: '⛅', temp: -15 },
    { time: '3 PM',  emoji: '⛅', temp: -16 },
    { time: '4 PM',  emoji: '🌥', temp: -17 },
    { time: '5 PM',  emoji: '🌥', temp: -18 },
    { time: '6 PM',  emoji: '🌑', temp: -19 },
    { time: '7 PM',  emoji: '🌑', temp: -20 },
    { time: '8 PM',  emoji: '🌑', temp: -21 },
    { time: '9 PM',  emoji: '❄️', temp: -22 },
    { time: '10 PM', emoji: '❄️', temp: -23 },
    { time: '11 PM', emoji: '❄️', temp: -23 },
    { time: '12 AM', emoji: '❄️', temp: -24 },
    { time: '1 AM',  emoji: '❄️', temp: -24 },
  ],
  daily: [
    { day: 'Today', emoji: '⛅', high: -14, low: -24 },
    { day: 'Tue',   emoji: '❄️', high: -18, low: -27 },
    { day: 'Wed',   emoji: '🌨', high: -12, low: -20 },
    { day: 'Thu',   emoji: '🌥', high:  -8, low: -15 },
    { day: 'Fri',   emoji: '☀️', high:  -5, low: -12 },
    { day: 'Sat',   emoji: '☀️', high:  -3, low:  -9 },
    { day: 'Sun',   emoji: '🌥', high:  -6, low: -13 },
  ],
};

// ── Sub-components ────────────────────────────────────────────────────────────

type StatCardProps = { emoji: string; label: string; value: string };
function StatCard({ emoji, label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type HourlyItem = { time: string; emoji: string; temp: number };
function HourlyCard({ item, active }: { item: HourlyItem; active: boolean }) {
  return (
    <View style={[styles.hCard, active && styles.hCardActive]}>
      <Text style={[styles.hTime, active && styles.hTimeActive]}>{item.time}</Text>
      <Text style={styles.hEmoji}>{item.emoji}</Text>
      <Text style={[styles.hTemp, active && styles.hTempActive]}>{item.temp}°</Text>
    </View>
  );
}

type DayItem = { day: string; emoji: string; high: number; low: number };
function DayCard({ item }: { item: DayItem }) {
  return (
    <View style={styles.dayCard}>
      <Text style={styles.dayName}>{item.day}</Text>
      <Text style={styles.dayEmoji}>{item.emoji}</Text>
      <Text style={styles.dayHigh}>{item.high}°</Text>
      <Text style={styles.dayLow}>{item.low}°</Text>
    </View>
  );
}

type AIBtnProps = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
};
function AIBtn({ label, icon, tint }: AIBtnProps) {
  return (
    <TouchableOpacity
      style={[styles.aiBtn, { borderColor: tint }]}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={20} color={tint} />
      <Text style={[styles.aiBtnLabel, { color: tint }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const showWinterAlert = WEATHER.temp < -10;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing['5'], paddingBottom: spacing['12'] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={colors.primary} />
          <Text style={styles.locationText}>{WEATHER.location}</Text>
        </View>
        <Text style={styles.timeText}>Updated {WEATHER.updatedAt}</Text>
      </View>

      {/* ── Temperature hero ───────────────────────────────────────────────── */}
      <View style={styles.heroArea}>
        <View style={styles.tempRow}>
          <Text style={styles.tempValue}>{WEATHER.temp}</Text>
          <Text style={styles.tempUnit}>°C</Text>
        </View>
        <View style={styles.conditionRow}>
          <Text style={styles.conditionEmoji}>{WEATHER.emoji}</Text>
          <Text style={styles.conditionText}>{WEATHER.description}</Text>
        </View>
      </View>

      {/* ── Feels like + wind ──────────────────────────────────────────────── */}
      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Ionicons name="thermometer-outline" size={13} color={colors.textDarkSecondary} />
          <Text style={styles.metaText}>Feels like {WEATHER.feelsLike}°C</Text>
        </View>
        <View style={styles.metaSep} />
        <View style={styles.metaChip}>
          <Ionicons name="navigate-outline" size={13} color={colors.textDarkSecondary} />
          <Text style={styles.metaText}>{WEATHER.windDir} · {WEATHER.windSpeed} km/h</Text>
        </View>
      </View>

      {/* ── 4-stat grid ────────────────────────────────────────────────────── */}
      <View style={styles.statGrid}>
        <StatCard emoji="💧" label="Humidity"    value="72%" />
        <StatCard emoji="☀️" label="UV Index"    value="1 · Low" />
        <StatCard emoji="🍃" label="Air Quality" value="34 · Good" />
        <StatCard emoji="👁" label="Visibility"  value="12 km" />
      </View>

      {/* ── Sunrise / Sunset / Dew Point ───────────────────────────────────── */}
      <View style={styles.sunCard}>
        <View style={styles.sunItem}>
          <Text style={styles.sunEmoji}>🌅</Text>
          <Text style={styles.sunValue}>{WEATHER.sun.sunrise}</Text>
          <Text style={styles.sunLabel}>Sunrise</Text>
        </View>
        <View style={styles.sunDivider} />
        <View style={styles.sunItem}>
          <Text style={styles.sunEmoji}>🌇</Text>
          <Text style={styles.sunValue}>{WEATHER.sun.sunset}</Text>
          <Text style={styles.sunLabel}>Sunset</Text>
        </View>
        <View style={styles.sunDivider} />
        <View style={styles.sunItem}>
          <Text style={styles.sunEmoji}>🌡</Text>
          <Text style={styles.sunValue}>{WEATHER.sun.dewPoint}°C</Text>
          <Text style={styles.sunLabel}>Dew Point</Text>
        </View>
      </View>

      {/* ── Hourly forecast ────────────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="time-outline" size={13} color={colors.primary} />
        <Text style={styles.sectionTitle}>Next 12 Hours</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.hScroll}
        contentContainerStyle={styles.hScrollContent}
      >
        {WEATHER.hourly.map((item, i) => (
          <HourlyCard key={item.time} item={item} active={i === 0} />
        ))}
      </ScrollView>

      {/* ── 7-day forecast ─────────────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="calendar-outline" size={13} color={colors.primary} />
        <Text style={styles.sectionTitle}>7-Day Forecast</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.hScroll}
        contentContainerStyle={styles.hScrollContent}
      >
        {WEATHER.daily.map((item) => (
          <DayCard key={item.day} item={item} />
        ))}
      </ScrollView>

      {/* ── Edmonton winter alert ──────────────────────────────────────────── */}
      {showWinterAlert && (
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={15} color={colors.warning} />
            <Text style={styles.alertTitle}>Edmonton Winter Alert</Text>
          </View>
          <Text style={styles.alertBody}>
            Extreme cold warning in effect. Wind chill {WEATHER.feelsLike}°C — limit time
            outdoors and protect exposed skin within minutes of exposure.
          </Text>
        </View>
      )}

      {/* ── AI suggestions ─────────────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="bulb-outline" size={13} color={colors.accent} />
        <Text style={styles.sectionTitle}>AI Suggestions</Text>
      </View>
      <View style={styles.aiRow}>
        <AIBtn label="Outfit"   icon="shirt-outline"   tint={colors.primary} />
        <AIBtn label="Activity" icon="bicycle-outline"  tint={colors.prayer}  />
        <AIBtn label="Commute"  icon="car-outline"      tint={colors.accent}  />
      </View>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const TEMP_SIZE = 84;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  content: {
    paddingHorizontal: spacing['5'],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['8'],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  locationText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.textDarkPrimary,
  },
  timeText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    letterSpacing: 0.3,
  },

  // Hero / temperature
  heroArea: {
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tempValue: {
    fontFamily: fonts.light,
    fontSize: TEMP_SIZE,
    lineHeight: TEMP_SIZE * 1.05,
    color: colors.textDarkPrimary,
    includeFontPadding: false,
  },
  tempUnit: {
    fontFamily: fonts.light,
    fontSize: fontSizes['4xl'],
    color: colors.textDarkSecondary,
    marginTop: spacing['4'],
    includeFontPadding: false,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: spacing['2'],
  },
  conditionEmoji: {
    fontSize: fontSizes['2xl'],
  },
  conditionText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textDarkSecondary,
  },

  // Feels like + wind
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['3'],
    marginBottom: spacing['8'],
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  metaText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
  },
  metaSep: {
    width: 3,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.borderDark,
  },

  // 4-stat grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    marginBottom: spacing['3'],
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.bgDarkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing['4'],
    gap: spacing['1'],
    ...shadows.card,
  },
  statEmoji: {
    fontSize: fontSizes.xl,
    marginBottom: spacing['1'],
  },
  statValue: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.lg,
    color: colors.textDarkPrimary,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // Sun card
  sunCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgDarkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    paddingVertical: spacing['4'],
    marginBottom: spacing['8'],
    ...shadows.card,
  },
  sunItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing['1'],
  },
  sunEmoji: {
    fontSize: fontSizes.xl,
  },
  sunValue: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.prayer,
  },
  sunLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sunDivider: {
    width: 1,
    marginVertical: spacing['2'],
    backgroundColor: colors.borderDark,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.textDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Horizontal scroll wrapper — bleeds to screen edge
  hScroll: {
    marginHorizontal: -spacing['5'],
    marginBottom: spacing['8'],
  },
  hScrollContent: {
    paddingHorizontal: spacing['5'],
    gap: spacing['2'],
  },

  // Hourly card
  hCard: {
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    backgroundColor: colors.bgDarkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
  },
  hCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hTime: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textDarkSecondary,
  },
  hTimeActive: {
    color: colors.textDarkPrimary,
  },
  hEmoji: {
    fontSize: fontSizes.lg,
  },
  hTemp: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textDarkPrimary,
  },
  hTempActive: {
    color: colors.textDarkPrimary,
  },

  // Day card
  dayCard: {
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    backgroundColor: colors.bgDarkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    minWidth: 76,
  },
  dayName: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.textDarkSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayEmoji: {
    fontSize: fontSizes.xl,
  },
  dayHigh: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textDarkPrimary,
  },
  dayLow: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textDarkTertiary,
  },

  // Winter alert
  alertCard: {
    backgroundColor: colors.ramadanGoldBg,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.lg,
    padding: spacing['4'],
    gap: spacing['2'],
    marginBottom: spacing['8'],
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  alertTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.warning,
  },
  alertBody: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    lineHeight: fontSizes.sm * 1.65,
  },

  // AI suggestions
  aiRow: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  aiBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['5'],
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.bgDarkCard,
  },
  aiBtnLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    letterSpacing: 0.4,
  },
});
