# Firebase parent account and progress sync setup

Firebase Authentication is used for parent sign-in. Cloud Firestore is used only after an
authenticated parent explicitly opts in to learning-progress sync from Parent Mode. Do not enable
Firebase Analytics, Crashlytics, Performance, or upload child profile/activity/voice data as part
of this setup.

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
6. Create a Cloud Firestore database in Native mode and select the production region deliberately;
   changing the database location later is not a routine migration.
7. Deploy `firestore.rules` before enabling sync in a release build:

```sh
npx firebase deploy --only firestore:rules --project <firebase-project-id>
```

The repository does not include a real Firebase project ID and the deploy command is not part of
local verification. Use the Firebase Console rules playground or the emulator test below before
deploying to production.

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

After adding `@react-native-firebase/firestore`, refresh native dependencies:

```sh
cd ios && pod install
```

Android picks up the Firestore native dependency through Gradle autolinking.
The Podfile currently disables React Native's prebuilt RNCore because React Native Firebase `25.1`
does not yet compile reliably against that module under static frameworks on React Native `0.86`.
Remove the workaround only after the upstream compatibility fix is available and both Debug and
Release iOS builds have been verified.

## Progress sync contract

- Sync is off by default and remains off after sign-in until the parent confirms the disclosure.
- Consent is stored locally in `@skidsenglish/parent-settings/v1` with the parent UID, consent
  version and timestamp. A different signed-in UID cannot inherit that consent.
- The last server-confirmed semantic fingerprint is stored in
  `@skidsenglish/cloud-progress-sync-state/v1`, bound to the same parent UID. It deliberately
  ignores client `updatedAt`, so timestamp-only local saves do not trigger cloud writes. The same
  store keeps sync scheduler metadata for cooldowns and retry backoff.
- The only cloud document is `users/{uid}/progress/current`.
- Synced fields are lesson/scene/review completion, learned-word IDs, vocabulary mastery counters,
  XP, sticker/achievement records, active theme and the resume pointer.
- Child name, avatar, birth year, parent settings, daily activity/streak data and voice recordings
  are not included in the Firestore payload.
- Local progress remains the runtime source of truth. Remote and local snapshots merge
  monotonically: ID sets are unioned and XP/counters use the larger value. The latest snapshot
  chooses active theme and resume position.
- A new sync session waits for a server-confirmed initial snapshot before uploading. A cache-only
  missing document therefore cannot overwrite progress that already exists on another device.
- While the app is in the foreground, the Firestore listener receives the initial snapshot and
  remote changes, but local learning interactions only update AsyncStorage and an in-memory pending
  snapshot. They do not write to Firestore individually.
- When the app enters the background, the manager invokes at most one write for the pending session
  snapshot and then removes the listener. Background delivery is best-effort; if the operating
  system suspends the process first, the persisted fingerprint causes the next foreground session
  to retry safely after merging with the server.
- Opening the app performs throttled server reconciliation. A recent server-confirmed read suppresses
  foreground listener churn for 5 minutes, background writes are limited to one attempt per 90
  seconds per parent UID, and Firestore failures use exponential backoff from 1 to 15 minutes.
  Local progress remains saved immediately while a cloud write is deferred.
- Opening the app only writes immediately when local data from an earlier session is not represented
  by the confirmed cloud fingerprint and the write cooldown/backoff allows the attempt.
- Turning sync off can either keep the existing cloud copy or delete it. Deleting the parent
  account deletes the cloud progress document before deleting Firebase Auth; local progress stays
  on the device.
- If a different parent account signs in, the old device consent can be cleared locally before the
  new account opts in. This does not delete the previous account's cloud copy; that account must
  sign in again to delete its own data.

This snapshot merge deliberately avoids duplicate rewards and XP inflation. It is not an event-log
model, so simultaneous independent XP gains on two offline devices are not added together; the
larger snapshot wins for counters.

## Firestore rules tests

`firestore.rules` denies all unrelated paths, collection list operations and cross-UID access. It
also validates the document owner, schema/consent versions, server timestamp, allowed fields, basic
types and bounded list/map sizes.

Run the local emulator test with:

```sh
npm run test:firestore-rules
```

The command uses demo project ID `demo-skidsenglish` and cannot contact production Firebase data.

## Privacy notes

- Firebase Authentication processes parent account identifiers such as email, display name,
  provider UID, IP address, and user agent for authentication/security.
- When a parent opts in, Firebase processes the learning-progress fields listed above and technical
  request metadata. The cloud copy remains until the parent chooses cloud deletion or account
  deletion; merely disabling sync can intentionally retain it.
- Update App Store / Google Play privacy disclosures and the public privacy policy before release.
- Firebase Analytics remains absent and React Native Firebase automatic collection flags remain
  disabled in the root `firebase.json`.
- App Check is not implemented in this milestone. Firebase Auth plus owner-only Firestore rules are
  the current access boundary.
