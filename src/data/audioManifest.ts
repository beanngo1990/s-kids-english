export type RemoteAudioAsset = {
  key: string;
  text: string;
};

const wordAudioByWord: Record<string, RemoteAudioAsset> = {
  bed: {
    key: 'audio/tts/en/bed_en.mp3',
    text: 'bed',
  },
  blanket: {
    key: 'audio/tts/en/blanket_en.mp3',
    text: 'blanket',
  },
  sun: {
    key: 'audio/tts/en/sun_en.mp3',
    text: 'sun',
  },
};

const viAudioByText: Record<string, RemoteAudioAsset> = {
  [normalizeText('Mình dậy thôi nào.')]: {
    key: 'audio/tts/vi/bedroom_intro_vi.mp3',
    text: 'Mình dậy thôi nào. Chào buổi sáng!',
  },
  [normalizeText('Chạm vào bed nhé.')]: {
    key: 'audio/tts/vi/tap_bed_vi.mp3',
    text: 'Bé hãy chạm vào cái giường nhé.',
  },
  [normalizeText('Kéo chăn gọn nào.')]: {
    key: 'audio/tts/vi/drag_blanket_vi.mp3',
    text: 'Bé kéo cái chăn vào chỗ gọn gàng nào.',
  },
  [normalizeText('Đúng rồi! Bé giỏi quá!')]: {
    key: 'audio/tts/vi/correct_vi.mp3',
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
