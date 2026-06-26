import { lessons } from '../src/data/lessons';
import { validateLesson, validateLessons } from '../src/data/lessonValidation';
import type { Lesson } from '../src/types/lesson';

test('lesson catalog has valid data links', () => {
  const issues = validateLessons(lessons);

  expect(issues.filter(issue => issue.severity === 'error')).toEqual([]);
});

test('validator catches missing object references', () => {
  const invalidLesson: Lesson = {
    ageRange: {
      max: 4,
      min: 3,
    },
    descriptionVi: 'Demo',
    id: 'invalid-lesson',
    scenes: [
      {
        background: {
          id: 'invalid-background',
          source: 'images/scenes/missing.png',
          type: 'image',
        },
        id: 'invalid-scene',
        objects: [],
        steps: [
          {
            id: 'invalid-step',
            instructionVi: 'Chạm vào đồ vật.',
            interaction: {
              targetObjectId: 'missing-object',
              type: 'tap',
            },
            successFeedbackVi: 'Đúng rồi!',
            targetObjectIds: ['missing-object'],
            type: 'practice',
          },
        ],
        titleEn: 'Invalid',
        titleVi: 'Sai dữ liệu',
      },
    ],
    titleEn: 'Invalid Lesson',
    titleVi: 'Bài sai',
  };

  const issues = validateLesson(invalidLesson);

  expect(issues.some(issue => issue.message.includes('missing-object'))).toBe(
    true,
  );
});
