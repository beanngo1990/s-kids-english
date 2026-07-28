import {
  canAccessLesson,
  canAccessReview,
  canAccessScene,
  FREE_LESSON_IDS,
  isFreeLesson,
  type ContentAccessSnapshot,
  type ContentAccessStatus,
} from '../src/engine/ContentAccessPolicy';

const restrictedStatuses: ContentAccessStatus[] = [
  'initializing',
  'signedOut',
  'free',
  'unavailable',
];

function snapshot(status: ContentAccessStatus): ContentAccessSnapshot {
  return { status };
}

describe('ContentAccessPolicy', () => {
  test('uses stable lesson IDs for the free tier', () => {
    expect(FREE_LESSON_IDS).toEqual(['morning-routine', 'at-school']);

    const reorderedCatalog = [
      'at-the-park',
      'at-school',
      'morning-routine',
      'bedtime',
    ];

    expect(reorderedCatalog.filter(isFreeLesson)).toEqual([
      'at-school',
      'morning-routine',
    ]);
  });

  test.each<ContentAccessStatus>([
    'initializing',
    'signedOut',
    'free',
    'premium',
    'unavailable',
  ])('keeps both free lessons accessible while status is %s', status => {
    expect(canAccessLesson('morning-routine', snapshot(status))).toBe(true);
    expect(canAccessScene('at-school', 'classroom', snapshot(status))).toBe(
      true,
    );
    expect(canAccessReview('at-school', snapshot(status))).toBe(true);
  });

  test('opens every lesson boundary for Premium', () => {
    const premium = snapshot('premium');

    expect(canAccessLesson('bedtime', premium)).toBe(true);
    expect(canAccessScene('bedtime', 'sleep', premium)).toBe(true);
    expect(canAccessReview('bedtime', premium)).toBe(true);
  });

  test.each(restrictedStatuses)(
    'blocks Premium lesson boundaries while status is %s',
    status => {
      const accessSnapshot = snapshot(status);

      expect(canAccessLesson('bedtime', accessSnapshot)).toBe(false);
      expect(canAccessScene('bedtime', 'sleep', accessSnapshot)).toBe(false);
      expect(canAccessReview('bedtime', accessSnapshot)).toBe(false);
    },
  );
});
