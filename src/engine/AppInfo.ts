import { NativeModules } from 'react-native';

type SkidsAppInfoModule = {
  getVersion?: () => Promise<string>;
};

let versionPromise: Promise<string | null> | null = null;

function getNativeAppInfo() {
  return NativeModules.SkidsAppInfo as SkidsAppInfoModule | undefined;
}

export function getAppVersion(): Promise<string | null> {
  if (!versionPromise) {
    versionPromise = readNativeAppVersion();
  }

  return versionPromise;
}

async function readNativeAppVersion(): Promise<string | null> {
  try {
    const version = await getNativeAppInfo()?.getVersion?.();
    const normalizedVersion = version?.trim();
    return normalizedVersion ? normalizedVersion : null;
  } catch {
    return null;
  }
}

