# Firebase Auth setup

This phase only enables parent account sign-in. Do not enable Firebase Analytics, Crashlytics,
Performance, Firestore sync, or child learning-data upload as part of this setup.

The root `firebase.json` intentionally disables React Native Firebase automatic collection knobs
for analytics, performance, messaging, and ad storage. Keep those defaults unless a later privacy
review explicitly approves a new Firebase service.

## Firebase console

1. Create or open the Firebase project and choose the option that does not add Google Analytics.
2. Add the Android app with package name `com.seduforge.skidsenglish`.
3. Add the iOS app with the bundle ID used by the Xcode target.
4. Enable Authentication providers:
   - Google
   - Apple
5. In Authentication settings, keep requested scopes minimal: name and email only.

## Android

1. Add the app signing SHA-1 and SHA-256 fingerprints in Firebase project settings.
2. Download `google-services.json`.
3. Place it at `android/app/google-services.json`.

The Android Gradle build only applies the Google Services plugin when that file exists, so local
builds can still run before Firebase config is added.

## iOS

1. Download `GoogleService-Info.plist`.
2. Add it to the `ios/SKidsEnglish` Xcode target.
3. Add the `REVERSED_CLIENT_ID` value from that plist as a URL scheme in the app target.
4. Enable the Sign in with Apple capability for the app identifier and Xcode target.

## App config

Set the Google client IDs in `src/config/firebaseAuth.ts`:

```ts
export const firebaseAuthConfig = {
  googleWebClientId: '<web-client-id>.apps.googleusercontent.com',
  googleIosClientId: '<ios-client-id>.apps.googleusercontent.com',
} as const;
```

`googleWebClientId` is required because Firebase Auth signs in with the Google ID token. The iOS
client ID should match the iOS client from `GoogleService-Info.plist`.

## Privacy notes

- Firebase Authentication processes parent account identifiers such as email, display name,
  provider UID, IP address, and user agent for authentication/security.
- The app still keeps child learning progress local in this phase.
- Update App Store / Google Play privacy disclosures and the public privacy policy before release.
- If cloud sync is added later, design a separate consent, retention, deletion, and Firestore rules
  plan before writing any child progress data to Firebase.
