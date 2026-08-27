import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import { KidPlayPanel } from '../src/components/KidPlayPanel';
import { lessons } from '../src/data/lessons';
import { getSceneProgressId } from '../src/utils/lessonProgress';

jest.mock('../src/theme/motion', () => ({
  useReducedMotion: () => true,
}));

jest.mock('../src/theme/responsive', () => ({
  useResponsiveLayout: () => ({ width: 375 }),
}));

jest.mock('../src/engine/MonetizationManager', () => ({
  getMonetizationSnapshot: () => ({ status: 'premium' }),
  useMonetizationSnapshot: () => ({ status: 'premium' }),
}));

jest.mock('../src/i18n', () => {
  const actual = jest.requireActual<typeof import('../src/i18n')>(
    '../src/i18n',
  );

  return {
    ...actual,
    useI18n: () => actual.createTranslator('vi'),
    useSavedPromptLanguage: () => 'vi',
  };
});

test('shows one clear action for Sticker play and completed reviews', async () => {
  const lesson = lessons.find(item => item.id === 'morning-routine');
  expect(lesson?.reviewGame).toBeDefined();

  const completedSceneIds = new Set(
    lesson!.scenes.map(scene => getSceneProgressId(lesson!.id, scene.id)),
  );
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <KidPlayPanel
        activeThemeId="mot-ngay-cua-be"
        appLanguage="vi"
        completedReviewGameIds={new Set([lesson!.reviewGame!.id])}
        completedSceneIds={completedSceneIds}
        onOpenPremium={() => undefined}
        onOpenReviewGame={() => undefined}
        onOpenStickerPlayground={() => undefined}
        visibleLessonIds={[lesson!.id]}
      />,
    );
  });

  const textNodes = tree!.root.findAllByType(Text);
  const countText = (value: string) =>
    textNodes.filter(node => node.props.children === value).length;

  expect(countText('GÓC SÁNG TẠO')).toBe(1);
  expect(countText('Trang trí cùng Sungy')).toBe(1);
  expect(countText('Dùng sticker bé đã mở!')).toBe(1);
  expect(countText('⭐ Chơi Sticker')).toBe(1);
  expect(countText('🔄 Chơi lại')).toBe(1);
  expect(countText('🔄 Lại')).toBe(0);
  expect(
    StyleSheet.flatten(
      tree!.root.findByProps({ testID: 'sticker-playground-layout' }).props
        .style,
    ).flexDirection,
  ).toBe('column');

  await ReactTestRenderer.act(() => tree?.unmount());
});
