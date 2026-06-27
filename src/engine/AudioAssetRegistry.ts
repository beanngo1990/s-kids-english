import { Image, type ImageRequireSource } from 'react-native';

const bundledAudioRegistry: Record<string, ImageRequireSource> = {
  'lessons/morning-routine/bathroom/audio/en/toothbrush.wav': require('../assets/lessons/morning-routine/bathroom/audio/en/toothbrush.wav'),
  'lessons/morning-routine/bathroom/audio/en/towel.wav': require('../assets/lessons/morning-routine/bathroom/audio/en/towel.wav'),
  'lessons/morning-routine/bathroom/audio/en/water.wav': require('../assets/lessons/morning-routine/bathroom/audio/en/water.wav'),
  'lessons/morning-routine/bathroom/audio/vi/drag_toothbrush_fail.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/drag_toothbrush_fail.wav'),
  'lessons/morning-routine/bathroom/audio/vi/drag_toothbrush.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/drag_toothbrush.wav'),
  'lessons/morning-routine/bathroom/audio/vi/drag_towel.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/drag_towel.wav'),
  'lessons/morning-routine/bathroom/audio/vi/intro_success.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/intro_success.wav'),
  'lessons/morning-routine/bathroom/audio/vi/intro.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/intro.wav'),
  'lessons/morning-routine/bathroom/audio/vi/tap_toothbrush_fail.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/tap_toothbrush_fail.wav'),
  'lessons/morning-routine/bathroom/audio/vi/tap_toothbrush.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/tap_toothbrush.wav'),
  'lessons/morning-routine/bathroom/audio/vi/tap_water_fail.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/tap_water_fail.wav'),
  'lessons/morning-routine/bathroom/audio/vi/tap_water_success.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/tap_water_success.wav'),
  'lessons/morning-routine/bathroom/audio/vi/tap_water.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/tap_water.wav'),
  'lessons/morning-routine/bathroom/audio/vi/teach_toothbrush_intro.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/teach_toothbrush_intro.wav'),
  'lessons/morning-routine/bathroom/audio/vi/teach_towel_intro.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/teach_towel_intro.wav'),
  'lessons/morning-routine/bathroom/audio/vi/teach_water_intro.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/teach_water_intro.wav'),
  'lessons/morning-routine/bathroom/audio/vi/toothbrush_meaning.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/toothbrush_meaning.wav'),
  'lessons/morning-routine/bathroom/audio/vi/toothbrush_success.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/toothbrush_success.wav'),
  'lessons/morning-routine/bathroom/audio/vi/towel_meaning.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/towel_meaning.wav'),
  'lessons/morning-routine/bathroom/audio/vi/towel_success.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/towel_success.wav'),
  'lessons/morning-routine/bathroom/audio/vi/water_meaning.wav': require('../assets/lessons/morning-routine/bathroom/audio/vi/water_meaning.wav'),
  'lessons/morning-routine/bedroom/audio/en/bed.wav': require('../assets/lessons/morning-routine/bedroom/audio/en/bed.wav'),
  'lessons/morning-routine/bedroom/audio/en/blanket.wav': require('../assets/lessons/morning-routine/bedroom/audio/en/blanket.wav'),
  'lessons/morning-routine/bedroom/audio/en/good_morning.wav': require('../assets/lessons/morning-routine/bedroom/audio/en/good_morning.wav'),
  'lessons/morning-routine/bedroom/audio/en/sun.wav': require('../assets/lessons/morning-routine/bedroom/audio/en/sun.wav'),
  'lessons/morning-routine/bedroom/audio/vi/bed_meaning.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/bed_meaning.wav'),
  'lessons/morning-routine/bedroom/audio/vi/blanket_meaning.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/blanket_meaning.wav'),
  'lessons/morning-routine/bedroom/audio/vi/blanket_success.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/blanket_success.wav'),
  'lessons/morning-routine/bedroom/audio/vi/drag_blanket_fail.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/drag_blanket_fail.wav'),
  'lessons/morning-routine/bedroom/audio/vi/drag_blanket.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/drag_blanket.wav'),
  'lessons/morning-routine/bedroom/audio/vi/intro_success.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/intro_success.wav'),
  'lessons/morning-routine/bedroom/audio/vi/intro.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/intro.wav'),
  'lessons/morning-routine/bedroom/audio/vi/sun_fail.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/sun_fail.wav'),
  'lessons/morning-routine/bedroom/audio/vi/sun_meaning.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/sun_meaning.wav'),
  'lessons/morning-routine/bedroom/audio/vi/sun_success.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/sun_success.wav'),
  'lessons/morning-routine/bedroom/audio/vi/tap_bed_fail.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/tap_bed_fail.wav'),
  'lessons/morning-routine/bedroom/audio/vi/tap_bed_success.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/tap_bed_success.wav'),
  'lessons/morning-routine/bedroom/audio/vi/tap_bed.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/tap_bed.wav'),
  'lessons/morning-routine/bedroom/audio/vi/tap_sun.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/tap_sun.wav'),
  'lessons/morning-routine/bedroom/audio/vi/teach_bed_intro.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/teach_bed_intro.wav'),
  'lessons/morning-routine/bedroom/audio/vi/teach_blanket_intro.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/teach_blanket_intro.wav'),
  'lessons/morning-routine/bedroom/audio/vi/teach_sun_intro.wav': require('../assets/lessons/morning-routine/bedroom/audio/vi/teach_sun_intro.wav'),
  'shared/audio/vi/correct.wav': require('../assets/shared/audio/vi/correct.wav'),
  'shared/audio/vi/speak_encourage.wav': require('../assets/shared/audio/vi/speak_encourage.wav'),
  'shared/audio/vi/speak_prompt.wav': require('../assets/shared/audio/vi/speak_prompt.wav'),
};

export function resolveBundledAudioUri(assetKey: string) {
  const audioSource = bundledAudioRegistry[assetKey];
  if (!audioSource) {
    return undefined;
  }

  return Image.resolveAssetSource(audioSource)?.uri;
}
