import { readFile } from 'node:fs/promises';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'demo-skidsenglish';
const OWNER_UID = 'parent-owner';
const OTHER_UID = 'parent-other';
const CONSENTED_AT = new Date('2026-07-15T08:00:00.000Z');

const rules = await readFile(new URL('../firestore.rules', import.meta.url), {
  encoding: 'utf8',
});
const testEnvironment = await initializeTestEnvironment({
  firestore: { rules },
  projectId: PROJECT_ID,
});

try {
  await testEnvironment.clearFirestore();

  const ownerDb = testEnvironment.authenticatedContext(OWNER_UID).firestore();
  const otherDb = testEnvironment.authenticatedContext(OTHER_UID).firestore();
  const anonymousDb = testEnvironment.unauthenticatedContext().firestore();
  const ownerProgress = doc(ownerDb, 'users', OWNER_UID, 'progress', 'current');
  const ownerSettings = doc(ownerDb, 'users', OWNER_UID, 'settings', 'current');

  await assertSucceeds(setDoc(ownerProgress, validCloudDocument()));
  await assertSucceeds(getDoc(ownerProgress));
  await assertSucceeds(
    setDoc(ownerProgress, validCloudDocument({ totalXP: 12 })),
  );
  await assertSucceeds(setDoc(ownerSettings, validSettingsDocument()));
  await assertSucceeds(getDoc(ownerSettings));
  await assertSucceeds(
    setDoc(
      ownerSettings,
      validSettingsDocument({ appTheme: 'dark', reminderEnabled: true }),
    ),
  );

  await assertFails(
    getDoc(doc(otherDb, 'users', OWNER_UID, 'progress', 'current')),
  );
  await assertFails(
    getDoc(doc(otherDb, 'users', OWNER_UID, 'settings', 'current')),
  );
  await assertFails(
    getDoc(doc(anonymousDb, 'users', OWNER_UID, 'progress', 'current')),
  );
  await assertFails(
    getDoc(doc(anonymousDb, 'users', OWNER_UID, 'settings', 'current')),
  );
  await assertFails(
    setDoc(
      doc(otherDb, 'users', OWNER_UID, 'progress', 'current'),
      validCloudDocument(),
    ),
  );
  await assertFails(
    setDoc(
      doc(otherDb, 'users', OWNER_UID, 'settings', 'current'),
      validSettingsDocument(),
    ),
  );
  await assertFails(
    setDoc(
      doc(anonymousDb, 'users', OWNER_UID, 'progress', 'current'),
      validCloudDocument(),
    ),
  );
  await assertFails(
    setDoc(
      doc(anonymousDb, 'users', OWNER_UID, 'settings', 'current'),
      validSettingsDocument(),
    ),
  );
  await assertFails(
    getDocs(collection(ownerDb, 'users', OWNER_UID, 'progress')),
  );
  await assertFails(
    getDocs(collection(ownerDb, 'users', OWNER_UID, 'settings')),
  );
  await assertFails(
    setDoc(doc(ownerDb, 'users', OWNER_UID, 'progress', 'other'), {
      ...validCloudDocument(),
    }),
  );
  await assertFails(
    setDoc(doc(ownerDb, 'users', OWNER_UID, 'settings', 'other'), {
      ...validSettingsDocument(),
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      childName: 'must-not-be-accepted',
    }),
  );
  await assertFails(
    setDoc(ownerSettings, {
      ...validSettingsDocument(),
      settings: {
        ...validParentSettings(),
        enableSceneEditor: true,
      },
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      ownerUid: 'parent-other',
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      consentVersion: 2,
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      schemaVersion: 2,
    }),
  );
  await assertFails(
    setDoc(ownerSettings, {
      ...validSettingsDocument(),
      schemaVersion: 2,
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      serverUpdatedAt: new Date('2026-07-15T08:00:00.000Z'),
    }),
  );
  await assertFails(
    setDoc(ownerSettings, {
      ...validSettingsDocument(),
      serverUpdatedAt: new Date('2026-07-15T08:00:00.000Z'),
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      progress: {
        ...validProgress(),
        unexpectedField: true,
      },
    }),
  );
  await assertFails(
    setDoc(ownerSettings, {
      ...validSettingsDocument(),
      settings: {
        ...validParentSettings(),
        appTheme: 'sepia',
      },
    }),
  );
  await assertSucceeds(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      consentedAt: new Date('2026-07-15T09:00:00.000Z'),
    }),
  );
  await assertSucceeds(
    setDoc(ownerSettings, {
      ...validSettingsDocument(),
      consentedAt: new Date('2026-07-15T09:00:00.000Z'),
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      consentedAt: 'not-a-timestamp',
    }),
  );
  await assertFails(
    setDoc(ownerSettings, {
      ...validSettingsDocument(),
      consentedAt: 'not-a-timestamp',
    }),
  );
  await assertFails(getDoc(doc(ownerDb, 'unrelated', 'document')));

  await assertSucceeds(deleteDoc(ownerProgress));
  await assertSucceeds(deleteDoc(ownerSettings));
  console.log('Firestore rules tests passed.');
} finally {
  await testEnvironment.cleanup();
}

function validCloudDocument(progressOverrides = {}) {
  return {
    consentedAt: CONSENTED_AT,
    consentVersion: 1,
    ownerUid: OWNER_UID,
    progress: validProgress(progressOverrides),
    schemaVersion: 1,
    serverUpdatedAt: serverTimestamp(),
  };
}

function validProgress(overrides = {}) {
  return {
    activeThemeId: 'mot-ngay-cua-be',
    completedLessonIds: [],
    completedReviewGameIds: [],
    completedSceneIds: [],
    earnedAchievementRecords: [],
    earnedStickerIds: [],
    earnedStickerRecords: [],
    learnedWordIds: [],
    totalXP: 0,
    vocabularyProgress: {},
    ...overrides,
  };
}

function validSettingsDocument(settingsOverrides = {}) {
  return {
    consentedAt: CONSENTED_AT,
    consentVersion: 1,
    ownerUid: OWNER_UID,
    schemaVersion: 1,
    serverUpdatedAt: serverTimestamp(),
    settings: validParentSettings(settingsOverrides),
  };
}

function validParentSettings(overrides = {}) {
  return {
    appLanguage: 'vi',
    appTheme: 'system',
    childProfile: {
      avatarEmoji: ':)',
      birthYear: 2020,
      name: 'Sweet kid',
    },
    englishAccent: 'en-US',
    hasCompletedOnboarding: true,
    journeyMode: 'guided',
    learningMode: 'core',
    reminderEnabled: false,
    reminderTime: '19:30',
    teacherPromptMode: 'vi',
    updatedAt: '2026-07-15T08:00:00.000Z',
    visibleLessonIds: ['lesson-a', 'lesson-b'],
    ...overrides,
  };
}
