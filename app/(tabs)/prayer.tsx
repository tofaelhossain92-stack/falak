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

// ── Mock data ──────────────────────────────────────────────────────────────────

const HIJRI = { day: 17, month: "Dhul Qa'dah", year: 1447 };
const NEXT = { name: 'Fajr', arabic: 'الفجر', time: '4:02 AM', minutesLeft: 52 };

type PrayerStatus = 'past' | 'next' | 'upcoming';
type Prayer = {
  id: string;
  name: string;
  arabic: string;
  time: string;
  status: PrayerStatus;
  isFard: boolean;
};

const PRAYERS: Prayer[] = [
  { id: 'fajr',    name: 'Fajr',    arabic: 'الفجر',  time: '4:02 AM',  status: 'next',     isFard: true  },
  { id: 'sunrise', name: 'Sunrise', arabic: 'الشروق', time: '5:52 AM',  status: 'upcoming', isFard: false },
  { id: 'dhuhr',   name: 'Dhuhr',   arabic: 'الظهر',  time: '1:28 PM',  status: 'upcoming', isFard: true  },
  { id: 'asr',     name: 'Asr',     arabic: 'العصر',  time: '5:47 PM',  status: 'upcoming', isFard: true  },
  { id: 'maghrib', name: 'Maghrib', arabic: 'المغرب', time: '9:07 PM',  status: 'past',     isFard: true  },
  { id: 'isha',    name: 'Isha',    arabic: 'العشاء', time: '10:57 PM', status: 'past',     isFard: true  },
];

const TAHAJJUD = { start: '2:10 AM', end: '3:50 AM' };
const QIBLA = { degrees: 31, direction: 'NE', city: 'Edmonton' };
const AYAH = {
  ref: 'An-Nisa 4:103',
  arabic: 'إِنَّ ٱلصَّلَوٰةَ كَانَتۡ عَلَى ٱلۡمُؤۡمِنِينَ كِتَٰبٗا مَّوۡقُوتٗا',
  english: 'Indeed, prayer has been decreed upon the believers a decree of specified times.',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  tint = colors.primary,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  tint?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={13} color={tint} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ActionBtn({
  label,
  active,
  tint,
}: {
  label: string;
  active: boolean;
  tint: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { borderColor: active ? tint : colors.borderDark }]}
      activeOpacity={0.7}
    >
      <Text style={[styles.actionBtnText, { color: active ? tint : colors.textDarkTertiary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PrayerCard({ prayer }: { prayer: Prayer }) {
  const isPast = prayer.status === 'past';
  const isNext = prayer.status === 'next';

  return (
    <View style={[styles.prayerCard, isNext && styles.prayerCardNext]}>
      {/* Status indicator */}
      <View style={styles.prayerIndicator}>
        {isPast ? (
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
        ) : isNext ? (
          <View style={styles.nextDot} />
        ) : (
          <View style={styles.upcomingDot} />
        )}
      </View>

      {/* Name + action buttons */}
      <View style={styles.prayerCenter}>
        <View style={styles.prayerNameRow}>
          <Text
            style={[
              styles.prayerName,
              isPast && styles.prayerNamePast,
              isNext && styles.prayerNameNext,
            ]}
          >
            {prayer.name}
          </Text>
          <Text style={[styles.prayerArabic, isPast && styles.prayerArabicPast]}>
            {prayer.arabic}
          </Text>
        </View>
        {prayer.isFard && (
          <View style={styles.actionRow}>
            <ActionBtn label="After Prayer" active={isNext} tint={colors.primary} />
            <ActionBtn label="Nafl" active={isNext} tint={colors.prayer} />
          </View>
        )}
      </View>

      {/* Time */}
      <Text
        style={[
          styles.prayerTime,
          isPast && styles.prayerTimePast,
          isNext && styles.prayerTimeNext,
        ]}
      >
        {prayer.time}
      </Text>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function PrayerScreen() {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.locationText}>Edmonton, AB</Text>
        </View>
        <View style={styles.hijriChip}>
          <Text style={styles.hijriText}>
            {HIJRI.day} {HIJRI.month} {HIJRI.year}
          </Text>
        </View>
      </View>

      {/* ── Next Prayer Banner ─────────────────────────────────────────────── */}
      <View style={styles.nextBanner}>
        <View>
          <Text style={styles.nextLabel}>NEXT PRAYER</Text>
          <View style={styles.nextNameRow}>
            <Text style={styles.nextName}>{NEXT.name}</Text>
            <Text style={styles.nextArabic}>{NEXT.arabic}</Text>
          </View>
          <Text style={styles.nextTime}>{NEXT.time}</Text>
        </View>
        <View style={styles.countdown}>
          <View style={styles.countdownRow}>
            <Text style={styles.countdownNum}>{NEXT.minutesLeft}</Text>
            <Text style={styles.countdownUnit}>min</Text>
          </View>
          <Text style={styles.countdownLabel}>remaining</Text>
        </View>
      </View>

      {/* ── Today's Prayers ────────────────────────────────────────────────── */}
      <SectionHeader icon="list-outline" title="Today's Prayers" />
      <View style={styles.prayerList}>
        {PRAYERS.map((p) => (
          <PrayerCard key={p.id} prayer={p} />
        ))}
      </View>

      {/* ── Tahajjud ───────────────────────────────────────────────────────── */}
      <SectionHeader icon="moon-outline" title="Night Prayer" tint={colors.prayer} />
      <View style={styles.tahajjudCard}>
        <View style={styles.tahajjudLeft}>
          <View style={styles.tahajjudIcon}>
            <Ionicons name="moon" size={22} color={colors.prayer} />
          </View>
          <View>
            <Text style={styles.tahajjudName}>Tahajjud</Text>
            <Text style={styles.tahajjudSub}>Night Voluntary Prayer</Text>
          </View>
        </View>
        <View style={styles.tahajjudRight}>
          <Text style={styles.tahajjudTime}>
            {TAHAJJUD.start} – {TAHAJJUD.end}
          </Text>
          <Text style={styles.tahajjudActive}>Active now</Text>
        </View>
      </View>

      {/* ── Qibla Direction ────────────────────────────────────────────────── */}
      <SectionHeader icon="compass-outline" title="Qibla Direction" />
      <View style={styles.qiblaCard}>
        <View style={styles.compassRing}>
          <Ionicons
            name="navigate"
            size={28}
            color={colors.primary}
            style={{ transform: [{ rotate: `${QIBLA.degrees}deg` }] }}
          />
        </View>
        <View style={styles.qiblaInfo}>
          <Text style={styles.qiblaDegrees}>
            {QIBLA.degrees}° {QIBLA.direction}
          </Text>
          <Text style={styles.qiblaCity}>from {QIBLA.city}</Text>
          <Text style={styles.qiblaLabel}>Toward the Ka'bah</Text>
        </View>
      </View>

      {/* ── Daily Ayah ────────────────────────────────────────────────────── */}
      <SectionHeader icon="book-outline" title="Daily Ayah" tint={colors.accent} />
      <View style={styles.ayahCard}>
        <View style={styles.ayahRefRow}>
          <Ionicons name="bookmark" size={12} color={colors.accent} />
          <Text style={styles.ayahRef}>{AYAH.ref}</Text>
        </View>
        <Text style={styles.ayahArabic}>{AYAH.arabic}</Text>
        <View style={styles.ayahDivider} />
        <Text style={styles.ayahEnglish}>{AYAH.english}</Text>
      </View>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
    marginBottom: spacing['5'],
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
  hijriChip: {
    backgroundColor: colors.accentSubtle,
    borderRadius: radius.full,
    paddingVertical: spacing['1'],
    paddingHorizontal: spacing['3'],
    borderWidth: 1,
    borderColor: colors.accentSubtle,
  },
  hijriText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.accent,
    letterSpacing: 0.3,
  },

  // Next prayer banner
  nextBanner: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing['5'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['6'],
    ...shadows.card,
  },
  nextLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.textDarkSecondary,
    letterSpacing: 1.2,
    marginBottom: spacing['1'],
  },
  nextNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing['2'],
    marginBottom: spacing['1'],
  },
  nextName: {
    fontFamily: fonts.medium,
    fontSize: fontSizes['3xl'],
    color: colors.textDarkPrimary,
    includeFontPadding: false,
  },
  nextArabic: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    color: colors.textDarkSecondary,
  },
  nextTime: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textDarkSecondary,
  },
  countdown: {
    alignItems: 'center',
    gap: spacing['1'],
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  countdownNum: {
    fontFamily: fonts.light,
    fontSize: fontSizes['4xl'],
    color: colors.textDarkPrimary,
    includeFontPadding: false,
    lineHeight: fontSizes['4xl'] * 1.1,
  },
  countdownUnit: {
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    color: colors.textDarkSecondary,
    paddingBottom: 4,
  },
  countdownLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    letterSpacing: 0.5,
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

  // Prayer list
  prayerList: {
    gap: spacing['2'],
    marginBottom: spacing['8'],
  },

  // Prayer card
  prayerCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    ...shadows.card,
  },
  prayerCardNext: {
    borderColor: colors.primary,
    backgroundColor: colors.bgDarkCardHover,
  },
  prayerIndicator: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  upcomingDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
  },
  prayerCenter: {
    flex: 1,
    gap: spacing['2'],
  },
  prayerNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing['2'],
  },
  prayerName: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.textDarkPrimary,
  },
  prayerNamePast: {
    color: colors.textDarkTertiary,
  },
  prayerNameNext: {
    color: colors.primary,
  },
  prayerArabic: {
    fontFamily: fonts.display,
    fontSize: fontSizes.md,
    color: colors.textDarkSecondary,
  },
  prayerArabicPast: {
    color: colors.textDarkTertiary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  actionBtn: {
    paddingVertical: 3,
    paddingHorizontal: spacing['2'],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  actionBtnText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    letterSpacing: 0.2,
  },
  prayerTime: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
  },
  prayerTimePast: {
    color: colors.textDarkTertiary,
  },
  prayerTimeNext: {
    color: colors.primary,
  },

  // Tahajjud card
  tahajjudCard: {
    backgroundColor: colors.prayerSubtle,
    borderWidth: 1,
    borderColor: colors.prayer,
    borderRadius: radius.lg,
    padding: spacing['4'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['8'],
    ...shadows.card,
  },
  tahajjudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  tahajjudIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.prayerSubtle,
    borderWidth: 1,
    borderColor: colors.prayer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tahajjudName: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.base,
    color: colors.prayer,
  },
  tahajjudSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textDarkSecondary,
    marginTop: 2,
  },
  tahajjudRight: {
    alignItems: 'flex-end',
    gap: spacing['1'],
  },
  tahajjudTime: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.prayer,
  },
  tahajjudActive: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.success,
    letterSpacing: 0.3,
  },

  // Qibla card
  qiblaCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    marginBottom: spacing['8'],
    ...shadows.card,
  },
  compassRing: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    backgroundColor: colors.bgDarkCardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qiblaInfo: {
    flex: 1,
    gap: spacing['1'],
  },
  qiblaDegrees: {
    fontFamily: fonts.medium,
    fontSize: fontSizes['2xl'],
    color: colors.primary,
    includeFontPadding: false,
  },
  qiblaCity: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
  },
  qiblaLabel: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing['1'],
  },

  // Daily Ayah card
  ayahCard: {
    backgroundColor: colors.accentSubtle,
    borderWidth: 1,
    borderColor: colors.accentSubtle,
    borderRadius: radius.lg,
    padding: spacing['5'],
    gap: spacing['4'],
    ...shadows.card,
  },
  ayahRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  ayahRef: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ayahArabic: {
    fontFamily: fonts.display,
    fontSize: fontSizes.xl,
    color: colors.textDarkPrimary,
    textAlign: 'right',
    lineHeight: fontSizes.xl * 2,
  },
  ayahDivider: {
    height: 1,
    backgroundColor: colors.borderDark,
  },
  ayahEnglish: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    lineHeight: fontSizes.sm * 1.7,
    fontStyle: 'italic',
  },
});
