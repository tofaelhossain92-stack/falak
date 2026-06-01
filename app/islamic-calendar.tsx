import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radius, spacing } from '../brand/tokens/brand-tokens';

// ── Hijri months ──────────────────────────────────────────────────
const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhul Qa'dah", 'Dhul Hijjah',
];

// ── Islamic events ────────────────────────────────────────────────
const EVENTS = [
  { hijriMonth: 1,  day: 1,  name: 'Islamic New Year',       icon: '🌙', desc: '1 Muharram — marks the Hijri new year' },
  { hijriMonth: 1,  day: 10, name: 'Day of Ashura',           icon: '⭐', desc: 'Fasting recommended — Moses was saved' },
  { hijriMonth: 3,  day: 12, name: "Mawlid al-Nabi ﷺ",       icon: '💚', desc: 'Birth of the Prophet Muhammad ﷺ' },
  { hijriMonth: 7,  day: 27, name: 'Isra and Miraj',          icon: '🌟', desc: 'The night journey of the Prophet ﷺ' },
  { hijriMonth: 8,  day: 15, name: "Laylat al-Bara'ah",       icon: '🤲', desc: 'Night of forgiveness — 15 Sha\'ban' },
  { hijriMonth: 9,  day: 1,  name: 'Ramadan begins',          icon: '🌙', desc: 'The blessed month of fasting' },
  { hijriMonth: 9,  day: 27, name: 'Laylat al-Qadr',          icon: '✨', desc: 'The night of power — last 10 nights' },
  { hijriMonth: 10, day: 1,  name: 'Eid al-Fitr',             icon: '🎉', desc: 'Celebration after Ramadan' },
  { hijriMonth: 12, day: 8,  name: 'Hajj begins',             icon: '🕋', desc: 'The pilgrimage to Makkah' },
  { hijriMonth: 12, day: 9,  name: 'Day of Arafah',           icon: '🤲', desc: 'Fasting highly recommended' },
  { hijriMonth: 12, day: 10, name: 'Eid al-Adha',             icon: '🎊', desc: 'Festival of sacrifice' },
];

// ── Calendar grid ─────────────────────────────────────────────────
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateCalendarDays(year: number, month: number) {
  // Simple 30-day Hijri month approximation
  const daysInMonth = month === 12 || month % 2 === 0 ? 29 : 30;
  // Approximate first day of week (varies by year)
  const firstDay = (year + month) % 7;
  return { daysInMonth, firstDay };
}

// ── Main component ────────────────────────────────────────────────
export default function IslamicCalendarScreen() {
  // Current Hijri date — approximate
  const [currentHijriMonth, setCurrentHijriMonth] = useState(12); // Dhul Hijjah
  const [currentHijriYear,  setCurrentHijriYear]  = useState(1447);
  const todayHijriDay = 14; // approximate

  const { daysInMonth, firstDay } = generateCalendarDays(currentHijriYear, currentHijriMonth);

  const prevMonth = () => {
    if (currentHijriMonth === 1) {
      setCurrentHijriMonth(12);
      setCurrentHijriYear(y => y - 1);
    } else {
      setCurrentHijriMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentHijriMonth === 12) {
      setCurrentHijriMonth(1);
      setCurrentHijriYear(y => y + 1);
    } else {
      setCurrentHijriMonth(m => m + 1);
    }
  };

  // Events for current month
  const monthEvents = EVENTS.filter(e => e.hijriMonth === currentHijriMonth);

  // Upcoming events (next 3 months)
  const upcomingEvents = EVENTS.filter(e => {
    const monthDiff = (e.hijriMonth - currentHijriMonth + 12) % 12;
    return monthDiff >= 0 && monthDiff <= 3;
  }).slice(0, 5);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Islamic calendar</Text>
          <Text style={s.subtitle}>Hijri year {currentHijriYear} AH</Text>
        </View>

        {/* Month navigation */}
        <View style={s.monthNav}>
          <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
            <Text style={s.navBtnText}>‹</Text>
          </TouchableOpacity>
          <View style={s.monthInfo}>
            <Text style={s.monthName}>{HIJRI_MONTHS[currentHijriMonth - 1]}</Text>
            <Text style={s.monthYear}>{currentHijriYear} AH</Text>
          </View>
          <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
            <Text style={s.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={s.calendarCard}>

          {/* Day headers */}
          <View style={s.dayHeaderRow}>
            {DAYS_OF_WEEK.map(d => (
              <Text key={d} style={[s.dayHeader, d === 'Fri' && s.fridayHeader]}>{d}</Text>
            ))}
          </View>

          {/* Calendar cells */}
          <View style={s.calendarGrid}>
            {/* Empty cells for first day offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`empty-${i}`} style={s.dayCell} />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day      = i + 1;
              const isToday  = day === todayHijriDay && currentHijriMonth === 12 && currentHijriYear === 1447;
              const hasEvent = monthEvents.some(e => e.day === day);
              const dayOfWeek = (firstDay + i) % 7;
              const isFriday  = dayOfWeek === 5;

              return (
                <View key={day} style={[s.dayCell, isToday && s.todayCell]}>
                  <Text style={[
                    s.dayNum,
                    isToday  && s.todayNum,
                    isFriday && !isToday && s.fridayNum,
                  ]}>
                    {day}
                  </Text>
                  {hasEvent && (
                    <View style={[s.eventDot, { backgroundColor: isToday ? colors.bgDark : colors.accent }]} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={s.legend}>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={s.legendText}>Today</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: colors.accent }]} />
              <Text style={s.legendText}>Islamic event</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: colors.accent, opacity: 0.5 }]} />
              <Text style={s.legendText}>Friday</Text>
            </View>
          </View>
        </View>

        {/* Events this month */}
        {monthEvents.length > 0 && (
          <>
            <Text style={s.sectionLabel}>
              Events in {HIJRI_MONTHS[currentHijriMonth - 1]}
            </Text>
            <View style={s.card}>
              {monthEvents.map((event, i) => (
                <View key={i} style={[s.eventRow, i === monthEvents.length - 1 && s.lastRow]}>
                  <View style={s.eventIconWrap}>
                    <Text style={s.eventIcon}>{event.icon}</Text>
                  </View>
                  <View style={s.eventInfo}>
                    <Text style={s.eventName}>{event.name}</Text>
                    <Text style={s.eventDesc}>{event.desc}</Text>
                  </View>
                  <Text style={s.eventDay}>{event.day}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Upcoming events */}
        <Text style={s.sectionLabel}>Upcoming events</Text>
        <View style={s.card}>
          {upcomingEvents.map((event, i) => (
            <View key={i} style={[s.eventRow, i === upcomingEvents.length - 1 && s.lastRow]}>
              <View style={[s.eventIconWrap, { backgroundColor: `${colors.accent}10` }]}>
                <Text style={s.eventIcon}>{event.icon}</Text>
              </View>
              <View style={s.eventInfo}>
                <Text style={s.eventName}>{event.name}</Text>
                <Text style={s.eventDesc}>
                  {event.day} {HIJRI_MONTHS[event.hijriMonth - 1]} {currentHijriYear} AH
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Important months */}
        <Text style={s.sectionLabel}>Sacred months</Text>
        <View style={s.sacredCard}>
          {[
            { name: 'Muharram',   num: 1,  desc: 'First month · Day of Ashura (10th)' },
            { name: 'Rajab',      num: 7,  desc: 'Sacred month · Isra and Miraj' },
            { name: "Sha'ban",    num: 8,  desc: "Night of Bara'ah (15th)" },
            { name: 'Ramadan',    num: 9,  desc: 'Month of fasting · Laylat al-Qadr' },
            { name: 'Dhul Hijjah',num: 12, desc: 'Hajj · Day of Arafah · Eid al-Adha' },
          ].map((m, i, arr) => (
            <View key={m.num} style={[s.sacredRow, i === arr.length - 1 && s.lastRow]}>
              <View style={[s.sacredNum, currentHijriMonth === m.num && s.sacredNumActive]}>
                <Text style={[s.sacredNumText, currentHijriMonth === m.num && s.sacredNumTextActive]}>
                  {m.num}
                </Text>
              </View>
              <View style={s.sacredInfo}>
                <Text style={s.sacredName}>{m.name}</Text>
                <Text style={s.sacredDesc}>{m.desc}</Text>
              </View>
            </View>
          ))}
        </View>

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
  subtitle:     { fontSize: fontSizes.sm, color: colors.accent, marginTop: 2, fontFamily: fonts.body },
  sectionLabel: { fontSize: fontSizes.xs, fontWeight: '500', color: colors.textDarkTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing[2], marginTop: spacing[4], fontFamily: fonts.medium },
  card:         { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, paddingHorizontal: spacing[4], marginBottom: spacing[2] },
  lastRow:      { borderBottomWidth: 0 },

  monthNav:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing[3], marginBottom: spacing[3] },
  navBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  navBtnText:   { fontSize: 20, color: colors.primary, fontFamily: fonts.medium },
  monthInfo:    { alignItems: 'center' },
  monthName:    { fontSize: fontSizes.lg, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  monthYear:    { fontSize: fontSizes.xs, color: colors.accent, marginTop: 2, fontFamily: fonts.body },

  calendarCard:    { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3] },
  dayHeaderRow:    { flexDirection: 'row', marginBottom: spacing[2] },
  dayHeader:       { flex: 1, textAlign: 'center', fontSize: fontSizes.xs, color: colors.textDarkTertiary, fontFamily: fonts.medium },
  fridayHeader:    { color: colors.accent },
  calendarGrid:    { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell:         { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  todayCell:       { backgroundColor: `${colors.primary}22`, borderRadius: radius.sm },
  dayNum:          { fontSize: fontSizes.xs, color: colors.textDarkSecondary, fontFamily: fonts.body },
  todayNum:        { color: colors.primary, fontWeight: '500', fontFamily: fonts.medium },
  fridayNum:       { color: colors.accent },
  eventDot:        { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  legend:          { flexDirection: 'row', justifyContent: 'center', gap: spacing[5], marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 0.5, borderTopColor: colors.borderDark },
  legendItem:      { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  legendDot:       { width: 6, height: 6, borderRadius: 3 },
  legendText:      { fontSize: 10, color: colors.textDarkTertiary, fontFamily: fonts.body },

  eventRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 0.5, borderBottomColor: colors.borderDark, gap: spacing[3] },
  eventIconWrap:   { width: 36, height: 36, borderRadius: 10, backgroundColor: `${colors.primary}12`, alignItems: 'center', justifyContent: 'center' },
  eventIcon:       { fontSize: 18 },
  eventInfo:       { flex: 1 },
  eventName:       { fontSize: fontSizes.sm, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  eventDesc:       { fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginTop: 2, fontFamily: fonts.body },
  eventDay:        { fontSize: fontSizes.md, fontWeight: '500', color: colors.accent, fontFamily: fonts.medium },

  sacredCard:      { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, paddingHorizontal: spacing[4] },
  sacredRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 0.5, borderBottomColor: colors.borderDark, gap: spacing[3] },
  sacredNum:       { width: 32, height: 32, borderRadius: 16, backgroundColor: `${colors.accent}12`, borderWidth: 0.5, borderColor: `${colors.accent}25`, alignItems: 'center', justifyContent: 'center' },
  sacredNumActive: { backgroundColor: `${colors.accent}30`, borderColor: `${colors.accent}60` },
  sacredNumText:   { fontSize: fontSizes.xs, color: colors.accent, fontFamily: fonts.medium },
  sacredNumTextActive: { fontWeight: '700' },
  sacredInfo:      { flex: 1 },
  sacredName:      { fontSize: fontSizes.sm, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  sacredDesc:      { fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginTop: 2, fontFamily: fonts.body },
});