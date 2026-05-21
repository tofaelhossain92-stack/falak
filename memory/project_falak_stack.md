---
name: project-falak-stack
description: Falak app tech stack — Expo SDK 54, expo-router 6, fonts, location, notifications
metadata:
  type: project
---

Falak (فَلَك) is a weather & prayer companion app built with Expo SDK ~54.0.33 / React Native 0.81.5.

Installed dependencies (as of 2026-05-17):
- expo-router ~6.0.23
- expo-font ~14.0.11
- expo-location ~19.0.8
- expo-notifications ~0.32.17
- @expo-google-fonts/dm-sans ^0.4.2
- @expo-google-fonts/cormorant-garamond ^0.4.1

**Why:** User set up the project foundation with these deps on 2026-05-17.

**How to apply:** When installing further packages, use `npx expo install` with `--legacy-peer-deps` (react-native-screens@4.25.0 has a peer dep on react-native >=0.82.0 that conflicts with 0.81.5 in this project; --legacy-peer-deps resolves it without issues at runtime). See [[feedback-brand-tokens]] for colour rules.
