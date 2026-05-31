import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, fontSizes, radius, spacing } from '../../brand/tokens/brand-tokens';

// ── Falak logo ────────────────────────────────────────────────────
function FalakLogo() {
  return (
    <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position:'absolute', width:56, height:56, borderRadius:28, borderWidth:0.8, borderColor:`${colors.primary}35` }} />
      <View style={{ position:'absolute', width:32, height:32, borderRadius:16, backgroundColor:colors.primary }} />
      <View style={{ position:'absolute', width:27, height:27, borderRadius:13.5, backgroundColor:colors.bgDark, transform:[{translateX:5},{translateY:-4}] }} />
      <View style={{ position:'absolute', width:6, height:6, borderRadius:3, backgroundColor:colors.accent, top:5, alignSelf:'center' }} />
      <View style={{ position:'absolute', width:3, height:3, borderRadius:1.5, backgroundColor:colors.accent }} />
    </View>
  );
}

export default function SignUpScreen() {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [agreed, setAgreed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [errors, setErrors]       = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!name.trim())          e.name     = 'Name is required';
    if (!email.trim())         e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (password.length < 8)  e.password = 'Password must be at least 8 characters';
    if (!agreed)               e.agreed   = 'Please agree to the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Mock sign up — replace with Firebase later
      await new Promise(r => setTimeout(r, 1200));
      const user = { name: name.trim(), email: email.trim(), createdAt: new Date().toISOString() };
      await AsyncStorage.setItem('falak_user', JSON.stringify(user));
      router.replace('/(tabs)');
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
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Logo + title */}
          <View style={s.header}>
            <FalakLogo />
            <Text style={s.title}>Create your account</Text>
            <Text style={s.subtitle}>Save your prayers, settings & streak</Text>
          </View>

          {/* Onboarding dots */}
          <View style={s.dotsRow}>
            <View style={[s.dot, s.dotDone]} />
            <View style={[s.dot, s.dotDone]} />
            <View style={[s.dot, s.dotActive]} />
            <View style={s.dot} />
          </View>

          {/* Form */}
          <View style={s.form}>

            {/* Name */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Full name</Text>
              <TextInput
                style={[s.input, errors.name && s.inputError]}
                value={name}
                onChangeText={setName}
                placeholder="Tofael Ahmed"
                placeholderTextColor={colors.textDarkTertiary}
                autoCapitalize="words"
              />
              {errors.name && <Text style={s.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Email address</Text>
              <TextInput
                style={[s.input, errors.email && s.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={colors.textDarkTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && <Text style={s.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Password</Text>
              <View style={s.passwordWrap}>
                <TextInput
                  style={[s.input, s.passwordInput, errors.password && s.inputError]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.textDarkTertiary}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={s.showPassBtn}
                  onPress={() => setShowPass(!showPass)}
                >
                  <Text style={s.showPassText}>{showPass ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={s.errorText}>{errors.password}</Text>}
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={s.termsRow}
              onPress={() => setAgreed(!agreed)}
            >
              <View style={[s.checkbox, agreed && s.checkboxChecked]}>
                {agreed && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.termsText}>
                I agree to the{' '}
                <Text style={s.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={s.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.agreed && <Text style={s.errorText}>{errors.agreed}</Text>}

            {/* Sign up button */}
            <TouchableOpacity
              style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={s.primaryBtnText}>Create account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or continue with</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={s.socialRow}>
              <TouchableOpacity
                style={s.socialBtn}
                onPress={() => Alert.alert('Google Sign In', 'Connect Firebase to enable Google sign in.')}
              >
                <Text style={s.socialBtnText}>🌐  Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.socialBtn}
                onPress={() => Alert.alert('Apple Sign In', 'Connect Firebase to enable Apple sign in.')}
              >
                <Text style={s.socialBtnText}> Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Sign in link */}
            <TouchableOpacity
              style={s.signinRow}
              onPress={() => router.replace('/auth/sign-in')}
            >
              <Text style={s.signinText}>
                Already have an account?{' '}
                <Text style={s.signinLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>

          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bgDark },
  scroll: { flex: 1, paddingHorizontal: spacing[5] },
  backBtn:{ paddingTop: spacing[3], paddingBottom: spacing[2] },
  backText:{ fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },
  header: { alignItems: 'center', paddingVertical: spacing[5], gap: spacing[2] },
  title:  { fontSize: fontSizes['2xl'], fontWeight: '300', color: colors.textDarkPrimary, fontFamily: fonts.display, letterSpacing: 0.5 },
  subtitle:{ fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },
  dotsRow:{ flexDirection:'row', gap: 6, justifyContent:'center', marginBottom: spacing[6] },
  dot:    { width:6, height:6, borderRadius:3, backgroundColor: colors.borderDark },
  dotActive:{ width:18, borderRadius:3, backgroundColor: colors.primary },
  dotDone:{ backgroundColor: `${colors.primary}60` },
  form:   { gap: spacing[4] },
  fieldWrap:{ gap: spacing[1] },
  label:  { fontSize: fontSizes.xs, color: colors.textDarkSecondary, textTransform:'uppercase', letterSpacing:0.6, fontFamily: fonts.medium },
  input:  { backgroundColor: colors.bgDarkCard, borderWidth:0.5, borderColor: colors.borderDark, borderRadius: radius.md, padding: spacing[4], fontSize: fontSizes.sm, color: colors.textDarkPrimary, fontFamily: fonts.body },
  inputError:{ borderColor: '#f87171' },
  errorText:{ fontSize: fontSizes.xs, color:'#f87171', fontFamily: fonts.body },
  passwordWrap:{ position:'relative' },
  passwordInput:{ paddingRight: 64 },
  showPassBtn:{ position:'absolute', right: spacing[3], top:0, bottom:0, justifyContent:'center' },
  showPassText:{ fontSize: fontSizes.xs, color: colors.primary, fontFamily: fonts.medium },
  termsRow:{ flexDirection:'row', gap: spacing[3], alignItems:'flex-start' },
  checkbox:{ width:18, height:18, borderRadius:4, borderWidth:1.5, borderColor: colors.borderDark, alignItems:'center', justifyContent:'center', marginTop:2, flexShrink:0 },
  checkboxChecked:{ backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark:{ fontSize:10, color:'#fff', fontWeight:'700' },
  termsText:{ fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body, flex:1, lineHeight:20 },
  termsLink:{ color: colors.primary },
  primaryBtn:{ backgroundColor:`${colors.primary}22`, borderWidth:0.5, borderColor:`${colors.primary}55`, borderRadius: radius.lg, padding: spacing[4], alignItems:'center' },
  primaryBtnDisabled:{ opacity:0.6 },
  primaryBtnText:{ fontSize: fontSizes.md, fontWeight:'500', color: colors.primary, fontFamily: fonts.medium },
  dividerRow:{ flexDirection:'row', alignItems:'center', gap: spacing[3] },
  dividerLine:{ flex:1, height:0.5, backgroundColor: colors.borderDark },
  dividerText:{ fontSize: fontSizes.xs, color: colors.textDarkTertiary, fontFamily: fonts.body },
  socialRow:{ flexDirection:'row', gap: spacing[3] },
  socialBtn:{ flex:1, backgroundColor: colors.bgDarkCard, borderWidth:0.5, borderColor: colors.borderDark, borderRadius: radius.md, padding: spacing[3], alignItems:'center' },
  socialBtnText:{ fontSize: fontSizes.sm, color: colors.textDarkPrimary, fontFamily: fonts.body },
  signinRow:{ alignItems:'center', paddingVertical: spacing[2] },
  signinText:{ fontSize: fontSizes.sm, color: colors.textDarkTertiary, fontFamily: fonts.body },
  signinLink:{ color: colors.primary },
});
