#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

const results = [];

function repositoryPath(relativePath) {
  return resolve(repositoryRoot, relativePath);
}

function source(relativePath) {
  return readFileSync(repositoryPath(relativePath), 'utf8');
}

function hasNonEmptyFile(relativePath) {
  const path = repositoryPath(relativePath);
  return existsSync(path) && statSync(path).isFile() && statSync(path).size > 0;
}

function add(status, label, detail) {
  results.push({ detail, label, status });
}

function pass(label, detail) {
  add('PASS', label, detail);
}

function blocked(label, detail) {
  add('BLOCKED', label, detail);
}

function manual(label, detail) {
  add('MANUAL', label, detail);
}

function getStringLiteral(contents, propertyName) {
  const escapedPropertyName = propertyName.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );
  const match = contents.match(
    new RegExp(
      '\\b' + escapedPropertyName + '\\s*:\\s*([\'\\"`])([^\\r\\n]*?)\\1',
    ),
  );
  return match?.[2]?.trim() ?? null;
}

function getExportedStringLiteral(contents, exportName) {
  const escapedExportName = exportName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = contents.match(
    new RegExp(
      '\\b' + escapedExportName + '\\s*=\\s*([\'\\"`])([^\\r\\n]*?)\\1',
    ),
  );
  return match?.[2]?.trim() ?? null;
}

function isHttpsUrl(value) {
  if (!value) {
    return false;
  }

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function compareVersions(left, right) {
  const leftParts = left.split('.').map(Number);
  const rightParts = right.split('.').map(Number);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const delta = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (delta !== 0) {
      return Math.sign(delta);
    }
  }

  return 0;
}

function auditFirebaseNativeConfiguration() {
  const androidGradle = source('android/app/build.gradle');
  const iosProject = source('ios/SKidsEnglish.xcodeproj/project.pbxproj');
  const androidReady =
    hasNonEmptyFile('android/app/google-services.json') &&
    androidGradle.includes('com.google.gms.google-services');
  const iosReady =
    hasNonEmptyFile('ios/SKidsEnglish/GoogleService-Info.plist') &&
    iosProject.includes('GoogleService-Info.plist in Resources');

  if (androidReady) {
    pass(
      'Firebase Android native config',
      'google-services.json is present and the Google Services plugin is wired.',
    );
  } else {
    blocked(
      'Firebase Android native config',
      'Add the target Firebase config and verify the Google Services Gradle plugin.',
    );
  }

  if (iosReady) {
    pass(
      'Firebase iOS native config',
      'The app-target plist is present and included in target resources.',
    );
  } else {
    blocked(
      'Firebase iOS native config',
      'Add the app-target Firebase plist and include it in target resources.',
    );
  }
}

function auditRevenueCatAndLegalConfiguration() {
  const monetizationSource = source('src/config/monetization.ts');
  const appleKey = getStringLiteral(
    monetizationSource,
    'revenueCatAppleApiKey',
  );
  const googleKey = getStringLiteral(
    monetizationSource,
    'revenueCatGoogleApiKey',
  );
  const configuredKeys = [appleKey, googleKey].filter(
    key => typeof key === 'string' && key.length > 0,
  );

  if (appleKey?.startsWith('appl_')) {
    pass(
      'RevenueCat iOS production key',
      'A platform-specific public SDK key is configured.',
    );
  } else {
    blocked(
      'RevenueCat iOS production key',
      'Configure the public iOS SDK key with the expected platform prefix.',
    );
  }

  if (googleKey?.startsWith('goog_')) {
    pass(
      'RevenueCat Android production key',
      'A platform-specific public SDK key is configured.',
    );
  } else {
    blocked(
      'RevenueCat Android production key',
      'Configure the public Android SDK key with the expected platform prefix.',
    );
  }

  if (configuredKeys.some(key => key.startsWith('test_'))) {
    blocked(
      'RevenueCat Test Store release guard',
      'A Test Store key is assigned to a production platform field. Never submit this build.',
    );
  } else {
    pass(
      'RevenueCat Test Store release guard',
      'No Test Store key is assigned to a production platform field.',
    );
  }

  const privacyPolicyUrl = getStringLiteral(
    monetizationSource,
    'privacyPolicyUrl',
  );
  const termsOfUseUrl = getStringLiteral(monetizationSource, 'termsOfUseUrl');

  if (isHttpsUrl(privacyPolicyUrl)) {
    pass('Privacy Policy URL', 'A public HTTPS URL is configured.');
  } else {
    blocked(
      'Privacy Policy URL',
      'Configure the final public HTTPS Privacy Policy URL.',
    );
  }

  if (isHttpsUrl(termsOfUseUrl)) {
    pass('Terms of Use URL', 'A public HTTPS URL is configured.');
  } else {
    blocked(
      'Terms of Use URL',
      'Configure the final public HTTPS Terms of Use URL.',
    );
  }
}

function auditTestStoreSdkSupport() {
  const packageLock = JSON.parse(source('package-lock.json'));
  const installedVersion =
    packageLock.packages?.['node_modules/react-native-purchases']?.version;

  if (
    typeof installedVersion === 'string' &&
    compareVersions(installedVersion, '9.5.4') >= 0
  ) {
    pass(
      'RevenueCat Test Store SDK support',
      'The resolved React Native SDK meets the documented Test Store minimum.',
    );
  } else {
    blocked(
      'RevenueCat Test Store SDK support',
      'Resolve react-native-purchases 9.5.4 or newer before Test Store testing.',
    );
  }
}

function auditTestStoreDebugConfiguration() {
  const metroSource = source('metro.config.js');
  const gitignoreSource = source('.gitignore');
  const monetizationSource = source('src/config/monetization.ts');
  const fallbackSource = source('src/config/revenueCatTestStoreKey.ts');
  const localRelativePath = 'src/config/revenueCatTestStoreKey.local.ts';
  const localPath = repositoryPath(localRelativePath);
  const fallbackValue = getExportedStringLiteral(
    fallbackSource,
    'revenueCatTestStoreApiKey',
  );
  const localModuleIsIgnored = gitignoreSource
    .split(/\r?\n/)
    .some(line => line.trim() === `/${localRelativePath}`);
  const metroUsesLocalOnlyForDebug =
    metroSource.includes('context.dev') &&
    metroSource.includes('revenueCatTestStoreLocalPath') &&
    metroSource.includes('revenueCatTestStoreFallbackPath') &&
    /context\.dev\s*&&\s*context\.doesFileExist\(revenueCatTestStoreLocalPath\)/.test(
      metroSource,
    );
  const releaseRuntimeRejectsTestKeys =
    monetizationSource.includes('__DEV__') &&
    /allowTestStore\s*&&\s*normalizedKey\.startsWith\(['"]test_['"]\)/.test(
      monetizationSource,
    );

  if (
    localModuleIsIgnored &&
    metroUsesLocalOnlyForDebug &&
    fallbackValue === '' &&
    releaseRuntimeRejectsTestKeys
  ) {
    pass(
      'RevenueCat Test Store channel isolation',
      'Metro selects the ignored local module only for debug; release uses the tracked empty fallback and rejects test_ keys.',
    );
  } else {
    blocked(
      'RevenueCat Test Store channel isolation',
      'Restore the ignored debug-only module resolver, empty release fallback and runtime release guard.',
    );
  }

  let localTestStoreKey = null;
  if (existsSync(localPath) && statSync(localPath).isFile()) {
    localTestStoreKey = getExportedStringLiteral(
      readFileSync(localPath, 'utf8'),
      'revenueCatTestStoreApiKey',
    );
  }

  if (localTestStoreKey?.startsWith('test_')) {
    pass(
      'RevenueCat Test Store local key',
      'The ignored local module contains a Test Store-prefixed public key; its value was not printed.',
    );
  } else {
    blocked(
      'RevenueCat Test Store local key',
      'Create the ignored local module with a valid test_ public key, then restart Metro with a reset cache.',
    );
  }
}

function auditCampaignSafetyDefaults() {
  const remoteConfigSource = source('src/services/RemoteMonetizationConfig.ts');
  const defaultIsOff =
    /\[remoteMonetizationConfigKeys\.founderCampaignEnabled\]\s*:\s*false\b/.test(
      remoteConfigSource,
    );
  const initialSnapshotIsOff =
    /let snapshot[\s\S]{0,400}?founderCampaignEnabled\s*:\s*false\b/.test(
      remoteConfigSource,
    );

  if (defaultIsOff && initialSnapshotIsOff) {
    pass(
      'Founder campaign client fallback',
      'The local default and initial snapshot keep the campaign disabled.',
    );
  } else {
    blocked(
      'Founder campaign client fallback',
      'The campaign must default to false in both Remote Config defaults and the initial snapshot.',
    );
  }

  manual(
    'Founder campaign published value',
    'Verify in Firebase Console that the production global/default value remains false; this local audit does not contact Firebase.',
  );
}

function auditFirebaseProjectAndFunctionsConfiguration() {
  const firebaseRcPath = repositoryPath('.firebaserc');
  let hasDefaultFirebaseProject = false;

  if (existsSync(firebaseRcPath)) {
    try {
      const firebaseRc = JSON.parse(readFileSync(firebaseRcPath, 'utf8'));
      hasDefaultFirebaseProject =
        typeof firebaseRc.projects?.default === 'string' &&
        firebaseRc.projects.default.trim().length > 0;
    } catch {
      hasDefaultFirebaseProject = false;
    }
  }

  if (hasDefaultFirebaseProject) {
    pass(
      'Firebase project selection',
      'A default Firebase project alias is configured.',
    );
  } else {
    blocked(
      'Firebase project selection',
      'Configure a reviewed default project in .firebaserc before deploy or remote testing.',
    );
  }

  const functionsSource = source('functions/src/index.ts');
  const declaresProjectId =
    /defineString\(\s*['"]REVENUECAT_PROJECT_ID['"]/.test(functionsSource);
  const declaresSecret =
    /defineSecret\(\s*['"]REVENUECAT_SECRET_API_KEY['"]/.test(functionsSource);

  if (declaresProjectId && declaresSecret) {
    pass(
      'Functions RevenueCat bindings',
      'The backend declares a non-secret project parameter and a Secret Manager binding.',
    );
  } else {
    blocked(
      'Functions RevenueCat bindings',
      'Declare the RevenueCat project parameter and Secret Manager binding in Functions.',
    );
  }

  const functionsDirectory = repositoryPath('functions');
  const hasLocalParameterFile = readdirSync(functionsDirectory, {
    withFileTypes: true,
  }).some(
    entry =>
      entry.isFile() &&
      (entry.name === '.env' ||
        (entry.name.startsWith('.env.') && entry.name !== '.env.example')),
  );
  const hasLocalSecretFile = hasNonEmptyFile('functions/.secret.local');

  manual(
    'Functions runtime parameter value',
    hasLocalParameterFile
      ? 'A local ignored parameter file exists; validate its value without committing or logging it.'
      : 'No local ignored parameter file was detected; remote deployment state cannot be inferred.',
  );
  manual(
    'Functions Secret Manager value',
    hasLocalSecretFile
      ? 'A local ignored emulator secret file exists; validate access without logging its contents.'
      : 'No local emulator secret was detected; verify the deployed secret and IAM in Firebase/Google Cloud.',
  );
}

function auditNativeBillingAndReleaseSigning() {
  const androidManifest = source('android/app/src/main/AndroidManifest.xml');
  const androidGradle = source('android/app/build.gradle');
  const iosProject = source('ios/SKidsEnglish.xcodeproj/project.pbxproj');
  const androidBillingReady =
    androidManifest.includes('com.android.vending.BILLING') &&
    /launchMode="singleTop"/.test(androidManifest);

  if (androidBillingReady) {
    pass(
      'Android billing return path',
      'Billing permission and singleTop activity launch mode are configured.',
    );
  } else {
    blocked(
      'Android billing return path',
      'Billing permission and singleTop launch mode are required before device testing.',
    );
  }

  const androidSigningFilesPresent =
    hasNonEmptyFile('android/app/keystore.properties') &&
    hasNonEmptyFile('android/app/skids-upload-key.keystore') &&
    androidGradle.includes('signingConfigs.release');

  if (androidSigningFilesPresent) {
    pass(
      'Android release signing files',
      'Ignored release-signing files and Gradle wiring are present; their contents were not read.',
    );
  } else {
    blocked(
      'Android release signing files',
      'Provide ignored upload-signing files and validate release signing locally.',
    );
  }

  manual(
    'Android signed bundle',
    'Build and verify a signed release AAB before uploading to a closed track.',
  );

  const iosProjectReady =
    /com\.apple\.InAppPurchase\s*=\s*\{[\s\S]{0,100}?enabled\s*=\s*1;/.test(
      iosProject,
    ) && /DEVELOPMENT_TEAM\s*=\s*[^;\s]+;/.test(iosProject);

  if (iosProjectReady) {
    pass(
      'iOS purchase capability',
      'The app target has In-App Purchase capability and a development team.',
    );
  } else {
    blocked(
      'iOS purchase capability',
      'Configure In-App Purchase capability and the intended development team.',
    );
  }

  manual(
    'iOS distribution signing',
    'Validate distribution certificates, provisioning and TestFlight upload in the Apple account.',
  );
}

function printResults() {
  console.log('SKidsEnglish Phase 3 closed-testing audit (read-only)');
  console.log(
    'No API key, secret, credential value, or Firebase project ID is printed.',
  );
  console.log('');

  for (const result of results) {
    console.log(`[${result.status}] ${result.label}: ${result.detail}`);
  }

  const counts = results.reduce(
    (accumulator, result) => {
      accumulator[result.status] += 1;
      return accumulator;
    },
    { BLOCKED: 0, MANUAL: 0, PASS: 0 },
  );

  console.log('');
  console.log(
    `Summary: ${counts.PASS} pass, ${counts.BLOCKED} blocked, ${counts.MANUAL} manual verification.`,
  );

  if (counts.BLOCKED > 0) {
    console.log(
      'Result: BLOCKED. Resolve blockers before claiming store/sandbox readiness.',
    );
    process.exitCode = 1;
  } else {
    console.log(
      'Result: LOCAL PREFLIGHT PASS. Manual and external checks are still required.',
    );
  }
}

auditFirebaseNativeConfiguration();
auditRevenueCatAndLegalConfiguration();
auditTestStoreSdkSupport();
auditTestStoreDebugConfiguration();
auditCampaignSafetyDefaults();
auditFirebaseProjectAndFunctionsConfiguration();
auditNativeBillingAndReleaseSigning();
printResults();
