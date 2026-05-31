import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../brand/tokens/brand-tokens';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay to let fonts load
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return (
    <View style={{ flex: 1, backgroundColor: colors.bgDark,
      alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"       options={{ headerShown: false }} />
        <Stack.Screen name="onboarding"  options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="auth/sign-in"   options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="auth/sign-up"   options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)"      options={{ headerShown: false, animation: 'fade' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
