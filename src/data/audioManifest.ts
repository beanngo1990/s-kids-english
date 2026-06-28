import { speakPracticePromptVi } from './speechPrompts';

export type RemoteAudioAsset = {
  key: string;
  text: string;
};

const wordAudioByWord: Record<string, RemoteAudioAsset> = {
  bed: {
    key: 'lessons/morning-routine/bedroom/audio/en/bed.wav',
    text: 'bed',
  },
  blanket: {
    key: 'lessons/morning-routine/bedroom/audio/en/blanket.wav',
    text: 'blanket',
  },
  sun: {
    key: 'lessons/morning-routine/bedroom/audio/en/sun.wav',
    text: 'sun',
  },
  pillow: {
    key: 'lessons/morning-routine/bedroom/audio/en/pillow.wav',
    text: 'pillow',
  },
  lamp: {
    key: 'lessons/morning-routine/bedroom/audio/en/lamp.wav',
    text: 'lamp',
  },
  clock: {
    key: 'lessons/morning-routine/bedroom/audio/en/clock.wav',
    text: 'clock',
  },
  box: {
    key: 'lessons/morning-routine/bedroom/audio/en/box.wav',
    text: 'box',
  },
  socks: {
    key: 'lessons/morning-routine/bedroom/audio/en/socks.wav',
    text: 'socks',
  },
  doll: {
    key: 'lessons/morning-routine/bedroom/audio/en/doll.wav',
    text: 'doll',
  },
  'good morning': {
    key: 'lessons/morning-routine/bedroom/audio/en/good_morning.wav',
    text: 'good morning',
  },
  'make the bed': {
    key: 'lessons/morning-routine/bedroom/audio/en/make_the_bed.wav',
    text: 'make the bed',
  },
  toothbrush: {
    key: 'lessons/morning-routine/bathroom/audio/en/toothbrush.wav',
    text: 'toothbrush',
  },
  towel: {
    key: 'lessons/morning-routine/bathroom/audio/en/towel.wav',
    text: 'towel',
  },
  water: {
    key: 'lessons/morning-routine/bathroom/audio/en/water.wav',
    text: 'water',
  },
};

const viAudioByText: Record<string, RemoteAudioAsset> = {
  [normalizeText('Mình dậy thôi nào.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/intro.wav',
    text: 'Mình dậy thôi nào. Chào buổi sáng!',
  },
  [normalizeText('Chào buổi sáng!')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/intro_success.wav',
    text: 'Chào buổi sáng!',
  },
  [normalizeText('Đây là cái giường.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/bed_meaning.wav',
    text: 'Đây là cái giường.',
  },
  [normalizeText('Mình bắt đầu với cái giường nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_bed_intro.wav',
    text: 'Mình bắt đầu với cái giường nhé.',
  },
  [normalizeText('Chạm vào cái giường nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_bed.wav',
    text: 'Bé hãy chạm vào cái giường nhé.',
  },
  [normalizeText('Đúng rồi!')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_bed_success.wav',
    text: 'Đúng rồi!',
  },
  [normalizeText('Thử chạm cái giường nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_bed_fail.wav',
    text: 'Thử chạm cái giường nhé.',
  },
  [normalizeText('Đây là cái chăn.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/blanket_meaning.wav',
    text: 'Đây là cái chăn.',
  },
  [normalizeText('Tiếp theo là cái chăn nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_blanket_intro.wav',
    text: 'Tiếp theo là cái chăn nhé.',
  },
  [normalizeText('Kéo chăn gọn nào.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/drag_blanket.wav',
    text: 'Bé kéo cái chăn vào chỗ gọn gàng nào.',
  },
  [normalizeText('Gọn gàng quá!')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/blanket_success.wav',
    text: 'Gọn gàng quá!',
  },
  [normalizeText('Kéo chăn vào vùng sáng nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/drag_blanket_fail.wav',
    text: 'Kéo chăn vào vùng sáng nhé.',
  },
  [normalizeText('Chạm vào mặt trời cho sáng nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_sun.wav',
    text: 'Bé chạm vào mặt trời cho phòng sáng nhé.',
  },
  [normalizeText('Mặt trời ở trên cao đó.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/sun_fail.wav',
    text: 'Mặt trời ở trên cao đó.',
  },
  [normalizeText('Đây là mặt trời.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/sun_meaning.wav',
    text: 'Đây là mặt trời.',
  },
  [normalizeText('Bây giờ mình nhìn mặt trời nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_sun_intro.wav',
    text: 'Bây giờ mình nhìn mặt trời nhé.',
  },
  [normalizeText('Phòng sáng rồi!')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/sun_success.wav',
    text: 'Phòng sáng rồi!',
  },
  [normalizeText('Trên giường có cái gối.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_pillow_intro.wav',
    text: 'Trên giường có cái gối.',
  },
  [normalizeText('Đây là cái gối.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/pillow_meaning.wav',
    text: 'Đây là cái gối.',
  },
  [normalizeText('Gối ở trên giường đó.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_pillow_fail.wav',
    text: 'Gối ở trên giường đó.',
  },
  [normalizeText('Chạm vào cái gối nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_pillow.wav',
    text: 'Chạm vào cái gối nhé.',
  },
  [normalizeText('Đúng rồi, đó là cái gối.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/pillow_success.wav',
    text: 'Đúng rồi, đó là cái gối.',
  },
  [normalizeText('Đây là cái đèn ngủ.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_lamp_intro.wav',
    text: 'Đây là cái đèn ngủ.',
  },
  [normalizeText('Từ này nghĩa là đèn ngủ.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/lamp_meaning.wav',
    text: 'Từ này nghĩa là đèn ngủ.',
  },
  [normalizeText('Đèn ngủ ở cạnh giường đó.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_lamp_fail.wav',
    text: 'Đèn ngủ ở cạnh giường đó.',
  },
  [normalizeText('Chạm vào đèn ngủ nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_lamp.wav',
    text: 'Chạm vào đèn ngủ nhé.',
  },
  [normalizeText('Con tìm thấy đèn ngủ rồi!')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/lamp_success.wav',
    text: 'Con tìm thấy đèn ngủ rồi!',
  },
  [normalizeText('Trên tường có cái đồng hồ.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_clock_intro.wav',
    text: 'Trên tường có cái đồng hồ.',
  },
  [normalizeText('Từ này nghĩa là đồng hồ.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/clock_meaning.wav',
    text: 'Từ này nghĩa là đồng hồ.',
  },
  [normalizeText('Đồng hồ ở trên tường đó.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_clock_fail.wav',
    text: 'Đồng hồ ở trên tường đó.',
  },
  [normalizeText('Chạm vào đồng hồ nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_clock.wav',
    text: 'Chạm vào đồng hồ nhé.',
  },
  [normalizeText('Đúng rồi, đó là đồng hồ.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/clock_success.wav',
    text: 'Đúng rồi, đó là đồng hồ.',
  },
  [normalizeText('Đây là cái hộp.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_box_intro.wav',
    text: 'Đây là cái hộp.',
  },
  [normalizeText('Từ này nghĩa là cái hộp.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/box_meaning.wav',
    text: 'Từ này nghĩa là cái hộp.',
  },
  [normalizeText('Cái hộp ở bên phải đó.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_box_fail.wav',
    text: 'Cái hộp ở bên phải đó.',
  },
  [normalizeText('Chạm vào cái hộp nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_box.wav',
    text: 'Chạm vào cái hộp nhé.',
  },
  [normalizeText('Đúng rồi, đó là cái hộp.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/box_success.wav',
    text: 'Đúng rồi, đó là cái hộp.',
  },
  [normalizeText('Đây là đôi tất.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_socks_intro.wav',
    text: 'Đây là đôi tất.',
  },
  [normalizeText('Từ này nghĩa là đôi tất.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/socks_meaning.wav',
    text: 'Từ này nghĩa là đôi tất.',
  },
  [normalizeText('Đôi tất ở gần giường đó.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_socks_fail.wav',
    text: 'Đôi tất ở gần giường đó.',
  },
  [normalizeText('Chạm vào đôi tất nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_socks.wav',
    text: 'Chạm vào đôi tất nhé.',
  },
  [normalizeText('Con tìm thấy đôi tất rồi!')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/socks_success.wav',
    text: 'Con tìm thấy đôi tất rồi!',
  },
  [normalizeText('Đây là búp bê.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_doll_intro.wav',
    text: 'Đây là búp bê.',
  },
  [normalizeText('Từ này nghĩa là búp bê.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/doll_meaning.wav',
    text: 'Từ này nghĩa là búp bê.',
  },
  [normalizeText('Búp bê ở cạnh giường đó.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_doll_fail.wav',
    text: 'Búp bê ở cạnh giường đó.',
  },
  [normalizeText('Chạm vào búp bê nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/tap_doll.wav',
    text: 'Chạm vào búp bê nhé.',
  },
  [normalizeText('Đúng rồi, đó là búp bê.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/doll_success.wav',
    text: 'Đúng rồi, đó là búp bê.',
  },
  [normalizeText('Mình cùng chào buổi sáng nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_good_morning_intro.wav',
    text: 'Mình cùng chào buổi sáng nhé.',
  },
  [normalizeText('Câu này nghĩa là chào buổi sáng.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/good_morning_meaning.wav',
    text: 'Câu này nghĩa là chào buổi sáng.',
  },
  [normalizeText('Mình học câu dọn giường nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/teach_make_the_bed_intro.wav',
    text: 'Mình học câu dọn giường nhé.',
  },
  [normalizeText('Câu này nghĩa là dọn giường.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/make_the_bed_meaning.wav',
    text: 'Câu này nghĩa là dọn giường.',
  },
  [normalizeText('Cất gối vào hộp nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/drag_pillow_to_box.wav',
    text: 'Cất gối vào hộp nhé.',
  },
  [normalizeText('Kéo gối vào cái hộp nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/drag_pillow_to_box_fail.wav',
    text: 'Kéo gối vào cái hộp nhé.',
  },
  [normalizeText('Gối đã ở trong hộp rồi!')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/pillow_in_box_success.wav',
    text: 'Gối đã ở trong hộp rồi!',
  },
  [normalizeText('Cất chăn vào hộp để dọn giường nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/drag_blanket_to_box.wav',
    text: 'Cất chăn vào hộp để dọn giường nhé.',
  },
  [normalizeText('Kéo chăn vào cái hộp nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/drag_blanket_to_box_fail.wav',
    text: 'Kéo chăn vào cái hộp nhé.',
  },
  [normalizeText('Giường gọn gàng rồi!')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/make_the_bed_success.wav',
    text: 'Giường gọn gàng rồi!',
  },
  [normalizeText('Cất tất vào hộp nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/drag_socks_to_box.wav',
    text: 'Cất tất vào hộp nhé.',
  },
  [normalizeText('Kéo tất vào cái hộp nhé.')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/drag_socks_to_box_fail.wav',
    text: 'Kéo tất vào cái hộp nhé.',
  },
  [normalizeText('Tất đã ở trong hộp rồi!')]: {
    key: 'lessons/morning-routine/bedroom/audio/vi/socks_in_box_success.wav',
    text: 'Tất đã ở trong hộp rồi!',
  },
  [normalizeText('Mình vào phòng tắm nhé.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/intro.wav',
    text: 'Mình vào phòng tắm nhé.',
  },
  [normalizeText('Sạch sẽ nào!')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/intro_success.wav',
    text: 'Sạch sẽ nào!',
  },
  [normalizeText('Mình bắt đầu với bàn chải nhé.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/teach_toothbrush_intro.wav',
    text: 'Mình bắt đầu với bàn chải nhé.',
  },
  [normalizeText('Đây là bàn chải đánh răng.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/toothbrush_meaning.wav',
    text: 'Đây là bàn chải đánh răng.',
  },
  [normalizeText('Chạm vào bàn chải nhé.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/tap_toothbrush.wav',
    text: 'Chạm vào bàn chải nhé.',
  },
  [normalizeText('Bàn chải ở cạnh bồn rửa đó.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/tap_toothbrush_fail.wav',
    text: 'Bàn chải ở cạnh bồn rửa đó.',
  },
  [normalizeText('Kéo bàn chải tới miệng bé.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/drag_toothbrush.wav',
    text: 'Kéo bàn chải tới miệng bé.',
  },
  [normalizeText('Kéo bàn chải tới miệng bé nhé.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/drag_toothbrush_fail.wav',
    text: 'Kéo bàn chải tới miệng bé nhé.',
  },
  [normalizeText('Răng sạch rồi!')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/toothbrush_success.wav',
    text: 'Răng sạch rồi!',
  },
  [normalizeText('Tiếp theo là nước nhé.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/teach_water_intro.wav',
    text: 'Tiếp theo là nước nhé.',
  },
  [normalizeText('Đây là nước.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/water_meaning.wav',
    text: 'Đây là nước.',
  },
  [normalizeText('Chạm vào nước nhé.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/tap_water.wav',
    text: 'Chạm vào nước nhé.',
  },
  [normalizeText('Nước ở gần bồn đó.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/tap_water_fail.wav',
    text: 'Nước ở gần bồn đó.',
  },
  [normalizeText('Mát quá!')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/tap_water_success.wav',
    text: 'Mát quá!',
  },
  [normalizeText('Bây giờ mình lấy khăn nhé.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/teach_towel_intro.wav',
    text: 'Bây giờ mình lấy khăn nhé.',
  },
  [normalizeText('Đây là khăn mặt.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/towel_meaning.wav',
    text: 'Đây là khăn mặt.',
  },
  [normalizeText('Kéo khăn tới mặt bé nhé.')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/drag_towel.wav',
    text: 'Kéo khăn tới mặt bé nhé.',
  },
  [normalizeText('Mặt sạch rồi!')]: {
    key: 'lessons/morning-routine/bathroom/audio/vi/towel_success.wav',
    text: 'Mặt sạch rồi!',
  },
  [normalizeText('Cô nghe rồi! Giỏi quá!')]: {
    key: 'shared/audio/vi/speak_encourage.wav',
    text: 'Cô nghe rồi! Giỏi quá!',
  },
  [normalizeText(speakPracticePromptVi)]: {
    key: 'shared/audio/vi/speak_prompt.wav',
    text: speakPracticePromptVi,
  },
  [normalizeText('Đúng rồi! Bé giỏi quá!')]: {
    key: 'shared/audio/vi/correct.wav',
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
