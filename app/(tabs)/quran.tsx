import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../../brand/tokens/brand-tokens';

export default function QuranScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quran</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xl,
    color: colors.textDarkPrimary,
  },
});
