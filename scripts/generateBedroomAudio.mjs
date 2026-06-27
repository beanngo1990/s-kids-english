import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const account = process.env.GOOGLE_TTS_ACCOUNT ?? 'tomtatvui@gmail.com';
const project = process.env.GOOGLE_CLOUD_PROJECT ?? 'vertext-api-images';
const endpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const audioConfig = {
  audioEncoding: 'LINEAR16',
  sampleRateHertz: 24000,
};

const voices = {
  en: {
    languageCode: 'en-US',
    name: process.env.GOOGLE_TTS_EN_VOICE ?? 'en-US-Chirp3-HD-Aoede',
  },
  vi: {
    languageCode: 'vi-VN',
    name: process.env.GOOGLE_TTS_VI_VOICE ?? 'vi-VN-Chirp3-HD-Aoede',
  },
};

const files = [
  en('pillow', 'pillow.wav'),
  en('lamp', 'lamp.wav'),
  en('clock', 'clock.wav'),
  en('window', 'window.wav'),
  en('socks', 'socks.wav'),
  en('doll', 'doll.wav'),
  vi('Trên giường có cái gối.', 'teach_pillow_intro.wav'),
  vi('Đây là cái gối.', 'pillow_meaning.wav'),
  vi('Gối ở trên giường đó.', 'tap_pillow_fail.wav'),
  vi('Chạm vào cái gối nhé.', 'tap_pillow.wav'),
  vi('Đúng rồi, đó là cái gối.', 'pillow_success.wav'),
  vi('Đây là cái đèn ngủ.', 'teach_lamp_intro.wav'),
  vi('Từ này nghĩa là đèn ngủ.', 'lamp_meaning.wav'),
  vi('Đèn ngủ ở cạnh giường đó.', 'tap_lamp_fail.wav'),
  vi('Chạm vào đèn ngủ nhé.', 'tap_lamp.wav'),
  vi('Con tìm thấy đèn ngủ rồi!', 'lamp_success.wav'),
  vi('Trên tường có cái đồng hồ.', 'teach_clock_intro.wav'),
  vi('Từ này nghĩa là đồng hồ.', 'clock_meaning.wav'),
  vi('Đồng hồ ở trên tường đó.', 'tap_clock_fail.wav'),
  vi('Chạm vào đồng hồ nhé.', 'tap_clock.wav'),
  vi('Đúng rồi, đó là đồng hồ.', 'clock_success.wav'),
  vi('Đây là cửa sổ.', 'teach_window_intro.wav'),
  vi('Từ này nghĩa là cửa sổ.', 'window_meaning.wav'),
  vi('Cửa sổ ở phía trên giường đó.', 'tap_window_fail.wav'),
  vi('Chạm vào cửa sổ nhé.', 'tap_window.wav'),
  vi('Đúng rồi, đó là cửa sổ.', 'window_success.wav'),
  vi('Đây là đôi tất.', 'teach_socks_intro.wav'),
  vi('Từ này nghĩa là đôi tất.', 'socks_meaning.wav'),
  vi('Đôi tất ở gần giường đó.', 'tap_socks_fail.wav'),
  vi('Chạm vào đôi tất nhé.', 'tap_socks.wav'),
  vi('Con tìm thấy đôi tất rồi!', 'socks_success.wav'),
  vi('Đây là búp bê.', 'teach_doll_intro.wav'),
  vi('Từ này nghĩa là búp bê.', 'doll_meaning.wav'),
  vi('Búp bê ở cạnh giường đó.', 'tap_doll_fail.wav'),
  vi('Chạm vào búp bê nhé.', 'tap_doll.wav'),
  vi('Đúng rồi, đó là búp bê.', 'doll_success.wav'),
];

const token = execFileSync('gcloud', [
  'auth',
  'print-access-token',
  `--account=${account}`,
], {
  encoding: 'utf8',
}).trim();

for (const file of files) {
  const response = await fetch(endpoint, {
    body: JSON.stringify({
      audioConfig,
      input: { text: file.text },
      voice: file.voice,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-goog-user-project': project,
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }

  const outputPath = join(repoRoot, file.path);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, Buffer.from((await response.json()).audioContent, 'base64'));
  console.log(`wrote ${file.path}`);
}

function en(text, filename) {
  return {
    path: `src/assets/lessons/morning-routine/bedroom/audio/en/${filename}`,
    text,
    voice: voices.en,
  };
}

function vi(text, filename) {
  return {
    path: `src/assets/lessons/morning-routine/bedroom/audio/vi/${filename}`,
    text,
    voice: voices.vi,
  };
}
