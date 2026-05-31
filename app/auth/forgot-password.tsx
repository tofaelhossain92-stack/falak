import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts, fontSizes, radius, spacing } from '../../brand/tokens/brand-tokens';

export default function ForgotPasswordScreen() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleReset = async () => {
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return; }
    setError('');
    setLoading(true);
    try {
      // Mock — replace with Firebase sendPasswordResetEmail later
      await new Promise(r => setTimeout(r, 1000));
      setSent(true);
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.container}>

          {/* Back */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Icon */}
          <View style={s.iconWrap}>
            <View style={s.iconCircle}>
              <Text style={s.iconEmoji}>🔑</Text>
            </View>
          </View>

          {sent ? (
            /* Success state */
            <View style={s.successWrap}>
              <View style={s.successIconWrap}>
                <Text style={s.successIcon}>✉️</Text>
              </View>
              <Text style={s.successTitle}>Check your email</Text>
              <Text style={s.successDesc}>
                We sent a reset link to{'\n'}
                <Text style={s.successEmail}>{email}</Text>
              </Text>
              <TouchableOpacity
                style={s.primaryBtn}
                onPress={() => router.replace('/auth/sign-in')}
              >
                <Text style={s.primaryBtnText}>Back to sign in</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReset} style={{ marginTop: spacing[3] }}>
                <Text style={s.resendText}>
                  Didn't receive it? <Text style={s.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Form state */
            <View style={s.formWrap}>
              <Text style={s.title}>Reset your password</Text>
              <Text style={s.subtitle}>
                Enter the email linked to your account. We'll send you a reset link.
              </Text>

              <View style={s.fieldWrap}>
                <Text style={s.label}>Email address</Text>
                <TextInput
                  style={[s.input, error && s.inputError]}
                  value={email}
                  onChangeText={t => { setEmail(t); setError(''); }}
                  placeholder="you@email.com"
                  placeholderTextColor={colors.textDarkTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
                {error ? <Text style={s.errorText}>{error}</Text> : null}
              </View>

              <TouchableOpacity
                style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={s.primaryBtnText}>Send reset link</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace('/auth/sign-in')}
                style={{ marginTop: spacing[3], alignItems: 'center' }}
              >
                <Text style={s.signinText}>
                  Remember it? <Text style={s.signinLink}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.bgDark },
  container: { flex: 1, paddingHorizontal: spacing[5] },
  backBtn:   { paddingTop: spacing[3], paddingBottom: spacing[2] },
  backText:  { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },
  iconWrap:  { alignItems: 'center', marginTop: spacing[8], marginBottom: spacing[6] },
  iconCircle:{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.primary}15`, borderWidth: 0.5, borderColor: `${colors.primary}35`, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 32 },
  formWrap:  { gap: spacing[4] },
  title:     { fontSize: fontSizes['2xl'], fontWeight: '300', color: colors.textDarkPrimary, fontFamily: fonts.display, letterSpacing: 0.5, textAlign: 'center' },
  subtitle:  { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body, textAlign: 'center', lineHeight: 22 },
  fieldWrap: { gap: spacing[1] },
  label:     { fontSize: fontSizes.xs, color: colors.textDarkSecondary, textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: fonts.medium },
  input:     { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.md, padding: spacing[4], fontSize: fontSizes.sm, color: colors.textDarkPrimary, fontFamily: fonts.body },
  inputError:{ borderColor: '#f87171' },
  errorText: { fontSize: fontSizes.xs, color: '#f87171', fontFamily: fonts.body },
  primaryBtn:{ backgroundColor: `${colors.primary}22`, borderWidth: 0.5, borderColor: `${colors.primary}55`, borderRadius: radius.lg, padding: spacing[4], alignItems: 'center', marginTop: spacing[2] },
  primaryBtnDisabled:{ opacity: 0.6 },
  primaryBtnText:{ fontSize: fontSizes.md, fontWeight: '500', color: colors.primary, fontFamily: fonts.medium },
  signinText:{ fontSize: fontSizes.sm, color: colors.textDarkTertiary, fontFamily: fonts.body },
  signinLink:{ color: colors.primary },
  successWrap:  { alignItems: 'center', gap: spacing[4] },
  successIconWrap:{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.prayer}12`, borderWidth: 0.5, borderColor: `${colors.prayer}30`, alignItems: 'center', justifyContent: 'center' },
  successIcon:  { fontSize: 32 },
  successTitle: { fontSize: fontSizes['2xl'], fontWeight: '300', color: colors.textDarkPrimary, fontFamily: fonts.display, letterSpacing: 0.5 },
  successDesc:  { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body, textAlign: 'center', lineHeight: 22 },
  successEmail: { color: colors.textDarkPrimary, fontFamily: fonts.medium },
  resendText:   { fontSize: fontSizes.sm, color: colors.textDarkTertiary, fontFamily: fonts.body },
  resendLink:   { color: colors.primary },
});
