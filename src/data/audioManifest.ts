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
  toothbrush: {
    key: 'audio/tts/en/toothbrush_en.wav',
    text: 'toothbrush',
  },
  towel: {
    key: 'audio/tts/en/towel_en.wav',
    text: 'towel',
  },
  water: {
    key: 'audio/tts/en/water_en.wav',
    text: 'water',
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
  [normalizeText('Mình vào phòng tắm nhé.')]: {
    key: 'audio/tts/vi/bathroom_intro_vi.wav',
    text: 'Mình vào phòng tắm nhé.',
  },
  [normalizeText('Sạch sẽ nào!')]: {
    key: 'audio/tts/vi/bathroom_intro_success_vi.wav',
    text: 'Sạch sẽ nào!',
  },
  [normalizeText('Mình bắt đầu với bàn chải nhé.')]: {
    key: 'audio/tts/vi/teach_toothbrush_intro_vi.wav',
    text: 'Mình bắt đầu với bàn chải nhé.',
  },
  [normalizeText('Đây là bàn chải đánh răng.')]: {
    key: 'audio/tts/vi/toothbrush_meaning_vi.wav',
    text: 'Đây là bàn chải đánh răng.',
  },
  [normalizeText('Chạm vào bàn chải nhé.')]: {
    key: 'audio/tts/vi/tap_toothbrush_vi.wav',
    text: 'Chạm vào bàn chải nhé.',
  },
  [normalizeText('Bàn chải ở cạnh bồn rửa đó.')]: {
    key: 'audio/tts/vi/tap_toothbrush_fail_vi.wav',
    text: 'Bàn chải ở cạnh bồn rửa đó.',
  },
  [normalizeText('Kéo bàn chải tới miệng bé.')]: {
    key: 'audio/tts/vi/drag_toothbrush_vi.wav',
    text: 'Kéo bàn chải tới miệng bé.',
  },
  [normalizeText('Kéo bàn chải tới miệng bé nhé.')]: {
    key: 'audio/tts/vi/drag_toothbrush_fail_vi.wav',
    text: 'Kéo bàn chải tới miệng bé nhé.',
  },
  [normalizeText('Răng sạch rồi!')]: {
    key: 'audio/tts/vi/toothbrush_success_vi.wav',
    text: 'Răng sạch rồi!',
  },
  [normalizeText('Tiếp theo là nước nhé.')]: {
    key: 'audio/tts/vi/teach_water_intro_vi.wav',
    text: 'Tiếp theo là nước nhé.',
  },
  [normalizeText('Đây là nước.')]: {
    key: 'audio/tts/vi/water_meaning_vi.wav',
    text: 'Đây là nước.',
  },
  [normalizeText('Chạm vào nước nhé.')]: {
    key: 'audio/tts/vi/tap_water_vi.wav',
    text: 'Chạm vào nước nhé.',
  },
  [normalizeText('Nước ở gần bồn đó.')]: {
    key: 'audio/tts/vi/tap_water_fail_vi.wav',
    text: 'Nước ở gần bồn đó.',
  },
  [normalizeText('Mát quá!')]: {
    key: 'audio/tts/vi/tap_water_success_vi.wav',
    text: 'Mát quá!',
  },
  [normalizeText('Bây giờ mình lấy khăn nhé.')]: {
    key: 'audio/tts/vi/teach_towel_intro_vi.wav',
    text: 'Bây giờ mình lấy khăn nhé.',
  },
  [normalizeText('Đây là khăn mặt.')]: {
    key: 'audio/tts/vi/towel_meaning_vi.wav',
    text: 'Đây là khăn mặt.',
  },
  [normalizeText('Kéo khăn tới mặt bé nhé.')]: {
    key: 'audio/tts/vi/drag_towel_vi.wav',
    text: 'Kéo khăn tới mặt bé nhé.',
  },
  [normalizeText('Mặt sạch rồi!')]: {
    key: 'audio/tts/vi/towel_success_vi.wav',
    text: 'Mặt sạch rồi!',
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
