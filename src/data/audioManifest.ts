import { speakPracticePromptVi } from './speechPrompts';

export type RemoteAudioAsset = {
  key: string;
  text: string;
};

const wordAudioByWord: Record<string, RemoteAudioAsset> = {
  bed: {
    key: 'audio/tts/en/bed_en.wav',
    text: 'bed',
  },
  blanket: {
    key: 'audio/tts/en/blanket_en.wav',
    text: 'blanket',
  },
  sun: {
    key: 'audio/tts/en/sun_en.wav',
    text: 'sun',
  },
};

const viAudioByText: Record<string, RemoteAudioAsset> = {
  [normalizeText('Mình dậy thôi nào.')]: {
    key: 'audio/tts/vi/bedroom_intro_vi.wav',
    text: 'Mình dậy thôi nào. Chào buổi sáng!',
  },
  [normalizeText('Chào buổi sáng!')]: {
    key: 'audio/tts/vi/bedroom_intro_success_vi.wav',
    text: 'Chào buổi sáng!',
  },
  [normalizeText('Đây là cái giường.')]: {
    key: 'audio/tts/vi/bed_meaning_vi.wav',
    text: 'Đây là cái giường.',
  },
  [normalizeText('Mình bắt đầu với cái giường nhé.')]: {
    key: 'audio/tts/vi/teach_bed_intro_vi.wav',
    text: 'Mình bắt đầu với cái giường nhé.',
  },
  [normalizeText('Chạm vào cái giường nhé.')]: {
    key: 'audio/tts/vi/tap_bed_vi.wav',
    text: 'Bé hãy chạm vào cái giường nhé.',
  },
  [normalizeText('Đúng rồi!')]: {
    key: 'audio/tts/vi/tap_bed_success_vi.wav',
    text: 'Đúng rồi!',
  },
  [normalizeText('Thử chạm cái giường nhé.')]: {
    key: 'audio/tts/vi/tap_bed_fail_vi.wav',
    text: 'Thử chạm cái giường nhé.',
  },
  [normalizeText('Đây là cái chăn.')]: {
    key: 'audio/tts/vi/blanket_meaning_vi.wav',
    text: 'Đây là cái chăn.',
  },
  [normalizeText('Tiếp theo là cái chăn nhé.')]: {
    key: 'audio/tts/vi/teach_blanket_intro_vi.wav',
    text: 'Tiếp theo là cái chăn nhé.',
  },
  [normalizeText('Kéo chăn gọn nào.')]: {
    key: 'audio/tts/vi/drag_blanket_vi.wav',
    text: 'Bé kéo cái chăn vào chỗ gọn gàng nào.',
  },
  [normalizeText('Gọn gàng quá!')]: {
    key: 'audio/tts/vi/blanket_success_vi.wav',
    text: 'Gọn gàng quá!',
  },
  [normalizeText('Kéo chăn vào vùng sáng nhé.')]: {
    key: 'audio/tts/vi/drag_blanket_fail_vi.wav',
    text: 'Kéo chăn vào vùng sáng nhé.',
  },
  [normalizeText('Chạm vào mặt trời cho sáng nhé.')]: {
    key: 'audio/tts/vi/tap_sun_vi.wav',
    text: 'Bé chạm vào mặt trời cho phòng sáng nhé.',
  },
  [normalizeText('Mặt trời ở trên cao đó.')]: {
    key: 'audio/tts/vi/sun_fail_vi.wav',
    text: 'Mặt trời ở trên cao đó.',
  },
  [normalizeText('Đây là mặt trời.')]: {
    key: 'audio/tts/vi/sun_meaning_vi.wav',
    text: 'Đây là mặt trời.',
  },
  [normalizeText('Bây giờ mình nhìn mặt trời nhé.')]: {
    key: 'audio/tts/vi/teach_sun_intro_vi.wav',
    text: 'Bây giờ mình nhìn mặt trời nhé.',
  },
  [normalizeText('Phòng sáng rồi!')]: {
    key: 'audio/tts/vi/sun_success_vi.wav',
    text: 'Phòng sáng rồi!',
  },
  [normalizeText('Cô nghe rồi! Giỏi quá!')]: {
    key: 'audio/tts/vi/speak_encourage_vi.wav',
    text: 'Cô nghe rồi! Giỏi quá!',
  },
  [normalizeText(speakPracticePromptVi)]: {
    key: 'audio/tts/vi/speak_prompt_vi.wav',
    text: speakPracticePromptVi,
  },
  [normalizeText('Đúng rồi! Bé giỏi quá!')]: {
    key: 'audio/tts/vi/correct_vi.wav',
    text: 'Đúng rồi! Bé giỏi quá!',
  },
};

export function getWordAudioAsset(word: string) {
  return wordAudioByWord[normalizeText(word)];
}

export function getViAudioAsset(text: string) {
  return viAudioByText[normalizeText(text)];
}

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}
