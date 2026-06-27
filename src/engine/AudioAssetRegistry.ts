import { Image, type ImageRequireSource } from 'react-native';

const bundledAudioRegistry: Record<string, ImageRequireSource> = {
  'audio/tts/en/bed_en.wav': require('../assets/audio/tts/en/bed_en.wav'),
  'audio/tts/en/blanket_en.wav': require('../assets/audio/tts/en/blanket_en.wav'),
  'audio/tts/en/good_morning_en.wav': require('../assets/audio/tts/en/good_morning_en.wav'),
  'audio/tts/en/sun_en.wav': require('../assets/audio/tts/en/sun_en.wav'),
  'audio/tts/en/toothbrush_en.wav': require('../assets/audio/tts/en/toothbrush_en.wav'),
  'audio/tts/en/towel_en.wav': require('../assets/audio/tts/en/towel_en.wav'),
  'audio/tts/en/water_en.wav': require('../assets/audio/tts/en/water_en.wav'),
  'audio/tts/vi/bathroom_intro_success_vi.wav': require('../assets/audio/tts/vi/bathroom_intro_success_vi.wav'),
  'audio/tts/vi/bathroom_intro_vi.wav': require('../assets/audio/tts/vi/bathroom_intro_vi.wav'),
  'audio/tts/vi/bed_meaning_vi.wav': require('../assets/audio/tts/vi/bed_meaning_vi.wav'),
  'audio/tts/vi/bedroom_intro_vi.wav': require('../assets/audio/tts/vi/bedroom_intro_vi.wav'),
  'audio/tts/vi/bedroom_intro_success_vi.wav': require('../assets/audio/tts/vi/bedroom_intro_success_vi.wav'),
  'audio/tts/vi/blanket_meaning_vi.wav': require('../assets/audio/tts/vi/blanket_meaning_vi.wav'),
  'audio/tts/vi/blanket_success_vi.wav': require('../assets/audio/tts/vi/blanket_success_vi.wav'),
  'audio/tts/vi/correct_vi.wav': require('../assets/audio/tts/vi/correct_vi.wav'),
  'audio/tts/vi/drag_blanket_vi.wav': require('../assets/audio/tts/vi/drag_blanket_vi.wav'),
  'audio/tts/vi/drag_toothbrush_fail_vi.wav': require('../assets/audio/tts/vi/drag_toothbrush_fail_vi.wav'),
  'audio/tts/vi/drag_toothbrush_vi.wav': require('../assets/audio/tts/vi/drag_toothbrush_vi.wav'),
  'audio/tts/vi/drag_towel_vi.wav': require('../assets/audio/tts/vi/drag_towel_vi.wav'),
  'audio/tts/vi/speak_encourage_vi.wav': require('../assets/audio/tts/vi/speak_encourage_vi.wav'),
  'audio/tts/vi/speak_prompt_vi.wav': require('../assets/audio/tts/vi/speak_prompt_vi.wav'),
  'audio/tts/vi/drag_blanket_fail_vi.wav': require('../assets/audio/tts/vi/drag_blanket_fail_vi.wav'),
  'audio/tts/vi/sun_fail_vi.wav': require('../assets/audio/tts/vi/sun_fail_vi.wav'),
  'audio/tts/vi/sun_meaning_vi.wav': require('../assets/audio/tts/vi/sun_meaning_vi.wav'),
  'audio/tts/vi/sun_success_vi.wav': require('../assets/audio/tts/vi/sun_success_vi.wav'),
  'audio/tts/vi/teach_bed_intro_vi.wav': require('../assets/audio/tts/vi/teach_bed_intro_vi.wav'),
  'audio/tts/vi/teach_blanket_intro_vi.wav': require('../assets/audio/tts/vi/teach_blanket_intro_vi.wav'),
  'audio/tts/vi/teach_sun_intro_vi.wav': require('../assets/audio/tts/vi/teach_sun_intro_vi.wav'),
  'audio/tts/vi/teach_toothbrush_intro_vi.wav': require('../assets/audio/tts/vi/teach_toothbrush_intro_vi.wav'),
  'audio/tts/vi/teach_towel_intro_vi.wav': require('../assets/audio/tts/vi/teach_towel_intro_vi.wav'),
  'audio/tts/vi/teach_water_intro_vi.wav': require('../assets/audio/tts/vi/teach_water_intro_vi.wav'),
  'audio/tts/vi/tap_bed_vi.wav': require('../assets/audio/tts/vi/tap_bed_vi.wav'),
  'audio/tts/vi/tap_bed_fail_vi.wav': require('../assets/audio/tts/vi/tap_bed_fail_vi.wav'),
  'audio/tts/vi/tap_bed_success_vi.wav': require('../assets/audio/tts/vi/tap_bed_success_vi.wav'),
  'audio/tts/vi/tap_sun_vi.wav': require('../assets/audio/tts/vi/tap_sun_vi.wav'),
  'audio/tts/vi/tap_toothbrush_fail_vi.wav': require('../assets/audio/tts/vi/tap_toothbrush_fail_vi.wav'),
  'audio/tts/vi/tap_toothbrush_vi.wav': require('../assets/audio/tts/vi/tap_toothbrush_vi.wav'),
  'audio/tts/vi/tap_water_fail_vi.wav': require('../assets/audio/tts/vi/tap_water_fail_vi.wav'),
  'audio/tts/vi/tap_water_success_vi.wav': require('../assets/audio/tts/vi/tap_water_success_vi.wav'),
  'audio/tts/vi/tap_water_vi.wav': require('../assets/audio/tts/vi/tap_water_vi.wav'),
  'audio/tts/vi/toothbrush_meaning_vi.wav': require('../assets/audio/tts/vi/toothbrush_meaning_vi.wav'),
  'audio/tts/vi/toothbrush_success_vi.wav': require('../assets/audio/tts/vi/toothbrush_success_vi.wav'),
  'audio/tts/vi/towel_meaning_vi.wav': require('../assets/audio/tts/vi/towel_meaning_vi.wav'),
  'audio/tts/vi/towel_success_vi.wav': require('../assets/audio/tts/vi/towel_success_vi.wav'),
  'audio/tts/vi/water_meaning_vi.wav': require('../assets/audio/tts/vi/water_meaning_vi.wav'),
};

export function resolveBundledAudioUri(assetKey: string) {
  const audioSource = bundledAudioRegistry[assetKey];
  if (!audioSource) {
    return undefined;
  }

  return Image.resolveAssetSource(audioSource)?.uri;
}
