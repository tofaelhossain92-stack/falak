import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../brand/tokens/brand-tokens';

export default function SplashScreen() {
  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('falak_onboarded');
      if (!onboarded) {
        // First time — show onboarding
        router.replace('/onboarding');
      } else {
        // Already onboarded — go straight to app
        router.replace('/(tabs)');
      }
    } catch {
      router.replace('/onboarding');
    }
  };

  return (
    <View style={s.container}>
      {/* Falak logo mark */}
      <View style={s.logoWrap}>
        <View style={s.outerRing} />
        <View style={s.crescent} />
        <View style={s.crescentCutout} />
        <View style={s.starDot} />
        <View style={s.centreDot} />
      </View>
      <ActivityIndicator color={colors.primary} style={{ marginTop: 48 }} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 120, height: 120,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute', width: 110, height: 110,
    borderRadius: 55, borderWidth: 1,
    borderColor: `${colors.primary}40`,
  },
  crescent: {
    position: 'absolute', width: 66, height: 66,
    borderRadius: 33, backgroundColor: colors.primary,
  },
  crescentCutout: {
    position: 'absolute', width: 56, height: 56,
    borderRadius: 28, backgroundColor: colors.bgDark,
    transform: [{ translateX: 10 }, { translateY: -8 }],
  },
  starDot: {
    position: 'absolute', width: 12, height: 12,
    borderRadius: 6, backgroundColor: colors.accent,
    top: 4, alignSelf: 'center',
  },
  centreDot: {
    position: 'absolute', width: 6, height: 6,
    borderRadius: 3, backgroundColor: colors.accent,
  },
});
