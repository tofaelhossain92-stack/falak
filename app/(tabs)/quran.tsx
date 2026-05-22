import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, fontSizes, radius, spacing } from '../../brand/tokens/brand-tokens';

// ── Daily verse ───────────────────────────────────────────────────
const VERSE = {
  arabic:  'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ',
  english: '"And whoever relies upon Allah — then He is sufficient for him."',
  ref:     'Surah At-Talaq 65:3',
  reflection: `On a cold Edmonton morning, this verse is a reminder — your planning matters, but your trust in Allah is what anchors you. Before Fajr, set your intention for the day and release what you cannot control. Tawakkul is not passivity — it is effort paired with surrender.`,
};

// ── Dhikr items ───────────────────────────────────────────────────
const DHIKR_LIST = [
  { id: 'subhan',  arabic: 'سُبْحَانَ اللَّهِ',  english: 'SubhanAllah',   count: 33, color: colors.primary },
  { id: 'hamd',   arabic: 'الْحَمْدُ لِلَّهِ',  english: 'Alhamdulillah', count: 33, color: colors.prayer  },
  { id: 'akbar',  arabic: 'اللَّهُ أَكْبَرُ',   english: 'Allahu Akbar',  count: 34, color: colors.accent  },
];

// ── Weekly tracker data ───────────────────────────────────────────
const DAYS   = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const SCORES = [5, 5, 4, 5, 3, 2, null]; // null = today (incomplete)

function scoreColor(score: number | null) {
  if (score === null) return colors.primary;
  if (score === 5)    return '#4ade80';
  if (score >= 4)     return colors.accent;
  if (score >= 3)     return '#f97316';
  return '#f87171';
}

// ── Main component ────────────────────────────────────────────────
export default function QuranScreen() {
  const [dhikrCounts, setDhikrCounts] = useState<Record<string, number>>(
    Object.fromEntries(DHIKR_LIST.map(d => [d.id, 0]))
  );
  const [dhikrDone, setDhikrDone] = useState<Record<string, boolean>>(
    Object.fromEntries(DHIKR_LIST.map(d => [d.id, false]))
  );

  const tapDhikr = (id: string, target: number) => {
    if (dhikrDone[id]) return;
    Vibration.vibrate(30);
    setDhikrCounts(prev => {
      const next = (prev[id] || 0) + 1;
      if (next >= target) {
        setDhikrDone(d => ({ ...d, [id]: true }));
      }
      return { ...prev, [id]: next };
    });
  };

  const resetDhikr = (id: string) => {
    setDhikrCounts(prev => ({ ...prev, [id]: 0 }));
    setDhikrDone(prev => ({ ...prev, [id]: false }));
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <Text style={s.screenTitle}>Quran & dhikr</Text>
          <Text style={s.dateText}>Thu, 21 May</Text>
        </View>

        {/* ── Verse of the day ── */}
        <Text style={s.sectionLabel}>Verse of the day</Text>
        <View style={s.verseCard}>
          <View style={s.verseHeaderRow}>
            <Text style={s.verseHeaderLabel}>✨ Daily verse</Text>
            <Text style={s.verseRef}>{VERSE.ref}</Text>
          </View>
          <Text style={s.verseArabic}>{VERSE.arabic}</Text>
          <View style={s.verseDivider} />
          <Text style={s.verseEnglish}>{VERSE.english}</Text>
        </View>

        {/* ── AI reflection ── */}
        <View style={s.reflectionCard}>
          <Text style={s.reflectionLabel}>🤲 AI reflection for today</Text>
          <Text style={s.reflectionText}>{VERSE.reflection}</Text>
          <Text style={s.reflectionNote}>Based on today's weather · Fajr time · Hadith context</Text>
        </View>

        {/* ── Dhikr counter ── */}
        <Text style={s.sectionLabel}>Post-prayer dhikr</Text>
        <Text style={s.sectionSub}>Tap each card to count. Device vibrates on each tap.</Text>

        {DHIKR_LIST.map(dhikr => {
          const current = dhikrCounts[dhikr.id] || 0;
          const done    = dhikrDone[dhikr.id];
          const pct     = Math.min(current / dhikr.count, 1);

          return (
            <TouchableOpacity
              key={dhikr.id}
              style={[s.dhikrCard, done && s.dhikrCardDone, { borderColor: `${dhikr.color}35` }]}
              onPress={() => tapDhikr(dhikr.id, dhikr.count)}
              onLongPress={() => resetDhikr(dhikr.id)}
              activeOpacity={0.75}
            >
              <View style={s.dhikrRow}>
                <View style={s.dhikrLeft}>
                  <Text style={[s.dhikrArabic, { color: dhikr.color }]}>{dhikr.arabic}</Text>
                  <Text style={s.dhikrEnglish}>{dhikr.english}</Text>
                </View>
                <View style={s.dhikrRight}>
                  <Text style={[s.dhikrCount, { color: dhikr.color }]}>
                    {done ? '✓' : `${current}/${dhikr.count}`}
                  </Text>
                  {done && <Text style={s.dhikrDoneText}>Complete</Text>}
                </View>
              </View>

              {/* Progress bar */}
              <View style={[s.dhikrTrack, { backgroundColor: `${dhikr.color}15` }]}>
                <View style={[s.dhikrFill, { width: `${pct * 100}%`, backgroundColor: dhikr.color }]} />
              </View>

              {!done && (
                <Text style={s.dhikrHint}>Tap to count · Long press to reset</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* All dhikr done message */}
        {Object.values(dhikrDone).every(Boolean) && (
          <View style={s.allDoneCard}>
            <Text style={s.allDoneIcon}>🌟</Text>
            <Text style={s.allDoneText}>SubhanAllah! All dhikr complete.</Text>
            <Text style={s.allDoneSub}>May Allah accept your worship.</Text>
          </View>
        )}

        {/* ── Weekly prayer tracker ── */}
        <Text style={s.sectionLabel}>This week's prayers</Text>
        <View style={s.trackerCard}>

          {/* Day headers */}
          <View style={s.trackerRow}>
            {DAYS.map((d, i) => (
              <Text key={i} style={s.trackerDayLabel}>{d}</Text>
            ))}
          </View>

          {/* Score cells */}
          <View style={s.trackerRow}>
            {SCORES.map((score, i) => (
              <View
                key={i}
                style={[
                  s.trackerCell,
                  {
                    backgroundColor: score !== null ? `${scoreColor(score)}20` : `${colors.primary}15`,
                    borderColor:     score !== null ? `${scoreColor(score)}50` : `${colors.primary}40`,
                  },
                ]}
              >
                <Text style={[s.trackerScore, { color: scoreColor(score) }]}>
                  {score !== null ? score : '·'}
                </Text>
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={s.legendRow}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#4ade80' }]} />
              <Text style={s.legendText}>5 prayers</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: colors.accent }]} />
              <Text style={s.legendText}>4 prayers</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#f97316' }]} />
              <Text style={s.legendText}>3 prayers</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: '#f87171' }]} />
              <Text style={s.legendText}>1–2 prayers</Text>
            </View>
          </View>

          {/* Monthly stat */}
          <View style={s.statRow}>
            <View style={s.statItem}>
              <Text style={s.statNum}>14</Text>
              <Text style={s.statLabel}>Day streak</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statNum, { color: '#4ade80' }]}>87%</Text>
              <Text style={s.statLabel}>This month</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statNum, { color: colors.primary }]}>312</Text>
              <Text style={s.statLabel}>Total prayers</Text>
            </View>
          </View>
        </View>

        {/* ── Islamic reminder ── */}
        <View style={s.reminderCard}>
          <Text style={s.reminderArabic}>اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ</Text>
          <Text style={s.reminderEnglish}>"O Allah, help me to remember You, to be grateful to You, and to worship You in an excellent manner."</Text>
          <Text style={s.reminderRef}>Abu Dawud · After every prayer</Text>
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
    alignItems: 'center',
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  screenTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '500',
    color: colors.textDarkPrimary,
    fontFamily: fonts.medium,
  },
  dateText: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    fontFamily: fonts.body,
  },

  // Section labels
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
  sectionSub: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginBottom: spacing[3],
    marginTop: -spacing[1],
    fontFamily: fonts.body,
  },

  // Verse card
  verseCard: {
    backgroundColor: `${colors.accent}08`,
    borderWidth: 0.5,
    borderColor: `${colors.accent}28`,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  verseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  verseHeaderLabel: {
    fontSize: fontSizes.xs,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: fonts.medium,
  },
  verseRef: {
    fontSize: fontSizes.xs,
    color: colors.accent,
    fontFamily: fonts.body,
  },
  verseArabic: {
    fontSize: 20,
    color: colors.textDarkPrimary,
    textAlign: 'right',
    lineHeight: 36,
    fontFamily: fonts.serif,
    marginBottom: spacing[3],
  },
  verseDivider: {
    height: 0.5,
    backgroundColor: `${colors.accent}20`,
    marginBottom: spacing[3],
  },
  verseEnglish: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
    fontFamily: fonts.body,
  },

  // Reflection card
  reflectionCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  reflectionLabel: {
    fontSize: fontSizes.xs,
    color: `${colors.primary}cc`,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing[2],
    fontFamily: fonts.medium,
  },
  reflectionText: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    lineHeight: 22,
    fontFamily: fonts.body,
    marginBottom: spacing[2],
  },
  reflectionNote: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
  },

  // Dhikr cards
  dhikrCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  dhikrCardDone: {
    opacity: 0.7,
  },
  dhikrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  dhikrLeft: {
    flex: 1,
  },
  dhikrArabic: {
    fontSize: 20,
    fontFamily: fonts.serif,
    marginBottom: 4,
  },
  dhikrEnglish: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    fontFamily: fonts.body,
  },
  dhikrRight: {
    alignItems: 'flex-end',
  },
  dhikrCount: {
    fontSize: 22,
    fontWeight: '300',
    fontFamily: fonts.light,
  },
  dhikrDoneText: {
    fontSize: fontSizes.xs,
    color: '#4ade80',
    fontFamily: fonts.body,
    marginTop: 2,
  },
  dhikrTrack: {
    height: 3,
    borderRadius: radius.full,
    marginBottom: spacing[2],
    overflow: 'hidden',
  },
  dhikrFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  dhikrHint: {
    fontSize: 10,
    color: colors.textDarkTertiary,
    textAlign: 'center',
    fontFamily: fonts.body,
  },

  // All done
  allDoneCard: {
    backgroundColor: `${'#4ade80'}12`,
    borderWidth: 0.5,
    borderColor: `${'#4ade80'}35`,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  allDoneIcon: {
    fontSize: 32,
    marginBottom: spacing[2],
  },
  allDoneText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: '#4ade80',
    fontFamily: fonts.medium,
  },
  allDoneSub: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    marginTop: 4,
    fontFamily: fonts.body,
  },

  // Weekly tracker
  trackerCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  trackerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  trackerDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
  },
  trackerCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  trackerScore: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 0.5,
    borderTopColor: colors.borderDark,
    marginBottom: spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  legendText: {
    fontSize: 10,
    color: colors.textDarkTertiary,
    fontFamily: fonts.body,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[3],
    borderTopWidth: 0.5,
    borderTopColor: colors.borderDark,
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: fontSizes.xl,
    fontWeight: '300',
    color: colors.accent,
    fontFamily: fonts.light,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.textDarkTertiary,
    marginTop: 2,
    fontFamily: fonts.body,
  },
  statDivider: {
    width: 0.5,
    backgroundColor: colors.borderDark,
  },

  // Reminder
  reminderCard: {
    backgroundColor: colors.bgDarkCard,
    borderWidth: 0.5,
    borderColor: colors.borderDark,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
    alignItems: 'center',
  },
  reminderArabic: {
    fontSize: 16,
    color: colors.textDarkPrimary,
    textAlign: 'center',
    lineHeight: 30,
    fontFamily: fonts.serif,
    marginBottom: spacing[3],
  },
  reminderEnglish: {
    fontSize: fontSizes.sm,
    color: colors.textDarkSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    fontFamily: fonts.body,
    marginBottom: spacing[2],
  },
  reminderRef: {
    fontSize: fontSizes.xs,
    color: colors.accent,
    fontFamily: fonts.medium,
  },
});
