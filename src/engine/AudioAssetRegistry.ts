import { Image, type ImageRequireSource } from 'react-native';

const bundledAudioRegistry: Record<string, ImageRequireSource> = {
  'audio/tts/en/bed_en.mp3': require('../assets/audio/tts/en/bed_en.mp3'),
  'audio/tts/en/blanket_en.mp3': require('../assets/audio/tts/en/blanket_en.mp3'),
  'audio/tts/en/good_morning_en.mp3': require('../assets/audio/tts/en/good_morning_en.mp3'),
  'audio/tts/en/sun_en.mp3': require('../assets/audio/tts/en/sun_en.mp3'),
  'audio/tts/vi/bed_meaning_vi.mp3': require('../assets/audio/tts/vi/bed_meaning_vi.mp3'),
  'audio/tts/vi/bedroom_intro_vi.mp3': require('../assets/audio/tts/vi/bedroom_intro_vi.mp3'),
  'audio/tts/vi/bedroom_intro_success_vi.mp3': require('../assets/audio/tts/vi/bedroom_intro_success_vi.mp3'),
  'audio/tts/vi/blanket_meaning_vi.mp3': require('../assets/audio/tts/vi/blanket_meaning_vi.mp3'),
  'audio/tts/vi/blanket_success_vi.mp3': require('../assets/audio/tts/vi/blanket_success_vi.mp3'),
  'audio/tts/vi/correct_vi.mp3': require('../assets/audio/tts/vi/correct_vi.mp3'),
  'audio/tts/vi/drag_blanket_vi.mp3': require('../assets/audio/tts/vi/drag_blanket_vi.mp3'),
  'audio/tts/vi/speak_encourage_vi.mp3': require('../assets/audio/tts/vi/speak_encourage_vi.mp3'),
  'audio/tts/vi/drag_blanket_fail_vi.mp3': require('../assets/audio/tts/vi/drag_blanket_fail_vi.mp3'),
  'audio/tts/vi/sun_fail_vi.mp3': require('../assets/audio/tts/vi/sun_fail_vi.mp3'),
  'audio/tts/vi/sun_meaning_vi.mp3': require('../assets/audio/tts/vi/sun_meaning_vi.mp3'),
  'audio/tts/vi/sun_success_vi.mp3': require('../assets/audio/tts/vi/sun_success_vi.mp3'),
  'audio/tts/vi/teach_bed_intro_vi.mp3': require('../assets/audio/tts/vi/teach_bed_intro_vi.mp3'),
  'audio/tts/vi/teach_blanket_intro_vi.mp3': require('../assets/audio/tts/vi/teach_blanket_intro_vi.mp3'),
  'audio/tts/vi/teach_sun_intro_vi.mp3': require('../assets/audio/tts/vi/teach_sun_intro_vi.mp3'),
  'audio/tts/vi/tap_bed_vi.mp3': require('../assets/audio/tts/vi/tap_bed_vi.mp3'),
  'audio/tts/vi/tap_bed_fail_vi.mp3': require('../assets/audio/tts/vi/tap_bed_fail_vi.mp3'),
  'audio/tts/vi/tap_bed_success_vi.mp3': require('../assets/audio/tts/vi/tap_bed_success_vi.mp3'),
  'audio/tts/vi/tap_sun_vi.mp3': require('../assets/audio/tts/vi/tap_sun_vi.mp3'),
};

export function resolveBundledAudioUri(assetKey: string) {
  const audioSource = bundledAudioRegistry[assetKey];
  if (!audioSource) {
    return undefined;
  }

  return Image.resolveAssetSource(audioSource)?.uri;
}
