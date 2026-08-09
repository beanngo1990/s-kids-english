import { skidsIcons } from '../src/assets/icons/skids';
import { lessons } from '../src/data/lessons';
import {
  getLessonIconName,
  getLessonMilestoneIconName,
  getMapSceneIconName,
  getSceneIconName,
} from '../src/utils/lessonIcons';

const expectedLessonMilestoneIcons = [
  ['morning-routine', 'milestoneMorningRoutine'],
  ['at-school', 'milestoneAtSchool'],
  ['playtime', 'milestonePlaytime'],
  ['lunch-time', 'milestoneLunchTime'],
  ['afternoon-home', 'milestoneAfternoonHome'],
  ['snack-time', 'milestoneSnackTime'],
  ['home-play', 'milestoneHomePlay'],
  ['afternoon-bath', 'milestoneAfternoonBath'],
  ['family-dinner', 'milestoneFamilyDinner'],
  ['after-dinner-cleanup', 'milestoneAfterDinnerCleanup'],
  ['bedtime', 'milestoneBedtime'],
  ['supermarket-trip', 'milestoneSupermarketTrip'],
  ['park-visit', 'milestoneParkVisit'],
  ['beach-day', 'milestoneBeachDay'],
  ['animal-trip', 'milestoneAnimalTrip'],
  ['library-visit', 'milestoneLibraryVisit'],
  ['doctor-visit', 'milestoneDoctorVisit'],
  ['birthday-party', 'milestoneBirthdayParty'],
  ['grandparents-visit', 'milestoneGrandparentsVisit'],
  ['my-body', 'milestoneMyBody'],
  ['five-senses', 'milestoneFiveSenses'],
  ['my-feelings', 'milestoneMyFeelings'],
  ['calm-myself', 'milestoneCalmMyself'],
  ['personal-care', 'milestonePersonalCare'],
  ['dress-myself', 'milestoneDressMyself'],
  ['toilet-routine', 'milestoneToiletRoutine'],
  ['speaking-up', 'milestoneSpeakingUp'],
] as const;

test('map scene icons preserve each scene semantic icon', () => {
  lessons.forEach(lesson => {
    lesson.scenes.forEach(scene => {
      expect(getMapSceneIconName(scene)).toBe(getSceneIconName(scene));
    });
  });
});

test('scene icons are explicit, valid, and unique across the theme map', () => {
  const iconNames = lessons.flatMap(lesson =>
    lesson.scenes.map(getMapSceneIconName),
  );

  expect(iconNames).not.toContain('star');
  expect(new Set(iconNames).size).toBe(iconNames.length);
  iconNames.forEach(iconName => {
    expect(iconName in skidsIcons).toBe(true);
  });
});

test('at-school map nodes use three distinct matching icons', () => {
  const atSchoolLesson = lessons.find(lesson => lesson.id === 'at-school');

  expect(atSchoolLesson?.scenes.map(getMapSceneIconName)).toEqual([
    'classroom',
    'schoolSupplies',
    'teacherInstructions',
  ]);
});

test('supermarket lesson card uses the trip-level storefront icon', () => {
  expect(getLessonIconName({ id: 'supermarket-trip' })).toBe(
    'milestoneSupermarketTrip',
  );
});

test('lesson milestones use dedicated icons that never repeat scene icons', () => {
  const milestoneEntries = lessons.map(
    lesson => [lesson.id, getLessonMilestoneIconName(lesson)] as const,
  );
  const milestoneIconNames = milestoneEntries.map(([, iconName]) => iconName);
  const sceneIconNames = new Set(
    lessons.flatMap(lesson => lesson.scenes.map(getMapSceneIconName)),
  );

  expect(milestoneEntries).toEqual(expectedLessonMilestoneIcons);
  expect(new Set(milestoneIconNames).size).toBe(lessons.length);
  milestoneIconNames.forEach(iconName => {
    expect(iconName in skidsIcons).toBe(true);
    expect(sceneIconNames.has(iconName)).toBe(false);
  });
});
