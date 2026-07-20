import { Image } from 'react-native';

import { prefetchAssets } from '../src/engine/AssetRegistry';

afterEach(() => {
  jest.restoreAllMocks();
});

test('reports a required image as unavailable when prefetch resolves false', async () => {
  jest.spyOn(Image, 'prefetch').mockResolvedValueOnce(false);

  await expect(
    prefetchAssets(['lessons/test/scene/images/background.webp']),
  ).resolves.toBe(false);
});

test('reports the image group as unavailable when any prefetch rejects', async () => {
  jest
    .spyOn(Image, 'prefetch')
    .mockResolvedValueOnce(true)
    .mockRejectedValueOnce(new Error('network unavailable'));

  await expect(
    prefetchAssets([
      'lessons/test/scene/images/background.webp',
      'lessons/test/scene/images/character.webp',
    ]),
  ).resolves.toBe(false);
});
