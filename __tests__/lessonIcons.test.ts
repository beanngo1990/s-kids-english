import { skidsIcons } from '../src/assets/icons/skids';
import { lessons } from '../src/data/lessons';
import {
  getMapSceneIconName,
  getSceneIconName,
} from '../src/utils/lessonIcons';

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
