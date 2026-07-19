import { useSyncExternalStore } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export type ParentAccessSnapshot = Readonly<{
  isGranted: boolean;
}>;

const listeners = new Set<() => void>();

let snapshot: ParentAccessSnapshot = { isGranted: false };
let lifecycleSubscriberCount = 0;
let appStateSubscription: { remove: () => void } | null = null;
let externalFlowActive = false;

export function getParentAccessSnapshot(): ParentAccessSnapshot {
  return snapshot;
}

export function subscribeParentAccess(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useParentAccessSnapshot() {
  return useSyncExternalStore(
    subscribeParentAccess,
    getParentAccessSnapshot,
    getParentAccessSnapshot,
  );
}

export function grantParentAccess() {
  updateSnapshot({ isGranted: true });
}

export function revokeParentAccess() {
  updateSnapshot({ isGranted: false });
}

export function setParentExternalFlowActive(isActive: boolean) {
  externalFlowActive = isActive;
}

export function setParentPurchaseFlowActive(isActive: boolean) {
  setParentExternalFlowActive(isActive);
}

export function startParentAccessSessionLifecycle() {
  lifecycleSubscriberCount += 1;

  if (lifecycleSubscriberCount === 1) {
    appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
  }

  return () => {
    lifecycleSubscriberCount = Math.max(0, lifecycleSubscriberCount - 1);
    if (lifecycleSubscriberCount === 0) {
      appStateSubscription?.remove();
      appStateSubscription = null;
    }
  };
}

function handleAppStateChange(nextState: AppStateStatus) {
  if (nextState !== 'active' && !externalFlowActive) {
    revokeParentAccess();
  }
}

function updateSnapshot(nextSnapshot: ParentAccessSnapshot) {
  if (snapshot.isGranted === nextSnapshot.isGranted) {
    return;
  }

  snapshot = nextSnapshot;
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // A UI listener must not break the shared parent-access session.
    }
  }
}
