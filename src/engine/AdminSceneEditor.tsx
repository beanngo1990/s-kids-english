import React, { useState, useRef, useMemo } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  Image,
  Animated,
  type ViewStyle,
} from 'react-native';
import type { Scene, SceneObject, PercentRect } from '../types/lesson';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { resolveAsset } from './AssetRegistry';

type AdminSceneEditorProps = {
  scene: Scene;
  stageSize: { width: number; height: number };
  onClose: () => void;
};

export function AdminSceneEditor({
  scene,
  stageSize,
  onClose,
}: AdminSceneEditorProps) {
  const initialObjects = useMemo(() => {
    const arr = [...scene.objects];
    if (scene.character) {
      arr.unshift(scene.character);
    }
    if (scene.dropZones) {
      const zones = scene.dropZones.map(dz => ({
        id: dz.id,
        position: dz.position,
        touchArea: dz.touchArea,
        role: 'dropZone' as const,
        asset: { id: 'dz-placeholder', source: '', type: 'image' as any },
        isInteractive: true,
      }));
      arr.unshift(...zones);
    }
    return arr;
  }, [scene]);

  const [objects, setObjects] = useState<SceneObject[]>(
    JSON.parse(JSON.stringify(initialObjects))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  // Floating toolbar drag
  const floatPos = useRef({ x: 10, y: 50 });
  const floatAnim = useRef(new Animated.ValueXY({ x: 10, y: 50 })).current;
  const floatStart = useRef({ x: 10, y: 50 });

  const floatPan = useMemo(
    () =>
      PanResponder.create({
        // Only grab when user drags, so buttons inside header can be tapped
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, state) =>
          Math.abs(state.dx) > 4 || Math.abs(state.dy) > 4,
        onPanResponderGrant: () => {
          floatStart.current = { x: floatPos.current.x, y: floatPos.current.y };
        },
        onPanResponderMove: (_, state) => {
          const newX = floatStart.current.x + state.dx;
          const newY = floatStart.current.y + state.dy;
          floatPos.current = { x: newX, y: newY };
          floatAnim.setValue({ x: newX, y: newY });
        },
        onPanResponderRelease: () => { },
      }),
    [floatAnim]
  );

  const handleUpdateRect = (id: string, newRect: PercentRect) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj;

        const oldPos = obj.position;
        const dx = newRect.x - oldPos.x;
        const dy = newRect.y - oldPos.y;

        // Shift touchArea by the same delta so it follows the object
        const newTouchArea =
          obj.touchArea && (dx !== 0 || dy !== 0)
            ? {
              ...obj.touchArea,
              x: obj.touchArea.x + dx,
              y: obj.touchArea.y + dy,
            }
            : obj.touchArea;

        return {
          ...obj,
          position: { ...oldPos, ...newRect },
          touchArea: newTouchArea,
        };
      })
    );
  };

  const handleLogJson = () => {
    const charObj = objects.find(o => o.id === scene.character?.id);
    const sceneObjs = objects.filter(o => o.id !== scene.character?.id && o.role !== 'dropZone');
    const dropZones = objects.filter(o => o.role === 'dropZone').map(dz => ({
      id: dz.id,
      position: dz.position,
      touchArea: dz.touchArea,
    }));

    console.log('============= UPDATED SCENE LAYOUT JSON =============');
    if (charObj) {
      console.log('--- CHARACTER ---');
      console.log(JSON.stringify(charObj, null, 2));
    }
    console.log('--- OBJECTS ---');
    console.log(JSON.stringify(sceneObjs, null, 2));
    if (dropZones.length > 0) {
      console.log('--- DROPZONES ---');
      console.log(JSON.stringify(dropZones, null, 2));
    }
    console.log('=====================================================');
    Alert.alert('Đã in JSON ra console terminal!');
  };

  if (stageSize.width === 0 || stageSize.height === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Editor overlay background */}
      <View style={styles.overlayBg} pointerEvents="none" />

      {/* Render all editable objects */}
      {objects.map((obj) => (
        <EditableObject
          key={obj.id}
          object={obj}
          stageSize={stageSize}
          isSelected={selectedId === obj.id}
          onSelect={() => setSelectedId(obj.id)}
          onUpdateRect={(newRect) => handleUpdateRect(obj.id, newRect)}
        />
      ))}

      {/* Floating Toolbar */}
      <Animated.View
        style={[
          styles.floatingPanel,
          { transform: floatAnim.getTranslateTransform() },
        ]}
      >
        {/* Drag handle header */}
        <View style={styles.floatHeader} {...floatPan.panHandlers}>
          <Text style={styles.floatDragIcon}>⠿</Text>
          <Text style={styles.toolbarTitle}>✏️ Editor</Text>
          <TouchableOpacity
            style={styles.collapseBtn}
            onPress={() => setCollapsed(c => !c)}
          >
            <Text style={styles.collapseBtnText}>{collapsed ? '▼' : '▲'}</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons — hidden when collapsed */}
        {!collapsed && (
          <View style={styles.floatActions}>
            <TouchableOpacity style={styles.button} onPress={handleLogJson}>
              <Text style={styles.buttonText}>📋 Log JSON</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonClose} onPress={onClose}>
              <Text style={styles.buttonText}>✕ Đóng</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// -------------------------------------------------------------
// Editable Object Component
// -------------------------------------------------------------

type EditableObjectProps = {
  object: SceneObject;
  stageSize: { width: number; height: number };
  isSelected: boolean;
  onSelect: () => void;
  onUpdateRect: (rect: PercentRect) => void;
};

function EditableObject({
  object,
  stageSize,
  isSelected,
  onSelect,
  onUpdateRect,
}: EditableObjectProps) {
  // Convert percent to pixels
  const pc = (p: number, total: number) => (p / total) * 100;

  const currentRect = useRef(object.position);
  const startRect = useRef(object.position);
  const [, setRenderTick] = useState(0);

  // Sync with parent when needed
  React.useEffect(() => {
    currentRect.current = object.position;
    setRenderTick(t => t + 1);
  }, [object.position]);

  const forceUpdate = () => setRenderTick(t => t + 1);

  const panMove = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          onSelect();
          startRect.current = currentRect.current;
        },
        onPanResponderMove: (_, state) => {
          const original = startRect.current;
          const newX = original.x + pc(state.dx, stageSize.width);
          const newY = original.y + pc(state.dy, stageSize.height);
          currentRect.current = { ...original, x: newX, y: newY };
          forceUpdate();
        },
        onPanResponderRelease: () => {
          onUpdateRect(currentRect.current);
        },
      }),
    [stageSize, onSelect, onUpdateRect]
  );

  const panResize = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRect.current = currentRect.current;
        },
        onPanResponderMove: (_, state) => {
          const original = startRect.current;
          const newWidth = Math.max(2, original.width + pc(state.dx, stageSize.width));
          const newHeight = Math.max(2, original.height + pc(state.dy, stageSize.height));
          currentRect.current = { ...original, width: newWidth, height: newHeight };
          forceUpdate();
        },
        onPanResponderRelease: () => {
          onUpdateRect(currentRect.current);
        },
      }),
    [stageSize, onUpdateRect]
  );

  const panRotate = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRect.current = currentRect.current;
        },
        onPanResponderMove: (_, state) => {
          const original = startRect.current;
          // Simple rotation: drag left/right to rotate
          const deltaAngle = state.dx / 1.5;
          let newRotation = (original.rotation || 0) + deltaAngle;
          // Round to nearest 5 degrees
          newRotation = Math.round(newRotation / 5) * 5;
          currentRect.current = { ...original, rotation: newRotation };
          forceUpdate();
        },
        onPanResponderRelease: () => {
          onUpdateRect(currentRect.current);
        },
      }),
    [onUpdateRect]
  );

  const toggleFlip = () => {
    currentRect.current = { ...currentRect.current, flipX: !currentRect.current.flipX };
    forceUpdate();
    onUpdateRect(currentRect.current);
  };

  const rect = currentRect.current;

  const isLearningObject = object.role === 'learning';
  const isCharacter = object.role === 'character';
  const isDropzone = object.role === 'dropZone';

  const boxStyle: ViewStyle = {
    position: 'absolute' as const,
    left: `${rect.x}%` as `${number}%`,
    top: `${rect.y}%` as `${number}%`,
    width: `${rect.width}%` as `${number}%`,
    height: `${rect.height}%` as `${number}%`,
    transform: rect.rotation ? [{ rotate: `${rect.rotation}deg` }] : [],
    borderWidth: isSelected ? 2 : 1,
    borderColor: isSelected ? colors.primary : isDropzone ? 'rgba(255, 105, 180, 0.8)' : 'rgba(255, 0, 0, 0.5)',
    borderStyle: isDropzone ? 'solid' as const : 'dashed' as const,
    backgroundColor: isSelected
      ? (isDropzone ? 'rgba(255, 105, 180, 0.3)' : 'rgba(0, 150, 255, 0.2)')
      : (isDropzone ? 'rgba(255, 105, 180, 0.1)' : 'transparent'),
    zIndex: isSelected ? 100 : (isDropzone ? 5 : 10),
    borderRadius: isDropzone ? 8 : 0,
  };

  return (
    <View style={boxStyle}>
      {isDropzone ? (
        <View style={styles.dropzoneContent} pointerEvents="none">
          <Text style={styles.dropzoneIcon}>🎯</Text>
          <Text style={styles.dropzoneText}>Zone</Text>
        </View>
      ) : (
        /* Object Image - mimicking SceneObjectRenderer layout exactly */
        <View
          style={[
            styles.assetBubble,
            isLearningObject && styles.learningAssetBubble,
            isCharacter && styles.characterAssetBubble,
          ]}
          pointerEvents="none"
        >
          <Image
            source={resolveAsset(object.asset.source)}
            style={[
              styles.image,
              isLearningObject && styles.learningImage,
              isCharacter && styles.characterImage,
              rect.flipX ? { transform: [{ scaleX: -1 }] } : undefined
            ]}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Main draggable area */}
      <View
        style={StyleSheet.absoluteFill}
        {...panMove.panHandlers}
      />

      {/* Label */}
      <Text style={styles.objLabel} pointerEvents="none">
        {object.id.split('-').pop()}
      </Text>

      {/* Handles (only show when selected) */}
      {isSelected && (
        <>
          {/* Resize handle (bottom right) */}
          <View
            style={[styles.handle, styles.resizeHandle]}
            {...panResize.panHandlers}
          />
          {/* Rotate handle (top center) */}
          <View
            style={[styles.handle, styles.rotateHandle]}
            {...panRotate.panHandlers}
          >
            <View style={styles.rotateLine} />
          </View>
          {/* Flip handle (bottom left) */}
          <TouchableOpacity
            style={[styles.handle, styles.flipHandle]}
            onPress={toggleFlip}
          >
            <Text style={styles.flipHandleText}>↔</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayBg: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  // --- Floating panel ---
  floatingPanel: {
    position: 'absolute',
    minWidth: 160,
    backgroundColor: 'rgba(15, 15, 30, 0.88)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 9999,
    overflow: 'hidden',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  floatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  floatDragIcon: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    marginRight: 2,
  },
  collapseBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  collapseBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  floatActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  toolbarTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonClose: {
    backgroundColor: colors.alert,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  objLabel: {
    position: 'absolute',
    top: -18,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  handle: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
  },
  resizeHandle: {
    bottom: -12,
    right: -12,
  },
  rotateHandle: {
    top: -30,
    left: '50%',
    marginLeft: -12,
  },
  rotateLine: {
    position: 'absolute',
    bottom: -18,
    left: 9,
    width: 2,
    height: 16,
    backgroundColor: colors.primary,
  },
  flipHandle: {
    bottom: -12,
    left: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipHandleText: {
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Replicated game styles
  assetBubble: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xs,
    width: '100%',
    opacity: 0.8,
  },
  learningAssetBubble: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  characterAssetBubble: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  image: {
    flex: 1,
    maxHeight: '72%',
    width: '100%',
  },
  learningImage: {
    maxHeight: '86%',
  },
  characterImage: {
    maxHeight: '98%',
  },
  gameLabel: {
    color: colors.text,
    textAlign: 'center',
    ...typography.caption,
  },
  learningLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: radius.pill,
    marginTop: spacing.xs,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  dropzoneContent: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dropzoneIcon: {
    fontSize: 18,
  },
  dropzoneText: {
    color: 'rgba(255, 105, 180, 0.9)',
    fontWeight: 'bold',
    fontSize: 9,
  },
});
