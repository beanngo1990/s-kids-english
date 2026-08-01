import {
  copyFileSync,
  existsSync,
  mkdirSync,
} from 'node:fs';
import { basename, dirname, join } from 'node:path';

import sharp from 'sharp';

import { loadLessons } from './catalog.mjs';
import { repoRoot, toMasterPath } from './config.mjs';

const themeId = 'co-the-cam-xuc-va-tu-cham-soc';
const force = process.argv.includes('--force');
const lessonFilter = getArgValue('--lesson');
const approvedBabyMaster = join(
  repoRoot,
  'src/assets/source/master/lessons/supermarket-trip/shopping-list/images/baby.png',
);

const lessonPalettes = {
  'my-body': ['#FFF4E8', '#F7C7A8', '#5AA7D8'],
  'five-senses': ['#EFFAF2', '#91D5A8', '#F0B84F'],
  'my-feelings': ['#FFF0F4', '#F39AB4', '#6FAAD8'],
  'calm-myself': ['#EDF9F8', '#72CFC5', '#7C9FD8'],
  'personal-care': ['#F2FAFF', '#80CDE1', '#F08E77'],
  'dress-myself': ['#FFF7EA', '#F4B967', '#6AAFD8'],
  'toilet-routine': ['#F0F8FF', '#77B8DF', '#65C5B4'],
  'speaking-up': ['#FFF8E8', '#F1C453', '#E98272'],
};

const sceneIconSpecs = [
  ['headFace', 'head-and-face.png', 'HF', '#F39A79'],
  ['armsHands', 'arms-and-hands.png', 'AH', '#65B6D8'],
  ['legsFeet', 'legs-and-feet.png', 'LF', '#78C49A'],
  ['seeingWorld', 'seeing-world.png', 'SE', '#F0BE50'],
  ['hearingWorld', 'hearing-world.png', 'HE', '#6CB6D8'],
  ['smellTasteTouch', 'smell-taste-touch.png', 'ST', '#7BC49B'],
  ['happySad', 'happy-and-sad.png', 'HS', '#F3A3B8'],
  ['angryScared', 'angry-and-scared.png', 'AS', '#EE8A78'],
  ['excitedProud', 'excited-and-proud.png', 'EP', '#F0BE50'],
  ['bodySignals', 'body-signals.png', 'BS', '#E77D76'],
  ['slowBreathing', 'slow-breathing.png', 'BR', '#67C8BE'],
  ['comfortCorner', 'comfort-corner.png', 'CC', '#829FD7'],
  ['faceHairCare', 'face-and-hair-care.png', 'FC', '#74C4DD'],
  ['coughSneezeCare', 'cough-and-sneeze-care.png', 'CS', '#78C49A'],
  ['careItems', 'care-items.png', 'CI', '#EE987C'],
  ['chooseClothes', 'choose-clothes.png', 'CH', '#F0B25B'],
  ['putOnClothes', 'put-on-clothes.png', 'PO', '#6AAFD8'],
  ['fastenersShoes', 'fasteners-and-shoes.png', 'FS', '#E98272'],
  ['toiletSignals', 'toilet-signals.png', 'TS', '#6BAED6'],
  ['toiletSteps', 'toilet-steps.png', 'TP', '#66C4B3'],
  ['cleanPrivate', 'clean-and-private.png', 'CP', '#83A4D8'],
  ['bodyNeeds', 'body-needs.png', 'BN', '#F0BD50'],
  ['painHelp', 'pain-and-help.png', 'PH', '#E98272'],
  ['bodyBoundaries', 'body-boundaries.png', 'BB', '#65BFAF'],
];

const milestoneIconSpecs = [
  ['milestoneMyBody', 'milestone-my-body.png', 'MB', '#F39A79'],
  ['milestoneFiveSenses', 'milestone-five-senses.png', '5S', '#78C49A'],
  ['milestoneMyFeelings', 'milestone-my-feelings.png', 'MF', '#F3A3B8'],
  ['milestoneCalmMyself', 'milestone-calm-myself.png', 'CM', '#67C8BE'],
  ['milestonePersonalCare', 'milestone-personal-care.png', 'PC', '#74C4DD'],
  ['milestoneDressMyself', 'milestone-dress-myself.png', 'DM', '#F0B25B'],
  ['milestoneToiletRoutine', 'milestone-toilet-routine.png', 'TR', '#6BAED6'],
  ['milestoneSpeakingUp', 'milestone-speaking-up.png', 'SU', '#F0BD50'],
];

const lessons = loadLessons().filter(
  lesson =>
    lesson.themeId === themeId &&
    (!lessonFilter || lesson.id === lessonFilter),
);

if (lessons.length === 0) {
  throw new Error(
    lessonFilter
      ? `Theme 3 lesson not found: ${lessonFilter}`
      : 'No Theme 3 lessons found in the catalog.',
  );
}

let created = 0;
let skipped = 0;

for (const lesson of lessons) {
  const palette = lessonPalettes[lesson.id] ?? lessonPalettes['my-body'];

  for (const scene of lesson.scenes) {
    await writeMaster(
      scene.background.source,
      makeBackgroundSvg(palette, lesson.id),
      false,
    );

    if (scene.character?.asset.source) {
      const target = toMasterPath(scene.character.asset.source);
      mkdirSync(dirname(target), { recursive: true });
      if (!existsSync(target) || force) {
        copyFileSync(approvedBabyMaster, target);
        created += 1;
      } else {
        skipped += 1;
      }
    }

    const vocabularyById = new Map(
      (scene.vocabulary ?? []).map(item => [item.id, item]),
    );

    for (const object of scene.objects ?? []) {
      const vocabulary = object.vocabId
        ? vocabularyById.get(object.vocabId)
        : undefined;
      const label = vocabulary?.word ?? assetLabel(object.asset.source);
      const kind = getVisualKind(lesson.id, scene.id, label, vocabulary?.type);
      await writeMaster(
        object.asset.source,
        makeObjectSvg({
          accent: palette[1],
          isCard: vocabulary?.type === 'phrase',
          kind,
          label,
          secondary: palette[2],
        }),
        true,
      );
    }
  }
}

if (!lessonFilter) {
  await generateMapIcons([...sceneIconSpecs, ...milestoneIconSpecs]);
}

console.log(`Theme 3 demo master PNGs created: ${created}`);
console.log(`Skipped existing master PNGs       : ${skipped}`);
console.log(`Theme 3 lessons processed          : ${lessons.length}`);

async function writeMaster(source, svgSource, transparent) {
  const target = toMasterPath(source);
  if (existsSync(target) && !force) {
    skipped += 1;
    return;
  }

  mkdirSync(dirname(target), { recursive: true });
  let image = sharp(Buffer.from(svgSource));
  if (!transparent) {
    image = image.flatten({ background: '#FFFFFF' }).removeAlpha();
  }
  await image.png().toFile(target);
  created += 1;
}

async function generateMapIcons(specs) {
  const iconDir = join(repoRoot, 'src/assets/icons/skids');
  mkdirSync(iconDir, { recursive: true });

  for (const [name, fileName, , accent] of specs) {
    const target = join(iconDir, fileName);
    if (existsSync(target) && !force) {
      skipped += 1;
      continue;
    }
    await sharp(Buffer.from(makeMapIconSvg(name, accent)))
      .png()
      .toFile(target);
    created += 1;
  }
}

function makeBackgroundSvg([base, accent, secondary], lessonId) {
  const roomDetail = getRoomDetail(lessonId, accent, secondary);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="941" height="1672" viewBox="0 0 941 1672">
    <rect width="941" height="1672" fill="${base}"/>
    <rect width="941" height="112" fill="${accent}" opacity="0.18"/>
    <path d="M0 1110H941V1672H0Z" fill="#FFFDF8" opacity="0.62"/>
    <path d="M0 1110H941" stroke="${accent}" stroke-width="7" opacity="0.14"/>
    <path d="M80 1435H861" stroke="${secondary}" stroke-width="7" stroke-linecap="round" opacity="0.08"/>
    ${roomDetail}
  </svg>`;
}

function makeObjectSvg({ accent, isCard, kind, label, secondary }) {
  const lines = wrapLabel(label);
  const fontSize = getLabelFontSize(lines);
  const firstY = 730 - (lines.length - 1) * (fontSize * 0.56);
  const text = lines
    .map(
      (line, index) =>
        `<tspan x="512" y="${firstY + index * fontSize * 1.08}">${escapeXml(line)}</tspan>`,
    )
    .join('');

  const frame = isCard
    ? `<rect x="70" y="58" width="884" height="884" rx="72" fill="#FFFFFF" stroke="${accent}" stroke-width="18" filter="url(#shadow)"/>
      <circle cx="512" cy="360" r="230" fill="${accent}" opacity="0.17"/>`
    : `<circle cx="512" cy="380" r="250" fill="#FFFFFF" opacity="0.72"/>
      <circle cx="512" cy="380" r="228" fill="${accent}" opacity="0.13"/>
      <rect x="145" y="635" width="734" height="235" rx="76" fill="#FFFFFF" opacity="0.94" filter="url(#shadow)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#334155" flood-opacity="0.16"/>
      </filter>
    </defs>
    ${frame}
    ${makeMotif(kind, accent, secondary, label)}
    <text text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#334155">${text}</text>
  </svg>`;
}

function getRoomDetail(lessonId, accent, secondary) {
  if (lessonId === 'personal-care' || lessonId === 'toilet-routine') {
    return `<path d="M95 430H846" stroke="${secondary}" stroke-width="12" stroke-linecap="round" opacity="0.08"/>
      <rect x="104" y="448" width="733" height="54" rx="27" fill="${accent}" opacity="0.07"/>`;
  }
  if (lessonId === 'dress-myself') {
    return `<path d="M118 245H823" stroke="${secondary}" stroke-width="12" stroke-linecap="round" opacity="0.08"/>
      <path d="M180 245V460M761 245V460" stroke="${secondary}" stroke-width="10" stroke-linecap="round" opacity="0.07"/>`;
  }
  if (lessonId === 'calm-myself') {
    return `<path d="M115 980Q470 850 826 980" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round" opacity="0.07"/>`;
  }
  return '';
}

function makeMotif(kind, accent, secondary, label = '') {
  if (kind === 'face') {
    return makeFaceMotif(label, accent, secondary);
  }
  if (kind === 'body') {
    return makeBodyMotif(label, accent, secondary);
  }
  if (kind === 'sense') {
    return `<path d="M310 350Q512 170 714 350Q512 530 310 350Z" fill="#FFFFFF" stroke="${secondary}" stroke-width="20"/>
      <circle cx="512" cy="350" r="82" fill="${accent}"/><circle cx="512" cy="350" r="34" fill="#334155"/>
      <path d="M720 285Q790 350 720 415M770 245Q885 350 770 455" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round"/>`;
  }
  if (kind === 'clothes') {
    return `<path d="M360 245L440 200Q512 250 584 200L664 245L742 390L630 445L600 370V610H424V370L394 445L282 390Z" fill="${accent}" stroke="${secondary}" stroke-width="18" stroke-linejoin="round"/>`;
  }
  if (kind === 'care') {
    return `<path d="M512 180C430 300 355 385 355 485C355 580 425 640 512 640C599 640 669 580 669 485C669 385 594 300 512 180Z" fill="${accent}" stroke="${secondary}" stroke-width="18"/>
      <path d="M430 485L490 540L606 405" fill="none" stroke="#FFFFFF" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (kind === 'toilet') {
    return `<rect x="350" y="210" width="324" height="230" rx="38" fill="#FFFFFF" stroke="${secondary}" stroke-width="20"/>
      <path d="M335 430H690Q680 610 512 635Q344 610 335 430Z" fill="${accent}" opacity="0.72" stroke="${secondary}" stroke-width="20"/>
      <rect x="430" y="625" width="164" height="38" rx="18" fill="${secondary}"/>`;
  }
  if (kind === 'speech') {
    return `<path d="M290 225H734Q784 225 784 275V500Q784 550 734 550H535L400 650V550H290Q240 550 240 500V275Q240 225 290 225Z" fill="#FFFFFF" stroke="${secondary}" stroke-width="20" stroke-linejoin="round"/>
      <path d="M330 325H690M330 410H620" stroke="${accent}" stroke-width="30" stroke-linecap="round"/>`;
  }
  return `<circle cx="512" cy="360" r="165" fill="${accent}" stroke="${secondary}" stroke-width="20"/>
    <path d="M512 245L548 320L630 332L570 390L585 472L512 432L439 472L454 390L394 332L476 320Z" fill="#FFFFFF" opacity="0.9"/>`;
}

function makeBodyMotif(label, accent, secondary) {
  const normalized = label.toLowerCase();

  if (/\beyes?\b/u.test(normalized)) {
    return `<path d="M300 350Q390 255 480 350Q390 445 300 350Z" fill="#FFFFFF" stroke="${secondary}" stroke-width="18"/>
      <path d="M544 350Q634 255 724 350Q634 445 544 350Z" fill="#FFFFFF" stroke="${secondary}" stroke-width="18"/>
      <circle cx="390" cy="350" r="38" fill="${accent}"/><circle cx="634" cy="350" r="38" fill="${accent}"/>
      <circle cx="390" cy="350" r="18" fill="#334155"/><circle cx="634" cy="350" r="18" fill="#334155"/>`;
  }
  if (/\bmouth\b/u.test(normalized)) {
    return `<path d="M320 335Q512 245 704 335Q666 540 512 558Q358 540 320 335Z" fill="#F58A87" stroke="${secondary}" stroke-width="20"/>
      <path d="M360 350Q512 410 664 350" fill="none" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round"/>`;
  }
  if (/\bhair\b/u.test(normalized)) {
    return `<circle cx="512" cy="400" r="190" fill="#F5BE98" stroke="${secondary}" stroke-width="18"/>
      <path d="M332 390Q320 175 512 180Q704 175 692 390Q635 315 575 300Q500 340 418 285Q372 325 332 390Z" fill="#5B3829"/>
      <path d="M378 267Q438 190 512 210M512 210Q600 180 654 270" fill="none" stroke="#7A4A31" stroke-width="24" stroke-linecap="round"/>`;
  }
  if (/\bears?\b/u.test(normalized)) {
    return `<path d="M368 230Q245 245 260 390Q275 520 390 530Q445 475 408 405Q360 350 368 230Z" fill="#F5BE98" stroke="${secondary}" stroke-width="20"/>
      <path d="M656 230Q779 245 764 390Q749 520 634 530Q579 475 616 405Q664 350 656 230Z" fill="#F5BE98" stroke="${secondary}" stroke-width="20"/>
      <path d="M337 315Q300 350 335 425M687 315Q724 350 689 425" fill="none" stroke="#D98B73" stroke-width="18" stroke-linecap="round"/>`;
  }
  if (/\bnose\b/u.test(normalized)) {
    return `<path d="M512 195Q455 345 430 470Q512 530 594 470" fill="#F5BE98" stroke="${secondary}" stroke-width="20" stroke-linejoin="round"/>
      <path d="M448 480Q480 515 512 485Q544 515 576 480" fill="none" stroke="#D98B73" stroke-width="18" stroke-linecap="round"/>`;
  }
  if (/\bhead\b/u.test(normalized)) {
    return `<circle cx="512" cy="375" r="210" fill="#F5BE98" stroke="${secondary}" stroke-width="20"/>
      <path d="M325 345Q330 160 512 165Q694 160 699 345Q624 260 545 268Q470 305 390 250Q342 290 325 345Z" fill="#5B3829"/>
      <circle cx="438" cy="390" r="18" fill="#334155"/><circle cx="586" cy="390" r="18" fill="#334155"/>
      <path d="M445 475Q512 530 579 475" fill="none" stroke="#D76358" stroke-width="20" stroke-linecap="round"/>`;
  }
  if (/\b(?:hand|hands|finger|fingers|thumb|clap)\b/u.test(normalized)) {
    const thumb = /\bthumb\b/u.test(normalized)
      ? `<path d="M402 390Q300 335 280 420Q300 500 410 500" fill="#F5BE98" stroke="${secondary}" stroke-width="20" stroke-linejoin="round"/>`
      : '';
    return `${thumb}<rect x="385" y="350" width="255" height="265" rx="105" fill="#F5BE98" stroke="${secondary}" stroke-width="20"/>
      <path d="M405 370V220M465 360V180M525 360V170M585 370V220" fill="none" stroke="#F5BE98" stroke-width="54" stroke-linecap="round"/>
      <path d="M405 370V220M465 360V180M525 360V170M585 370V220" fill="none" stroke="${secondary}" stroke-width="10" stroke-linecap="round" opacity="0.65"/>`;
  }
  if (/\b(?:arm|arms|elbow|wrist)\b/u.test(normalized)) {
    return `<path d="M320 240V430Q320 520 410 520H610Q700 520 700 430V300" fill="none" stroke="${secondary}" stroke-width="94" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M320 240V430Q320 520 410 520H610Q700 520 700 430V300" fill="none" stroke="#F5BE98" stroke-width="64" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="410" cy="520" r="32" fill="${accent}" opacity="0.9"/>`;
  }
  if (/\b(?:foot|feet|toes?|heel|tiptoes?|stomp)\b/u.test(normalized)) {
    return `<path d="M355 205Q470 180 535 280L575 390Q600 450 725 480Q785 495 770 560Q750 635 635 625L390 610Q285 600 275 520Q270 455 350 420Z" fill="#F5BE98" stroke="${secondary}" stroke-width="20" stroke-linejoin="round"/>
      <circle cx="690" cy="500" r="24" fill="${accent}"/><circle cx="642" cy="478" r="20" fill="${accent}"/><circle cx="598" cy="460" r="17" fill="${accent}"/>`;
  }
  if (/\b(?:leg|legs|knee|ankle)\b/u.test(normalized)) {
    return `<path d="M405 175V410Q405 475 460 515L555 585" fill="none" stroke="${secondary}" stroke-width="116" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M405 175V410Q405 475 460 515L555 585" fill="none" stroke="#F5BE98" stroke-width="84" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="425" cy="435" r="39" fill="${accent}" opacity="0.9"/>`;
  }

  return `<circle cx="512" cy="235" r="76" fill="#F5BE98" stroke="${secondary}" stroke-width="16"/>
    <path d="M512 320V530M512 370L370 455M512 370L654 455M512 530L420 630M512 530L604 630" fill="none" stroke="${accent}" stroke-width="46" stroke-linecap="round"/>
    <circle cx="512" cy="420" r="28" fill="${secondary}"/>`;
}

function makeFaceMotif(label, accent, secondary) {
  const normalized = label.toLowerCase();
  const isAngry = /angry|upset/u.test(normalized);
  const isSad = /sad|disappointed|frown|tears/u.test(normalized);
  const isScared = /scared|worried/u.test(normalized);
  const isSurprised = /surprised|dizzy/u.test(normalized);
  const isTired = /tired|shy/u.test(normalized);
  const eyes = isTired
    ? `<path d="M425 330Q455 350 485 330M539 330Q569 350 599 330" fill="none" stroke="#334155" stroke-width="18" stroke-linecap="round"/>`
    : isSurprised
      ? `<circle cx="455" cy="325" r="30" fill="#FFFFFF" stroke="#334155" stroke-width="14"/><circle cx="569" cy="325" r="30" fill="#FFFFFF" stroke="#334155" stroke-width="14"/>`
      : `<circle cx="455" cy="325" r="18" fill="#334155"/><circle cx="569" cy="325" r="18" fill="#334155"/>`;
  const brows = isAngry
    ? `<path d="M405 270L482 300M619 270L542 300" stroke="#5B3829" stroke-width="20" stroke-linecap="round"/>`
    : isScared
      ? `<path d="M408 282Q450 245 487 280M616 282Q574 245 537 280" fill="none" stroke="#5B3829" stroke-width="18" stroke-linecap="round"/>`
      : '';
  const mouth = isSad || isAngry
    ? `<path d="M440 450Q512 385 584 450" fill="none" stroke="#D76358" stroke-width="20" stroke-linecap="round"/>`
    : isScared || isSurprised
      ? `<ellipse cx="512" cy="430" rx="38" ry="52" fill="#D76358"/>`
      : /laugh/u.test(normalized)
        ? `<path d="M420 395Q512 510 604 395Q590 545 512 550Q434 545 420 395Z" fill="#D76358"/>`
        : `<path d="M440 402Q512 470 584 402" fill="none" stroke="#D76358" stroke-width="20" stroke-linecap="round"/>`;
  const tears = /tears|sad/u.test(normalized)
    ? `<path d="M425 360Q390 415 425 450Q460 415 425 360Z" fill="${accent}" opacity="0.8"/>`
    : '';

  return `<circle cx="512" cy="350" r="150" fill="#FFD76B" stroke="${secondary}" stroke-width="18"/>
    ${eyes}${brows}${mouth}${tears}`;
}

function makeMapIconSvg(name, accent) {
  const kind = getIconKind(name);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1024 1024">
    <defs><filter id="s"><feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#334155" flood-opacity="0.2"/></filter></defs>
    <circle cx="512" cy="500" r="404" fill="#FFFDF8" stroke="${accent}" stroke-width="48" filter="url(#s)"/>
    <circle cx="512" cy="420" r="270" fill="${accent}" opacity="0.12"/>
    ${makeMotif(kind, accent, '#5AA7D8')}
  </svg>`;
}

function getIconKind(name) {
  const normalized = name.toLowerCase();
  if (/body|head|arms|legs/u.test(normalized)) return 'body';
  if (/sense|seeing|hearing|smell/u.test(normalized)) return 'sense';
  if (/feeling|happy|angry|excited|comfort|calm/u.test(normalized)) return 'face';
  if (/dress|clothes|fastener/u.test(normalized)) return 'clothes';
  if (/toilet|cleanprivate/u.test(normalized)) return 'toilet';
  if (/speaking|needs|pain|boundar/u.test(normalized)) return 'speech';
  return 'care';
}

function getVisualKind(lessonId, sceneId, label, type) {
  const text = `${sceneId} ${label}`.toLowerCase();
  if (lessonId === 'my-body' || /head|hand|arm|leg|foot|knee|nose|mouth|ear|eye/u.test(text)) {
    return 'body';
  }
  if (lessonId === 'five-senses') return 'sense';
  if (lessonId === 'my-feelings' || type === 'adjective') return 'face';
  if (lessonId === 'dress-myself') return 'clothes';
  if (lessonId === 'personal-care') return 'care';
  if (lessonId === 'toilet-routine') return 'toilet';
  if (lessonId === 'speaking-up' || type === 'phrase') return 'speech';
  return 'star';
}

function wrapLabel(label) {
  const words = label.trim().split(/\s+/u);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= 17 || current.length === 0) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= 3) return lines;
  return [lines[0], lines[1], `${lines.slice(2).join(' ')}`];
}

function getLabelFontSize(lines) {
  const longest = Math.max(...lines.map(line => line.length));
  if (longest > 20) return 52;
  if (longest > 15) return 60;
  return 72;
}

function assetLabel(source) {
  return basename(source, '.webp').replaceAll('-', ' ');
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function getArgValue(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}
