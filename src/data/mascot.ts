import type { ImageSourcePropType } from 'react-native';

export type MascotId = 'sungy';

export type MascotPoseId =
  | 'avatar'
  | 'greatJob'
  | 'hello'
  | 'hero'
  | 'hint'
  | 'learn'
  | 'letsGo'
  | 'tryAgain';

export type MascotPose = {
  id: MascotPoseId;
  source: ImageSourcePropType;
  usage: string;
  isTemporaryAlias?: boolean;
};

export type MascotProfile = {
  id: MascotId;
  displayName: string;
  species: string;
  defaultPoseId: MascotPoseId;
  sourcePoster: ImageSourcePropType;
  poses: Record<MascotPoseId, MascotPose>;
};

export const sungyMascot: MascotProfile = {
  id: 'sungy',
  displayName: 'Sungy',
  species: 'squirrel',
  defaultPoseId: 'hello',
  sourcePoster: require('../assets/mascot/sungy/sungy-source-poster.png'),
  poses: {
    avatar: {
      id: 'avatar',
      source: require('../assets/mascot/sungy/sungy-avatar.png'),
      usage: 'Compact identity mark for headers, bubbles, and badges.',
    },
    greatJob: {
      id: 'greatJob',
      source: require('../assets/mascot/sungy/sungy-great-job.png'),
      usage: 'Celebration, scene completion, and reward moments.',
    },
    hello: {
      id: 'hello',
      source: require('../assets/mascot/sungy/sungy-hello.png'),
      usage: 'Greeting, onboarding, and friendly idle state.',
    },
    hero: {
      id: 'hero',
      source: require('../assets/mascot/sungy/sungy-hero.png'),
      usage: 'Large feature art for onboarding and reward hero areas.',
    },
    hint: {
      id: 'hint',
      source: require('../assets/mascot/sungy/sungy-hint.png'),
      usage: 'Hint state for guided help after hesitation or wrong attempts.',
    },
    learn: {
      id: 'learn',
      source: require('../assets/mascot/sungy/sungy-learn.png'),
      usage: 'Lesson intro, reading, listening, and study moments.',
    },
    letsGo: {
      id: 'letsGo',
      source: require('../assets/mascot/sungy/sungy-lets-go.png'),
      usage: 'Primary CTA, next lesson, map guide, and navigation prompts.',
    },
    tryAgain: {
      id: 'tryAgain',
      source: require('../assets/mascot/sungy/sungy-try-again.png'),
      usage: 'Encouraging retry state after an incorrect interaction.',
    },
  },
};

export const mascotProfiles: Record<MascotId, MascotProfile> = {
  sungy: sungyMascot,
};

export function getMascotPose(
  poseId: MascotPoseId,
  mascotId: MascotId = 'sungy',
) {
  return mascotProfiles[mascotId].poses[poseId];
}

export function getMascotPoseSource(
  poseId: MascotPoseId,
  mascotId: MascotId = 'sungy',
) {
  return getMascotPose(poseId, mascotId).source;
}
