import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, fontSizes, radius, spacing } from '../brand/tokens/brand-tokens';

// ── Types ─────────────────────────────────────────────────────────
interface User {
  name?: string;
  email?: string;
  guest?: boolean;
  createdAt?: string;
}

// ── Falak logo ────────────────────────────────────────────────────
function FalakLogo() {
  return (
    <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position:'absolute', width:44, height:44, borderRadius:22, borderWidth:0.8, borderColor:`${colors.primary}35` }} />
      <View style={{ position:'absolute', width:25, height:25, borderRadius:12.5, backgroundColor:colors.primary }} />
      <View style={{ position:'absolute', width:21, height:21, borderRadius:10.5, backgroundColor:colors.bgDark, transform:[{translateX:4},{translateY:-3}] }} />
      <View style={{ position:'absolute', width:5, height:5, borderRadius:2.5, backgroundColor:colors.accent, top:4, alignSelf:'center' }} />
      <View style={{ position:'absolute', width:2.5, height:2.5, borderRadius:1.25, backgroundColor:colors.accent }} />
    </View>
  );
}

// ── Link row ──────────────────────────────────────────────────────
function LinkRow({ icon, label, value, onPress, danger }: {
  icon: string; label: string; value?: string;
  onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={s.linkRow} onPress={onPress}>
      <Text style={s.linkIcon}>{icon}</Text>
      <Text style={[s.linkLabel, danger && s.linkDanger]}>{label}</Text>
      {value
        ? <Text style={s.linkValue}>{value}</Text>
        : <Text style={s.linkChevron}>›</Text>
      }
    </TouchableOpacity>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function AccountScreen() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('falak_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    finally { setLoading(false); }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('falak_user');
            router.replace('/auth/sign-in');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all prayer tracking data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['falak_user', 'falak_onboarded']);
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const soon = (f: string) =>
    Alert.alert('Coming soon', `${f} will be available in a future update.`);

  if (loading) return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    </SafeAreaView>
  );

  // ── GUEST MODE ────────────────────────────────────────────────
  if (!user || user.guest) return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Guest hero */}
        <View style={s.guestHero}>
          <View style={s.guestAvatarCircle}>
            <Text style={s.guestAvatarIcon}>👤</Text>
          </View>
          <Text style={s.guestTitle}>Browsing as guest</Text>
          <Text style={s.guestSubtitle}>
            You have full access to weather and prayer times. Create an account to unlock more.
          </Text>
        </View>

        {/* Benefits card */}
        <View style={s.benefitsCard}>
          <Text style={s.benefitsTitle}>✨ With a free account you get:</Text>
          {[
            '🔥 Prayer streak tracked across devices',
            '☁️ Backup if you change phones',
            '📊 Monthly prayer history',
            '🌙 Ramadan progress tracker',
            '🔔 Personalised reminder settings saved',
          ].map((b, i) => (
            <View key={i} style={s.benefitRow}>
              <Text style={s.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View style={s.ctaWrap}>
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => router.push('/auth/sign-up')}
          >
            <Text style={s.primaryBtnText}>Create free account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => router.push('/auth/sign-in')}
          >
            <Text style={s.secondaryBtnText}>Sign in</Text>
          </TouchableOpacity>
        </View>

        {/* Features still available */}
        <View style={s.guestFeaturesCard}>
          <Text style={s.guestFeaturesTitle}>Available without account:</Text>
          {[
            '🌤️ Full live weather',
            '🕌 Real prayer times',
            '📖 Daily Quran verse',
            '📿 Dhikr counter',
            '🌌 Tahajjud times',
          ].map((f, i) => (
            <Text key={i} style={s.guestFeatureItem}>{f}</Text>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );

  // ── SIGNED IN MODE ────────────────────────────────────────────
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : '??';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={s.header}>
          <FalakLogo />
          <Text style={s.headerTitle}>My account</Text>
        </View>

        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarInitials}>{initials}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user.name ?? 'Falak user'}</Text>
            <Text style={s.profileEmail}>{user.email ?? ''}</Text>
            <View style={s.profileBadges}>
              <View style={s.badge}>
                <Text style={s.badgeText}>📍 Edmonton, CA</Text>
              </View>
              <View style={[s.badge, s.badgeTeal]}>
                <Text style={[s.badgeText, { color: colors.prayer }]}>ISNA · Hanafi</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Streak stats */}
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: colors.accent }]}>14</Text>
            <Text style={s.statLabel}>Day streak</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: '#4ade80' }]}>87%</Text>
            <Text style={s.statLabel}>This month</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statNum, { color: colors.primary }]}>312</Text>
            <Text style={s.statLabel}>Total prayers</Text>
          </View>
        </View>

        {/* Account settings */}
        <Text style={s.sectionLabel}>Account</Text>
        <View style={s.card}>
          <LinkRow icon="👤" label="Edit profile"      onPress={() => soon('Edit profile')} />
          <LinkRow icon="🔒" label="Change password"   onPress={() => soon('Change password')} />
          <LinkRow icon="✉️" label="Email"             value={user.email ?? ''} onPress={() => soon('Email')} />
          <LinkRow icon="☁️" label="Backup & sync"     value="On" onPress={() => soon('Backup')} />
        </View>

        {/* Prayer settings */}
        <Text style={s.sectionLabel}>Prayer preferences</Text>
        <View style={s.card}>
          <LinkRow icon="🕌" label="Calculation method" value="ISNA"    onPress={() => soon('Method')} />
          <LinkRow icon="📿" label="Asr method"          value="Hanafi"  onPress={() => soon('Asr')} />
          <LinkRow icon="📅" label="Hijri offset"        value="+0 days" onPress={() => soon('Hijri')} />
        </View>

        {/* Danger zone */}
        <Text style={s.sectionLabel}>Account actions</Text>
        <View style={s.card}>
          <LinkRow icon="🚪" label="Sign out"       onPress={handleSignOut} />
          <LinkRow icon="🗑️" label="Delete account" onPress={handleDeleteAccount} danger />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bgDark },
  scroll: { flex: 1, paddingHorizontal: spacing[4] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  backBtn:  { paddingTop: spacing[3], paddingBottom: spacing[1] },
  backText: { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },

  header:      { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3] },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },

  // Guest mode
  guestHero:        { alignItems: 'center', paddingVertical: spacing[6], gap: spacing[3] },
  guestAvatarCircle:{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.primary}15`, borderWidth: 0.5, borderColor: `${colors.primary}30`, alignItems: 'center', justifyContent: 'center' },
  guestAvatarIcon:  { fontSize: 32 },
  guestTitle:       { fontSize: fontSizes['2xl'], fontWeight: '300', color: colors.textDarkPrimary, fontFamily: fonts.display, letterSpacing: 0.5 },
  guestSubtitle:    { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing[4] },

  benefitsCard:  { backgroundColor: `${colors.primary}0d`, borderWidth: 0.5, borderColor: `${colors.primary}25`, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3] },
  benefitsTitle: { fontSize: fontSizes.sm, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium, marginBottom: spacing[3] },
  benefitRow:    { paddingVertical: spacing[2], borderBottomWidth: 0.5, borderBottomColor: colors.borderDark },
  benefitText:   { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },

  ctaWrap:       { gap: spacing[3], marginBottom: spacing[4] },
  primaryBtn:    { backgroundColor: `${colors.primary}22`, borderWidth: 0.5, borderColor: `${colors.primary}55`, borderRadius: radius.lg, padding: spacing[4], alignItems: 'center' },
  primaryBtnText:{ fontSize: fontSizes.md, fontWeight: '500', color: colors.primary, fontFamily: fonts.medium },
  secondaryBtn:  { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing[4], alignItems: 'center' },
  secondaryBtnText:{ fontSize: fontSizes.md, color: colors.textDarkSecondary, fontFamily: fonts.body },

  guestFeaturesCard:  { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing[4], gap: spacing[2] },
  guestFeaturesTitle: { fontSize: fontSizes.sm, fontWeight: '500', color: colors.textDarkSecondary, fontFamily: fonts.medium, marginBottom: spacing[1] },
  guestFeatureItem:   { fontSize: fontSizes.sm, color: colors.textDarkTertiary, fontFamily: fonts.body },

  // Signed in mode
  profileCard:   { backgroundColor: `${colors.primary}0d`, borderWidth: 0.5, borderColor: `${colors.primary}25`, borderRadius: radius.lg, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[4], marginBottom: spacing[3] },
  avatarCircle:  { width: 52, height: 52, borderRadius: 26, backgroundColor: `${colors.primary}25`, borderWidth: 1.5, borderColor: `${colors.primary}45`, alignItems: 'center', justifyContent: 'center' },
  avatarInitials:{ fontSize: fontSizes.md, fontWeight: '500', color: colors.primary, fontFamily: fonts.medium },
  profileInfo:   { flex: 1 },
  profileName:   { fontSize: fontSizes.md, fontWeight: '500', color: colors.textDarkPrimary, fontFamily: fonts.medium },
  profileEmail:  { fontSize: fontSizes.sm, color: colors.textDarkSecondary, marginTop: 2, fontFamily: fonts.body },
  profileBadges: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[2], flexWrap: 'wrap' },
  badge:         { backgroundColor: `${colors.accent}15`, borderWidth: 0.5, borderColor: `${colors.accent}30`, borderRadius: radius.full, paddingHorizontal: spacing[2], paddingVertical: 3 },
  badgeTeal:     { backgroundColor: `${colors.prayer}12`, borderColor: `${colors.prayer}28` },
  badgeText:     { fontSize: 10, color: colors.accent, fontFamily: fonts.body },

  statsRow:    { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing[4], flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing[4] },
  statItem:    { alignItems: 'center' },
  statNum:     { fontSize: fontSizes['2xl'], fontWeight: '300', fontFamily: fonts.light },
  statLabel:   { fontSize: fontSizes.xs, color: colors.textDarkTertiary, marginTop: 2, fontFamily: fonts.body },
  statDivider: { width: 0.5, backgroundColor: colors.borderDark },

  sectionLabel:{ fontSize: fontSizes.xs, fontWeight: '500', color: colors.textDarkTertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing[2], marginTop: spacing[4], fontFamily: fonts.medium },
  card:        { backgroundColor: colors.bgDarkCard, borderWidth: 0.5, borderColor: colors.borderDark, borderRadius: radius.lg, paddingHorizontal: spacing[4], marginBottom: spacing[2] },

  linkRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], borderBottomWidth: 0.5, borderBottomColor: colors.borderDark, gap: spacing[3] },
  linkIcon:   { fontSize: 16, width: 24, textAlign: 'center' },
  linkLabel:  { flex: 1, fontSize: fontSizes.sm, color: colors.textDarkPrimary, fontFamily: fonts.body },
  linkDanger: { color: '#f87171' },
  linkValue:  { fontSize: fontSizes.sm, color: colors.textDarkSecondary, fontFamily: fonts.body },
  linkChevron:{ fontSize: 18, color: colors.textDarkTertiary },
});