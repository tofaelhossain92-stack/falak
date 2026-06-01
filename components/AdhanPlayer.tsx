import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing,
} from 'react-native';
import { stopAdhan } from '../services/adhan-service';
import { colors, fonts, fontSizes, radius, spacing } from '../brand/tokens/brand-tokens';

interface AdhanPlayerProps {
  prayer:  string;
  isFajr:  boolean;
  visible: boolean;
  onDismiss: () => void;
}

export default function AdhanPlayer({ prayer, isFajr, visible, onDismiss }: AdhanPlayerProps) {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      // Pulse animation while adhan plays
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible]);

  if (!visible) return null;

  const handleStop = async () => {
    await stopAdhan();
    onDismiss();
  };

  return (
    <View style={s.overlay}>
      <View style={s.card}>

        {/* Pulsing icon */}
        <Animated.View style={[s.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={s.icon}>{isFajr ? '🌙' : '🕌'}</Text>
        </Animated.View>

        {/* Prayer name */}
        <Text style={s.prayerName}>{prayer}</Text>
        <Text style={s.prayerArabic}>
          {isFajr ? 'الفجر' : prayer === 'Dhuhr' ? 'الظهر' : prayer === 'Asr' ? 'العصر' : prayer === 'Maghrib' ? 'المغرب' : 'العشاء'}
        </Text>

        {/* Adhan playing indicator */}
        <View style={s.playingRow}>
          <View style={s.playingDot} />
          <Text style={s.playingText}>
            {isFajr ? 'Adhan al-Fajr playing' : 'Adhan playing'} · Mishary Rashid
          </Text>
        </View>

        {/* Fajr special text */}
        {isFajr && (
          <View style={s.fajrCard}>
            <Text style={s.fajrArabic}>الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ</Text>
            <Text style={s.fajrEnglish}>"Prayer is better than sleep"</Text>
          </View>
        )}

        {/* Stop button */}
        <TouchableOpacity style={s.stopBtn} onPress={handleStop}>
          <Text style={s.stopText}>■  Stop adhan</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position:        'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(6,12,30,0.92)',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          999,
  },
  card: {
    backgroundColor: colors.bgDark,
    borderWidth:     0.5,
    borderColor:     `${colors.primary}40`,
    borderRadius:    radius.xl,
    padding:         spacing[8],
    alignItems:      'center',
    gap:             spacing[4],
    marginHorizontal:spacing[6],
    width:           '85%',
  },
  iconWrap: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: `${colors.primary}15`,
    borderWidth:     0.5,
    borderColor:     `${colors.primary}40`,
    alignItems:      'center',
    justifyContent:  'center',
  },
  icon:        { fontSize: 36 },
  prayerName:  { fontSize: 32, fontWeight: '300', color: colors.textDarkPrimary, fontFamily: fonts.display, letterSpacing: 1 },
  prayerArabic:{ fontSize: 18, color: colors.textDarkSecondary, fontFamily: fonts.serif },
  playingRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  playingDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.prayer },
  playingText: { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },
  fajrCard:    { backgroundColor: `${colors.accent}0a`, borderWidth: 0.5, borderColor: `${colors.accent}25`, borderRadius: radius.lg, padding: spacing[4], alignItems: 'center', gap: spacing[2], width: '100%' },
  fajrArabic:  { fontSize: 16, color: colors.accent, fontFamily: fonts.serif, textAlign: 'center', lineHeight: 28 },
  fajrEnglish: { fontSize: fontSizes.sm, color: `${colors.accent}aa`, fontStyle: 'italic', fontFamily: fonts.body, textAlign: 'center' },
  stopBtn:     { backgroundColor: `${colors.primary}15`, borderWidth: 0.5, borderColor: `${colors.primary}35`, borderRadius: radius.lg, paddingHorizontal: spacing[8], paddingVertical: spacing[3] },
  stopText:    { fontSize: fontSizes.sm, color: colors.primary, fontFamily: fonts.medium },
});