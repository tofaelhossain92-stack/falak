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

export default function SignInScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!email.trim())  e.email    = 'Email is required';
    if (!password)      e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Mock sign in — replace with Firebase later
      await new Promise(r => setTimeout(r, 1000));
      const user = { email: email.trim(), signedInAt: new Date().toISOString() };
      await AsyncStorage.setItem('falak_user', JSON.stringify(user));
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await AsyncStorage.setItem('falak_user', JSON.stringify({ guest: true }));
    router.replace('/(tabs)');
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
          {/* Back */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={s.header}>
            <FalakLogo />
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to your Falak account</Text>
          </View>

          {/* Form */}
          <View style={s.form}>

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

            <View style={s.fieldWrap}>
              <View style={s.labelRow}>
                <Text style={s.label}>Password</Text>
                <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                  <Text style={s.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={s.passwordWrap}>
                <TextInput
                  style={[s.input, s.passwordInput, errors.password && s.inputError]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  placeholderTextColor={colors.textDarkTertiary}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={s.showPassBtn} onPress={() => setShowPass(!showPass)}>
                  <Text style={s.showPassText}>{showPass ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={s.errorText}>{errors.password}</Text>}
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={s.primaryBtnText}>Sign in</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Social */}
            <View style={s.socialRow}>
              <TouchableOpacity style={s.socialBtn} onPress={() => Alert.alert('Google', 'Connect Firebase to enable.')}>
                <Text style={s.socialBtnText}>🌐  Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.socialBtn} onPress={() => Alert.alert('Apple', 'Connect Firebase to enable.')}>
                <Text style={s.socialBtnText}> Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Guest mode */}
            <TouchableOpacity style={s.guestBtn} onPress={handleGuest}>
              <Text style={s.guestText}>Continue without account</Text>
            </TouchableOpacity>

            {/* Sign up link */}
            <TouchableOpacity style={s.signupRow} onPress={() => router.replace('/auth/sign-up')}>
              <Text style={s.signupText}>
                Don't have an account?{' '}
                <Text style={s.signupLink}>Sign up</Text>
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
  form:   { gap: spacing[4] },
  fieldWrap:{ gap: spacing[1] },
  labelRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  label:  { fontSize: fontSizes.xs, color: colors.textDarkSecondary, textTransform:'uppercase', letterSpacing:0.6, fontFamily: fonts.medium },
  forgotText:{ fontSize: fontSizes.xs, color: colors.primary, fontFamily: fonts.body },
  input:  { backgroundColor: colors.bgDarkCard, borderWidth:0.5, borderColor: colors.borderDark, borderRadius: radius.md, padding: spacing[4], fontSize: fontSizes.sm, color: colors.textDarkPrimary, fontFamily: fonts.body },
  inputError:{ borderColor:'#f87171' },
  errorText:{ fontSize: fontSizes.xs, color:'#f87171', fontFamily: fonts.body },
  passwordWrap:{ position:'relative' },
  passwordInput:{ paddingRight: 64 },
  showPassBtn:{ position:'absolute', right: spacing[3], top:0, bottom:0, justifyContent:'center' },
  showPassText:{ fontSize: fontSizes.xs, color: colors.primary, fontFamily: fonts.medium },
  primaryBtn:{ backgroundColor:`${colors.primary}22`, borderWidth:0.5, borderColor:`${colors.primary}55`, borderRadius: radius.lg, padding: spacing[4], alignItems:'center' },
  primaryBtnDisabled:{ opacity:0.6 },
  primaryBtnText:{ fontSize: fontSizes.md, fontWeight:'500', color: colors.primary, fontFamily: fonts.medium },
  dividerRow:{ flexDirection:'row', alignItems:'center', gap: spacing[3] },
  dividerLine:{ flex:1, height:0.5, backgroundColor: colors.borderDark },
  dividerText:{ fontSize: fontSizes.xs, color: colors.textDarkTertiary, fontFamily: fonts.body },
  socialRow:{ flexDirection:'row', gap: spacing[3] },
  socialBtn:{ flex:1, backgroundColor: colors.bgDarkCard, borderWidth:0.5, borderColor: colors.borderDark, borderRadius: radius.md, padding: spacing[3], alignItems:'center' },
  socialBtnText:{ fontSize: fontSizes.sm, color: colors.textDarkPrimary, fontFamily: fonts.body },
  guestBtn:{ backgroundColor: colors.bgDarkCard, borderWidth:0.5, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing[4], alignItems:'center' },
  guestText:{ fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },
  signupRow:{ alignItems:'center', paddingVertical: spacing[2] },
  signupText:{ fontSize: fontSizes.sm, color: colors.textDarkTertiary, fontFamily: fonts.body },
  signupLink:{ color: colors.primary },
});
