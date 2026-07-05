import type { ImageSourcePropType } from 'react-native';

export type MascotId = 'suga';

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

export const sugaMascot: MascotProfile = {
  id: 'suga',
  displayName: 'Suga',
  species: 'squirrel',
  defaultPoseId: 'hello',
  sourcePoster: require('../assets/mascot/suga/suga-source-poster.png'),
  poses: {
    avatar: {
      id: 'avatar',
      source: require('../assets/mascot/suga/suga-avatar.png'),
      usage: 'Compact identity mark for headers, bubbles, and badges.',
    },
    greatJob: {
      id: 'greatJob',
      source: require('../assets/mascot/suga/suga-great-job.png'),
      usage: 'Celebration, scene completion, and reward moments.',
    },
    hello: {
      id: 'hello',
      source: require('../assets/mascot/suga/suga-hello.png'),
      usage: 'Greeting, onboarding, and friendly idle state.',
    },
    hero: {
      id: 'hero',
      source: require('../assets/mascot/suga/suga-hero.png'),
      usage: 'Large feature art for onboarding and reward hero areas.',
    },
    hint: {
      id: 'hint',
      source: require('../assets/mascot/suga/suga-hint.png'),
      usage: 'Hint state for guided help after hesitation or wrong attempts.',
    },
    learn: {
      id: 'learn',
      source: require('../assets/mascot/suga/suga-learn.png'),
      usage: 'Lesson intro, reading, listening, and study moments.',
    },
    letsGo: {
      id: 'letsGo',
      source: require('../assets/mascot/suga/suga-lets-go.png'),
      usage: 'Primary CTA, next lesson, map guide, and navigation prompts.',
    },
    tryAgain: {
      id: 'tryAgain',
      source: require('../assets/mascot/suga/suga-try-again.png'),
      usage: 'Encouraging retry state after an incorrect interaction.',
    },
  },
};

export const mascotProfiles: Record<MascotId, MascotProfile> = {
  suga: sugaMascot,
};

export function getMascotPose(
  poseId: MascotPoseId,
  mascotId: MascotId = 'suga',
) {
  return mascotProfiles[mascotId].poses[poseId];
}

export function getMascotPoseSource(
  poseId: MascotPoseId,
  mascotId: MascotId = 'suga',
) {
  return getMascotPose(poseId, mascotId).source;
}
