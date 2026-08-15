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
  ['plant-a-seed', 'milestonePlantASeed'],
  ['help-it-grow', 'milestoneHelpItGrow'],
  ['garden-friends', 'milestoneGardenFriends'],
  ['harvest-day', 'milestoneHarvestDay'],
  ['garden-to-table', 'milestoneGardenToTable'],
  ['feed-the-puppy', 'milestoneFeedThePuppy'],
  ['play-with-the-puppy', 'milestonePlayWithThePuppy'],
  ['find-the-kitten', 'milestoneFindTheKitten'],
  ['clean-muddy-paws', 'milestoneCleanMuddyPaws'],
] as const;

test('help-it-grow uses distinct scene and lesson icons', () => {
  const helpItGrow = lessons.find(lesson => lesson.id === 'help-it-grow');

  expect(helpItGrow?.scenes.map(getMapSceneIconName)).toEqual([
    'newLeafSunlight',
    'rainyDayCare',
    'windAndSupport',
  ]);
  expect(getLessonIconName({ id: 'help-it-grow' })).toBe('newLeafSunlight');
});

test('garden-friends uses distinct scene and lesson icons', () => {
  const gardenFriends = lessons.find(lesson => lesson.id === 'garden-friends');

  expect(gardenFriends?.scenes.map(getMapSceneIconName)).toEqual([
    'underTheLeaf',
    'flowerVisitors',
    'quietGardenWatch',
  ]);
  expect(getLessonIconName({ id: 'garden-friends' })).toBe('underTheLeaf');
});

test('harvest-day uses distinct scene and lesson icons', () => {
  const harvestDay = lessons.find(lesson => lesson.id === 'harvest-day');

  expect(harvestDay?.scenes.map(getMapSceneIconName)).toEqual([
    'findTheRipeOnes',
    'pickGently',
    'sortTheHarvest',
  ]);
  expect(getLessonIconName({ id: 'harvest-day' })).toBe('findTheRipeOnes');
});

test('garden-to-table uses distinct scene and lesson icons', () => {
  const gardenToTable = lessons.find(lesson => lesson.id === 'garden-to-table');

  expect(gardenToTable?.scenes.map(getMapSceneIconName)).toEqual([
    'rinseAndDrain',
    'makeAndShare',
    'saveForNextSeason',
  ]);
  expect(getLessonIconName({ id: 'garden-to-table' })).toBe('rinseAndDrain');
});

test('feed-the-puppy uses distinct scene and lesson icons', () => {
  const feedThePuppy = lessons.find(lesson => lesson.id === 'feed-the-puppy');

  expect(feedThePuppy?.scenes.map(getMapSceneIconName)).toEqual([
    'meetThePuppy',
    'fillTheBowl',
    'puppyEats',
  ]);
  expect(getLessonIconName({ id: 'feed-the-puppy' })).toBe('meetThePuppy');
});

test('play-with-the-puppy uses distinct scene and lesson icons', () => {
  const lesson = lessons.find(item => item.id === 'play-with-the-puppy');

  expect(lesson?.scenes.map(getMapSceneIconName)).toEqual([
    'chooseTheBall',
    'rollAndCatch',
    'bringItBack',
  ]);
  expect(getLessonIconName({ id: 'play-with-the-puppy' })).toBe(
    'chooseTheBall',
  );
});

test('find-the-kitten uses distinct scene and lesson icons', () => {
  const lesson = lessons.find(item => item.id === 'find-the-kitten');

  expect(lesson?.scenes.map(getMapSceneIconName)).toEqual([
    'hearTheKitten',
    'checkHidingSpots',
    'welcomeTheKitten',
  ]);
  expect(getLessonIconName({ id: 'find-the-kitten' })).toBe('hearTheKitten');
});

test('clean-muddy-paws uses distinct scene and lesson icons', () => {
  const lesson = lessons.find(item => item.id === 'clean-muddy-paws');

  expect(lesson?.scenes.map(getMapSceneIconName)).toEqual([
    'noticeMuddyPaws',
    'washThePaws',
    'dryThePaws',
  ]);
  expect(getLessonIconName({ id: 'clean-muddy-paws' })).toBe(
    'noticeMuddyPaws',
  );
});

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
