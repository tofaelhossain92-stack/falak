import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
} from '@expo-google-fonts/cormorant-garamond';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../brand/tokens/brand-tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'DMSans-Light': DMSans_300Light,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'CormorantGaramond-Light': CormorantGaramond_300Light,
    'CormorantGaramond-Regular': CormorantGaramond_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgDark, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" backgroundColor={colors.bgDark} />
    </>
  );
}
