import { getViAudioAsset } from '../src/data/audioManifest';
import { lessons } from '../src/data/lessons';

test('every authored vocabulary meaning has generated Vietnamese audio', () => {
  const missingMeanings = new Set<string>();

  for (const lesson of lessons) {
    for (const scene of lesson.scenes) {
      for (const vocabulary of scene.vocabulary ?? []) {
        if (!getViAudioAsset(vocabulary.meaningVi)) {
          missingMeanings.add(vocabulary.meaningVi);
        }
      }
    }
  }

  expect([...missingMeanings].sort()).toEqual([]);
});
