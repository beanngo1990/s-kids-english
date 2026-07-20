export const kidLockAudioPrompts = {
  premium: {
    en: 'This lesson needs a parent to unlock it. Ask a parent for help!',
    vi: 'Bài này cần ba mẹ mở khóa. Con gọi ba mẹ nhé!',
  },
  progress: {
    en: 'Finish the lesson before this one to unlock it.',
    vi: 'Con hãy hoàn thành bài phía trước để mở bài này nhé!',
  },
  resolving: {
    en: 'Sungy is checking. Please wait a moment!',
    vi: 'Sungy đang kiểm tra. Con chờ một chút nhé!',
  },
} as const;

export type KidLockReason = keyof typeof kidLockAudioPrompts;
export type KidLockPromptLanguage = keyof (typeof kidLockAudioPrompts)['premium'];

export function getKidLockAudioPrompt(
  reason: KidLockReason,
  language: KidLockPromptLanguage,
) {
  return kidLockAudioPrompts[reason][language];
}
