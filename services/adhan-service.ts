import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// ── Audio refs ────────────────────────────────────────────────────
let soundObject: Audio.Sound | null = null;

// ── Adhan audio files ─────────────────────────────────────────────
const ADHAN_REGULAR = require('../assets/audio/adhan.mp3');
const ADHAN_FAJR    = require('../assets/audio/adhan-fajr.mp3');

// ── Prayer names ──────────────────────────────────────────────────
const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// ── Setup notifications ───────────────────────────────────────────
export async function setupNotifications(): Promise<boolean> {
  // Configure how notifications behave
 Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  false,
    shouldSetBadge:   false,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

  // Request permission
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ── Play adhan ────────────────────────────────────────────────────
export async function playAdhan(isFajr: boolean = false) {
  try {
    // Stop any existing adhan first
    await stopAdhan();

    // Set audio mode — plays over silent mode for prayer times
    await Audio.setAudioModeAsync({
      allowsRecordingIOS:         false,
      staysActiveInBackground:    true,
      playsInSilentModeIOS:       true, // Important — plays even on silent
      shouldDuckAndroid:          false,
      playThroughEarpieceAndroid: false,
    });

    // Load and play the correct adhan
    const { sound } = await Audio.Sound.createAsync(
      isFajr ? ADHAN_FAJR : ADHAN_REGULAR,
      {
        shouldPlay: true,
        volume:     1.0,
        isMuted:    false,
      }
    );

    soundObject = sound;

    // Clean up when done
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        soundObject = null;
      }
    });

    return true;
  } catch (error) {
    console.error('Error playing adhan:', error);
    return false;
  }
}

// ── Stop adhan ────────────────────────────────────────────────────
export async function stopAdhan() {
  if (soundObject) {
    try {
      await soundObject.stopAsync();
      await soundObject.unloadAsync();
      soundObject = null;
    } catch {}
  }
}

// ── Schedule prayer notifications ─────────────────────────────────
export async function schedulePrayerNotifications(timings: Record<string, string>) {
  // Cancel all existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date();

  for (const prayer of PRAYER_NAMES) {
    const timeStr = timings[prayer];
    if (!timeStr) continue;

    const [h, m] = timeStr.split(':').map(Number);

    // Build trigger date
    const triggerDate = new Date(today);
    triggerDate.setHours(h, m, 0, 0);

    // Skip if already passed today
    if (triggerDate <= new Date()) continue;

    const isFajr = prayer === 'Fajr';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${isFajr ? '🌙' : '🕌'} ${prayer} prayer time`,
        body:  isFajr
          ? 'الصلاة خير من النوم · Prayer is better than sleep'
          : `It is time for ${prayer} prayer · حان وقت صلاة ${prayer}`,
        data:  { prayer, isFajr },
        sound: false, // We play adhan manually
      },
      trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  }
}

// ── Schedule Tahajjud alarm ───────────────────────────────────────
export async function scheduleTahajjudAlarm(wakeTime: string) {
  // Cancel existing Tahajjud notification
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.isTahajjud) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const [h, m] = wakeTime.split(':').map(Number);
  const today  = new Date();
  const triggerDate = new Date(today);
  triggerDate.setHours(h, m, 0, 0);

  // If already passed, schedule for tomorrow
  if (triggerDate <= new Date()) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌌 Time for Tahajjud',
      body:  'Rise for the night prayer — the last third of the night',
      data:  { isTahajjud: true },
      sound: false,
    },
    trigger: {
  type: Notifications.SchedulableTriggerInputTypes.DATE,
  date: triggerDate,
},
  });
}

// ── Handle incoming notification (play adhan) ─────────────────────
export function setupNotificationListener() {
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    const data = notification.request.content.data;
    if (data?.prayer) {
      // Prayer notification received — play adhan
      playAdhan(data.isFajr === true);
    } else if (data?.isTahajjud) {
      // Tahajjud alarm — play Fajr adhan (soft wake)
      playAdhan(true);
    }
  });
  return subscription;
}

// ── Convert 24hr to hh:mm for scheduling ─────────────────────────
export function calcTahajjudWakeTime(ishaTime: string, fajrTime: string): string {
  const [ishaH, ishaM] = ishaTime.split(':').map(Number);
  const [fajrH, fajrM] = fajrTime.split(':').map(Number);

  const ishaMins  = ishaH * 60 + ishaM;
  let   fajrMins  = fajrH * 60 + fajrM;
  if (fajrMins < ishaMins) fajrMins += 1440; // next day

  const nightDuration = fajrMins - ishaMins;
  const thirdStart    = ishaMins + Math.floor((nightDuration * 2) / 3);
  const wakeMins      = thirdStart % 1440;

  const wakeH = Math.floor(wakeMins / 60);
  const wakeM = wakeMins % 60;
  return `${String(wakeH).padStart(2,'0')}:${String(wakeM).padStart(2,'0')}`;
}
