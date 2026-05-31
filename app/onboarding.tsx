import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, fontSizes, radius, spacing } from '../brand/tokens/brand-tokens';

const { width } = Dimensions.get('window');

// ── Slides ────────────────────────────────────────────────────────
const SLIDES = [
  {
    icon:    '🌤️',
    title:   'Falak',
    arabic:  'فَلَك',
    meaning: 'Sky · Orbit · Heavens',
    desc:    'Your weather and prayer companion. Powered by AI. Rooted in faith.',
    ayah:    'رَبِّ زِدْنِى عِلْمًا',
    ayahEn:  '"My Lord, increase me in knowledge"',
    ayahRef: 'Surah Ta-Ha 20:114',
    accent:  colors.primary,
  },
  {
    icon:    '🌤️',
    title:   'Live weather',
    desc:    'Real-time weather for your location. Hourly forecasts, UV index, air quality, and Edmonton winter alerts.',
    features:['📍 Auto-detects your location','⏰ Hourly & 7-day forecast','🌡️ Feels like & wind speed','⚠️ Edmonton winter mode'],
    accent:  colors.primary,
  },
  {
    icon:    '🕌',
    title:   'Prayer times',
    desc:    'Accurate prayer times for your exact location. Tahajjud window, Nafl guidance, and AI-powered post-prayer suggestions.',
    features:['🌙 All 5 daily prayers + Sunrise','🌌 Tahajjud time (last third)','🤲 AI post-prayer tasks & dhikr','📿 Nafl prayer Sunnah guide'],
    accent:  colors.prayer,
  },
  {
    icon:    '📖',
    title:   'Quran & dhikr',
    desc:    'Daily verse with AI reflection, post-prayer dhikr counter, and weekly prayer tracker.',
    features:['✨ Verse of the day + AI reflection','📿 Dhikr counter (SubhanAllah · Alhamdulillah · Allahu Akbar)','📊 Weekly prayer tracker','🔥 Prayer streak & stats'],
    accent:  colors.accent,
  },
];

// ── Falak logo ────────────────────────────────────────────────────
function FalakLogo({ size = 80 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position:'absolute', width:size, height:size, borderRadius:size/2, borderWidth:0.8, borderColor:`${colors.primary}35` }} />
      <View style={{ position:'absolute', width:size*0.56, height:size*0.56, borderRadius:size*0.28, backgroundColor:colors.primary }} />
      <View style={{ position:'absolute', width:size*0.47, height:size*0.47, borderRadius:size*0.235, backgroundColor:colors.bgDark, transform:[{translateX:size*0.085},{translateY:-size*0.068}] }} />
      <View style={{ position:'absolute', width:size*0.1, height:size*0.1, borderRadius:size*0.05, backgroundColor:colors.accent, top:size*0.05, alignSelf:'center' }} />
      <View style={{ position:'absolute', width:size*0.05, height:size*0.05, borderRadius:size*0.025, backgroundColor:colors.accent }} />
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrent(index);
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      handleEnterApp();
    }
  };

  // ── Goes straight to app — no login required ──
  const handleEnterApp = async () => {
    await AsyncStorage.setItem('falak_onboarded', 'true');
    router.replace('/(tabs)');
  };

  const slide = SLIDES[current];

  return (
    <SafeAreaView style={s.safe}>

      {/* Skip button */}
      {current < SLIDES.length - 1 && (
        <TouchableOpacity style={s.skipBtn} onPress={handleEnterApp}>
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((sl, i) => (
          <View key={i} style={[s.slide, { width }]}>

            {/* Icon */}
            <View style={s.iconWrap}>
              {i === 0 ? (
                <FalakLogo size={100} />
              ) : (
                <View style={[s.iconCircle, { borderColor:`${sl.accent}40`, backgroundColor:`${sl.accent}12` }]}>
                  <Text style={s.iconEmoji}>{sl.icon}</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text style={[s.title, { color: sl.accent }]}>{sl.title}</Text>
            {sl.arabic  && <Text style={s.arabic}>{sl.arabic}</Text>}
            {sl.meaning && <Text style={s.meaning}>{sl.meaning}</Text>}

            {/* Description */}
            <Text style={s.desc}>{sl.desc}</Text>

            {/* Features */}
            {sl.features && (
              <View style={s.featureList}>
                {sl.features.map((f, fi) => (
                  <View key={fi} style={s.featureRow}>
                    <Text style={s.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Ayah (slide 0) */}
            {sl.ayah && (
              <View style={[s.ayahCard, { borderColor:`${sl.accent}30` }]}>
                <Text style={[s.ayahArabic, { color: sl.accent }]}>{sl.ayah}</Text>
                <Text style={s.ayahEnglish}>{sl.ayahEn}</Text>
                <Text style={[s.ayahRef, { color: sl.accent }]}>{sl.ayahRef}</Text>
              </View>
            )}

          </View>
        ))}
      </ScrollView>

      {/* Bottom */}
      <View style={s.bottom}>

        {/* Dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[
                s.dot,
                i === current
                  ? { backgroundColor: slide.accent, width: 20, height: 6, borderRadius: radius.full }
                  : { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.borderDark },
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Main button */}
        <TouchableOpacity
          style={[s.nextBtn, { backgroundColor:`${slide.accent}22`, borderColor:`${slide.accent}50` }]}
          onPress={handleNext}
        >
          <Text style={[s.nextText, { color: slide.accent }]}>
            {current === SLIDES.length - 1 ? '🌤️  Enter Falak' : 'Next  →'}
          </Text>
        </TouchableOpacity>

        {/* Last slide — optional sign up nudge */}
        {current === SLIDES.length - 1 && (
          <TouchableOpacity
            onPress={() => {
              AsyncStorage.setItem('falak_onboarded', 'true');
              router.replace('/auth/sign-up');
            }}
            style={{ marginTop: spacing[2] }}
          >
            <Text style={s.accountNudge}>
              Want to save your streak?{' '}
              <Text style={{ color: slide.accent }}>Create account</Text>
            </Text>
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bgDark },
  skipBtn: { position:'absolute', top:56, right:spacing[5], zIndex:10, padding:spacing[2] },
  skipText:{ fontSize:fontSizes.sm, color:colors.textDarkSecondary, fontFamily:fonts.body },
  slide:   { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:spacing[6], paddingTop:spacing[8] },
  iconWrap:{ marginBottom:spacing[6] },
  iconCircle:{ width:100, height:100, borderRadius:50, borderWidth:1, alignItems:'center', justifyContent:'center' },
  iconEmoji:{ fontSize:44 },
  title:   { fontSize:36, fontWeight:'300', fontFamily:fonts.display, letterSpacing:1, textAlign:'center', marginBottom:spacing[1] },
  arabic:  { fontSize:22, fontFamily:fonts.serif, color:colors.textDarkSecondary, marginBottom:spacing[1], textAlign:'center' },
  meaning: { fontSize:fontSizes.sm, color:colors.textDarkTertiary, fontFamily:fonts.body, marginBottom:spacing[4], letterSpacing:1, textTransform:'uppercase' },
  desc:    { fontSize:fontSizes.md, color:colors.textDarkSecondary, textAlign:'center', lineHeight:24, fontFamily:fonts.body, marginBottom:spacing[5], paddingHorizontal:spacing[2] },
  featureList:{ width:'100%', gap:spacing[2], marginBottom:spacing[4] },
  featureRow: { backgroundColor:colors.bgDarkCard, borderWidth:0.5, borderColor:colors.borderDark, borderRadius:radius.md, padding:spacing[3] },
  featureText:{ fontSize:fontSizes.sm, color:colors.textDarkPrimary, fontFamily:fonts.body },
  ayahCard:   { backgroundColor:`${colors.primary}0a`, borderWidth:0.5, borderRadius:radius.lg, padding:spacing[4], width:'100%', alignItems:'center', gap:spacing[2] },
  ayahArabic: { fontSize:20, fontFamily:fonts.serif, textAlign:'center' },
  ayahEnglish:{ fontSize:fontSizes.sm, color:colors.textDarkSecondary, fontStyle:'italic', fontFamily:fonts.body, textAlign:'center', lineHeight:22 },
  ayahRef:    { fontSize:fontSizes.xs, fontFamily:fonts.medium },
  bottom:  { paddingHorizontal:spacing[6], paddingBottom:spacing[8], alignItems:'center', gap:spacing[4] },
  dots:    { flexDirection:'row', gap:spacing[2], alignItems:'center' },
  dot:     { height:6, borderRadius:radius.full },
  nextBtn: { width:'100%', paddingVertical:spacing[4], borderRadius:radius.lg, borderWidth:0.5, alignItems:'center' },
  nextText:{ fontSize:fontSizes.md, fontWeight:'500', fontFamily:fonts.medium },
  accountNudge:{ fontSize:fontSizes.sm, color:colors.textDarkTertiary, fontFamily:fonts.body },
});
