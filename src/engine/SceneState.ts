import type {
  EntityId,
  SceneObject,
  SceneObjectVisibility,
  SceneStateChange,
} from '../types/lesson';

export type SceneRuntimeObjectState = {
  variantId?: EntityId;
  visibility?: SceneObjectVisibility;
};

export type SceneRuntimeState = Partial<
  Record<EntityId, SceneRuntimeObjectState>
>;

/**
 * Áp dụng tuần tự các thay đổi bền vững trong phạm vi lượt chạy scene hiện tại.
 * Hàm không mutate state đầu vào và trả object mới khi có thay đổi.
 */
export function applySceneStateChanges(
  state: SceneRuntimeState,
  changes: readonly SceneStateChange[],
): SceneRuntimeState {
  if (changes.length === 0) {
    return state;
  }

  const nextState: SceneRuntimeState = {...state};

  changes.forEach(change => {
    const currentObjectState = nextState[change.targetObjectId] ?? {};

    switch (change.type) {
      case 'setObjectVariant':
        nextState[change.targetObjectId] = {
          ...currentObjectState,
          variantId: change.variantId,
        };
        break;
      case 'showObject':
        nextState[change.targetObjectId] = {
          ...currentObjectState,
          visibility: 'visible',
        };
        break;
      case 'hideObject':
        nextState[change.targetObjectId] = {
          ...currentObjectState,
          visibility: 'hidden',
        };
        break;
    }
  });

  return nextState;
}

/**
 * Kết hợp authoring state ban đầu với runtime state để tạo object render được.
 * Object ẩn trả về undefined; variant lỗi sẽ fail-open về asset gốc và được
 * lesson validator báo riêng.
 */
export function resolveSceneObject(
  object: SceneObject,
  runtimeState?: SceneRuntimeObjectState,
): SceneObject | undefined {
  const visibility = runtimeState?.visibility ?? object.initialVisibility;

  if (visibility === 'hidden') {
    return undefined;
  }

  const variantId = runtimeState?.variantId ?? object.initialVariantId;
  const variant = object.variants?.find(candidate => candidate.id === variantId);

  if (!variant) {
    return object;
  }

  return {
    ...object,
    asset: variant.asset,
    position: variant.position ?? object.position,
    touchArea: variant.touchArea ?? object.touchArea,
  };
}
