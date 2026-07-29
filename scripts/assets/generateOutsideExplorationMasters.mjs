import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';

import sharp from 'sharp';

import { collectImageUsages } from './catalog.mjs';
import { toMasterPath } from './config.mjs';

const outsideLessonIds = new Set([
  'supermarket-trip',
  'park-visit',
  'beach-day',
  'animal-trip',
  'library-visit',
  'doctor-visit',
  'birthday-party',
  'grandparents-visit',
]);

const force = process.argv.includes('--force');
const lessonFilter = getArgValue('--lesson');

const usages = collectImageUsages().filter(usage => {
  const isOutsideLesson = usage.lessonIds.some(lessonId =>
    outsideLessonIds.has(lessonId),
  );

  return (
    isOutsideLesson &&
    (!lessonFilter || usage.lessonIds.includes(lessonFilter))
  );
});

let created = 0;
let skipped = 0;

for (const usage of usages) {
  const masterPath = toMasterPath(usage.source);
  if (existsSync(masterPath) && !force) {
    skipped += 1;
    continue;
  }

  const asset = parseAssetSource(usage.source);
  mkdirSync(dirname(masterPath), { recursive: true });

  const svg = usage.roles.includes('background')
    ? makeBackgroundSvg(asset)
    : asset.assetName === 'baby' || usage.roles.includes('character')
      ? makeBabySvg(asset)
      : makeObjectSvg(asset);

  await renderSvgToPng(svg, masterPath, usage.roles.includes('background'));
  created += 1;
}

console.log(`Outside exploration master PNGs created: ${created}`);
console.log(`Skipped existing master PNGs          : ${skipped}`);
console.log(`Referenced outside images             : ${usages.length}`);

function parseAssetSource(source) {
  const parts = source.split('/');
  const lessonId = parts[1] ?? '';
  const sceneId = parts[2] ?? '';
  const assetName = basename(parts.at(-1) ?? '', '.webp');

  return { assetName, lessonId, sceneId };
}

async function renderSvgToPng(svgSource, outputPath, isBackground) {
  const image = sharp(Buffer.from(svgSource)).png();

  if (isBackground) {
    await image
      .flatten({ background: '#ffffff' })
      .removeAlpha()
      .png()
      .toFile(outputPath);
    return;
  }

  await image
    .trim({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      threshold: 1,
    })
    .extend({
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      bottom: 48,
      left: 48,
      right: 48,
      top: 48,
    })
    .png()
    .toFile(outputPath);
}

function makeBackgroundSvg(asset) {
  const palette = getScenePalette(asset.sceneId);
  const decor = getSceneDecor(asset);

  return svg(941, 1672, [
    defs(),
    rect(0, 0, 941, 1672, {
      fill: palette.wall,
    }),
    path('M0 0H941V330H0Z', { fill: palette.top }),
    path('M0 1080H941V1672H0Z', { fill: palette.floor }),
    path('M0 1080H941', {
      fill: 'none',
      stroke: palette.trim,
      'stroke-width': 16,
    }),
    path('M0 330C180 380 250 340 420 390C610 445 730 360 941 420V1088H0Z', {
      fill: palette.mid,
      opacity: 0.55,
    }),
    decor,
    softLight(120, 80, 620, 1120, 0.24),
    floorLines(palette.floorLine),
  ]);
}

function getScenePalette(sceneId) {
  if (sceneId.includes('beach') || sceneId.includes('sand') || sceneId.includes('sea')) {
    return {
      floor: '#F8DFA7',
      floorLine: '#E8BE78',
      mid: '#89D7F7',
      top: '#BEEBFF',
      trim: '#FFF2CA',
      wall: '#DDF7FF',
    };
  }

  if (
    sceneId.includes('park') ||
    sceneId.includes('garden') ||
    sceneId.includes('farm') ||
    sceneId.includes('zoo') ||
    sceneId.includes('animal')
  ) {
    return {
      floor: '#BEE6A6',
      floorLine: '#91C77C',
      mid: '#C9F0B5',
      top: '#BFEFFF',
      trim: '#EFFFF0',
      wall: '#DDF8F2',
    };
  }

  if (sceneId.includes('library') || sceneId.includes('book') || sceneId.includes('story')) {
    return {
      floor: '#F2C98C',
      floorLine: '#DFAE70',
      mid: '#F6E2B2',
      top: '#D9C7FF',
      trim: '#FFF1C8',
      wall: '#EFE3FF',
    };
  }

  if (sceneId.includes('clinic') || sceneId.includes('health') || sceneId.includes('medicine')) {
    return {
      floor: '#D6F1F3',
      floorLine: '#A9D7DB',
      mid: '#DDF8FF',
      top: '#BFEFFF',
      trim: '#FFFFFF',
      wall: '#F4FEFF',
    };
  }

  if (sceneId.includes('party') || sceneId.includes('birthday')) {
    return {
      floor: '#FEE6A6',
      floorLine: '#EBC574',
      mid: '#FFD5E4',
      top: '#FFE8F0',
      trim: '#FFF3C8',
      wall: '#FFF2F7',
    };
  }

  if (
    sceneId.includes('grandparents') ||
    sceneId.includes('family') ||
    sceneId.includes('goodbye')
  ) {
    return {
      floor: '#EFD19A',
      floorLine: '#D8AC72',
      mid: '#FFE8C8',
      top: '#D5F3FF',
      trim: '#FFF0C6',
      wall: '#FFF7E8',
    };
  }

  return {
    floor: '#E9D7B5',
    floorLine: '#D0B083',
    mid: '#DDF6F2',
    top: '#DDF7FF',
    trim: '#FFF1C8',
    wall: '#F5FAF8',
  };
}

function getSceneDecor(asset) {
  const scene = asset.sceneId;
  if (scene.includes('shopping-list')) {
    return [
      shelf(68, 360, '#F7D084'),
      shelf(546, 390, '#BDEAD6'),
      cartShape(330, 960, 1.35),
    ].join('');
  }

  if (scene.includes('fresh-foods')) {
    return [
      produceStand(80, 580),
      produceStand(500, 610),
      crate(240, 1040, '#F4B76A'),
      crate(520, 1040, '#8CD17D'),
    ].join('');
  }

  if (scene.includes('checkout')) {
    return [
      rect(80, 700, 760, 230, { fill: '#97D9E8', rx: 42, filter: 'url(#softShadow)' }),
      rect(120, 650, 680, 78, { fill: '#FFF8E8', rx: 30 }),
      screenShape(600, 430, 1.2),
      bagShape(220, 1000, 1.3),
    ].join('');
  }

  if (scene.includes('park') || scene.includes('garden')) {
    return [
      treeShape(95, 430, 1.35),
      treeShape(680, 480, 1.05),
      path('M415 910C305 1110 410 1360 330 1672H611C520 1350 650 1125 536 910Z', {
        fill: '#F6D899',
        opacity: 0.95,
      }),
      flowerPatch(70, 1200),
      flowerPatch(670, 1240),
    ].join('');
  }

  if (scene.includes('beach') || scene.includes('sand') || scene.includes('sea')) {
    return [
      path('M0 690C170 640 315 680 471 640C650 595 780 650 941 610V1040C755 1090 620 1030 470 1082C285 1148 130 1085 0 1130Z', {
        fill: '#69CFF2',
      }),
      path('M0 850C170 810 315 860 471 820C650 775 780 830 941 790', {
        fill: 'none',
        stroke: '#FFFFFF',
        'stroke-width': 20,
        opacity: 0.75,
      }),
      sunShape(730, 190, 1.3),
      umbrellaShape(170, 930, 1.2),
      sandcastleShape(620, 1120, 1.2),
    ].join('');
  }

  if (scene.includes('animal') || scene.includes('farm') || scene.includes('zoo')) {
    return [
      fence(0, 760),
      treeShape(70, 430, 1.2),
      treeShape(690, 420, 1.15),
      pondShape(520, 1050, 1),
      animalSilhouette('giraffe', 230, 690, 0.75),
    ].join('');
  }

  if (scene.includes('library') || scene.includes('book') || scene.includes('story')) {
    return [
      bookShelf(70, 350, 1.25),
      bookShelf(560, 380, 1.0),
      rugShape(230, 1050, 1.35),
      bookShape(330, 770, 1.3),
    ].join('');
  }

  if (scene.includes('clinic') || scene.includes('health') || scene.includes('medicine')) {
    return [
      rect(120, 500, 700, 600, { fill: '#FFFFFF', rx: 55, filter: 'url(#softShadow)' }),
      path('M448 610H493V700H585V745H493V838H448V745H356V700H448Z', {
        fill: '#FF7B8A',
      }),
      screenShape(620, 920, 1.0),
      plantShape(110, 1000, 1.2),
    ].join('');
  }

  if (scene.includes('party')) {
    return [
      bunting(80, 340),
      balloonCluster(120, 520, 1.1),
      balloonCluster(700, 490, 1.0),
      tableShape(170, 1040, 1.3),
      cakeShape(390, 860, 1.25),
    ].join('');
  }

  if (scene.includes('family') || scene.includes('goodbye')) {
    return [
      windowShape(610, 320, 1.05),
      sofaShape(120, 790, 1.2),
      plantShape(700, 930, 1.2),
      photoFrameShape(160, 390, 1.1),
    ].join('');
  }

  return [windowShape(520, 320, 1.1), plantShape(120, 990, 1.1)].join('');
}

function makeBabySvg() {
  return svg(1024, 1536, [
    defs(),
    ellipse(514, 1430, 300, 55, { fill: '#000000', opacity: 0.16 }),
    circle(512, 350, 170, { fill: '#F8C6A6', filter: 'url(#softShadow)' }),
    path('M355 306C410 170 605 170 670 300C605 250 480 270 355 306Z', {
      fill: '#6C4C3A',
    }),
    circle(450, 360, 16, { fill: '#4A3529' }),
    circle(574, 360, 16, { fill: '#4A3529' }),
    path('M462 430C500 462 546 462 582 430', {
      fill: 'none',
      stroke: '#A45E52',
      'stroke-linecap': 'round',
      'stroke-width': 12,
    }),
    path('M350 585C350 475 674 475 674 585V950C674 1088 350 1088 350 950Z', {
      fill: '#FF9DB7',
      filter: 'url(#softShadow)',
    }),
    path('M358 620C290 690 260 820 235 945', {
      fill: 'none',
      stroke: '#F8C6A6',
      'stroke-linecap': 'round',
      'stroke-width': 74,
    }),
    path('M666 620C734 690 764 820 789 945', {
      fill: 'none',
      stroke: '#F8C6A6',
      'stroke-linecap': 'round',
      'stroke-width': 74,
    }),
    path('M390 1010L330 1370', {
      fill: 'none',
      stroke: '#6AAFE6',
      'stroke-linecap': 'round',
      'stroke-width': 92,
    }),
    path('M634 1010L694 1370', {
      fill: 'none',
      stroke: '#6AAFE6',
      'stroke-linecap': 'round',
      'stroke-width': 92,
    }),
    ellipse(306, 1410, 94, 42, { fill: '#FFCF78' }),
    ellipse(718, 1410, 94, 42, { fill: '#FFCF78' }),
    circle(440, 565, 26, { fill: '#FFD8E3', opacity: 0.9 }),
    circle(586, 565, 26, { fill: '#FFD8E3', opacity: 0.9 }),
  ]);
}

function makeObjectSvg(asset) {
  const name = asset.assetName;
  const tokens = new Set(name.split('-'));
  const color = colorForName(name);

  if (isPerson(name)) return personSvg(name, color);
  if (isAnimal(name)) return animalSvg(name);
  if (tokens.has('cart')) return objectCanvas(cartShape(220, 245, 1.55));
  if (tokens.has('basket')) return objectCanvas(basketShape(260, 330, 1.6));
  if (tokens.has('bag')) return objectCanvas(bagShape(260, 250, 1.7));
  if (tokens.has('wallet')) return objectCanvas(walletShape(240, 370, 1.65));
  if (tokens.has('coupon')) return objectCanvas(ticketShape(260, 360, 1.5, '#FFD166'));
  if (tokens.has('ticket')) return objectCanvas(ticketShape(260, 360, 1.5, '#BDE0FE'));
  if (tokens.has('card') || tokens.has('list') || tokens.has('receipt') || tokens.has('map') || tokens.has('invitation') || tokens.has('chart') || tokens.has('sign')) {
    return objectCanvas(cardShape(250, 220, 1.6, color, name));
  }
  if (tokens.has('aisle')) return objectCanvas(supermarketAisle(130, 210, 1.2));
  if (tokens.has('shelf')) return objectCanvas(bookShelf(220, 210, 1.1));
  if (tokens.has('counter')) return objectCanvas(counterShape(180, 360, 1.55));
  if (tokens.has('scanner')) return objectCanvas(scannerShape(300, 310, 1.45));
  if (tokens.has('scale')) return objectCanvas(scaleShape(300, 260, 1.5));
  if (tokens.has('vegetables')) return objectCanvas(vegetablesShape(270, 300, 1.45));
  if (tokens.has('fruit')) return objectCanvas(fruitBowlShape(250, 300, 1.5));
  if (tokens.has('tomato')) return objectCanvas(tomatoShape(340, 350, 1.45));
  if (tokens.has('carrot')) return objectCanvas(carrotShape(380, 290, 1.35));
  if (tokens.has('grapes')) return objectCanvas(grapesShape(320, 270, 1.35));
  if (tokens.has('drink') || tokens.has('juice') || tokens.has('water')) return objectCanvas(drinkShape(350, 230, 1.45, tokens.has('water') ? '#8BDDF5' : '#FFB45C'));
  if (tokens.has('hat')) return objectCanvas(hatShape(260, 350, 1.55));
  if (tokens.has('sunglasses')) return objectCanvas(sunglassesShape(250, 390, 1.5));
  if (tokens.has('sunscreen') || tokens.has('medicine') || tokens.has('hand') || tokens.has('gel')) return objectCanvas(bottleShape(330, 210, 1.55, color));
  if (tokens.has('towel') || tokens.has('napkin') || tokens.has('ribbon') || tokens.has('blanket')) return objectCanvas(foldedClothShape(230, 320, 1.55, color));
  if (tokens.has('bucket')) return objectCanvas(bucketShape(300, 300, 1.55));
  if (tokens.has('shovel')) return objectCanvas(shovelShape(380, 220, 1.35));
  if (tokens.has('sandcastle')) return objectCanvas(sandcastleShape(250, 250, 1.4));
  if (tokens.has('shell')) return objectCanvas(shellShape(320, 330, 1.45));
  if (tokens.has('crab')) return objectCanvas(crabShape(280, 360, 1.4));
  if (tokens.has('flag')) return objectCanvas(flagShape(350, 250, 1.45));
  if (tokens.has('sea') || tokens.has('wave') || tokens.has('pond')) return objectCanvas(pondShape(240, 340, 1.5));
  if (tokens.has('shower')) return objectCanvas(showerShape(300, 250, 1.5));
  if (tokens.has('ring')) return objectCanvas(swimRingShape(260, 280, 1.45));
  if (tokens.has('bench')) return objectCanvas(benchShape(190, 390, 1.6));
  if (tokens.has('fountain')) return objectCanvas(fountainShape(260, 280, 1.45));
  if (tokens.has('gate')) return objectCanvas(gateShape(210, 250, 1.45));
  if (tokens.has('path')) return objectCanvas(pathCardShape(260, 260, 1.45));
  if (tokens.has('tree')) return objectCanvas(treeShape(300, 210, 1.35));
  if (tokens.has('frisbee')) return objectCanvas(frisbeeShape(280, 360, 1.45));
  if (tokens.has('helmet')) return objectCanvas(helmetShape(260, 310, 1.45));
  if (tokens.has('scooter')) return objectCanvas(scooterShape(200, 360, 1.4));
  if (tokens.has('frame')) return objectCanvas(climbingFrameShape(180, 250, 1.3));
  if (tokens.has('whistle')) return objectCanvas(whistleShape(300, 340, 1.45));
  if (tokens.has('team') || tokens.has('game') || tokens.has('dance') || tokens.has('clap') || tokens.has('turns')) return objectCanvas(actionCardShape(250, 270, 1.5, color));
  if (tokens.has('mat') || tokens.has('rug')) return objectCanvas(rugShape(220, 360, 1.45));
  if (tokens.has('sandwich')) return objectCanvas(sandwichShape(250, 320, 1.45));
  if (tokens.has('crumbs')) return objectCanvas(crumbsShape(340, 360, 1.45));
  if (tokens.has('trash') || tokens.has('bin')) return objectCanvas(trashBinShape(300, 310, 1.45));
  if (tokens.has('feed') || tokens.has('bucket')) return objectCanvas(bucketShape(300, 300, 1.5));
  if (tokens.has('binoculars')) return objectCanvas(binocularsShape(250, 300, 1.45));
  if (tokens.has('habitat')) return objectCanvas(habitatShape(210, 250, 1.35));
  if (tokens.has('book') || tokens.has('page') || tokens.has('bookmark') || tokens.has('cover')) return objectCanvas(bookShape(260, 250, 1.45));
  if (tokens.has('chair')) return objectCanvas(chairShape(260, 300, 1.45));
  if (tokens.has('box')) return objectCanvas(boxShape(260, 310, 1.45, color));
  if (tokens.has('bell')) return objectCanvas(bellShape(300, 330, 1.45));
  if (tokens.has('puppet')) return objectCanvas(puppetShape(260, 300, 1.4));
  if (tokens.has('cushion')) return objectCanvas(cushionShape(260, 330, 1.45, color));
  if (tokens.has('clinic')) return objectCanvas(clinicShape(230, 250, 1.35));
  if (tokens.has('mask')) return objectCanvas(maskShape(260, 330, 1.45));
  if (tokens.has('stethoscope')) return objectCanvas(stethoscopeShape(270, 250, 1.45));
  if (tokens.has('thermometer') || tokens.has('temperature')) return objectCanvas(thermometerShape(270, 260, 1.45));
  if (tokens.has('bandage')) return objectCanvas(bandageShape(260, 350, 1.45));
  if (tokens.has('ear')) return objectCanvas(earLightShape(260, 300, 1.45));
  if (tokens.has('spoon')) return objectCanvas(spoonShape(260, 320, 1.45));
  if (tokens.has('tissue') || tokens.has('nose')) return objectCanvas(tissueShape(260, 300, 1.45));
  if (tokens.has('sticker')) return objectCanvas(stickerShape(270, 320, 1.45));
  if (tokens.has('balloon')) return objectCanvas(balloonCluster(260, 220, 1.45));
  if (tokens.has('banner')) return objectCanvas(bunting(180, 250));
  if (tokens.has('gift')) return objectCanvas(giftShape(280, 280, 1.45));
  if (tokens.has('party')) return objectCanvas(partyHatShape(310, 260, 1.45));
  if (tokens.has('beanbag')) return objectCanvas(beanbagShape(260, 330, 1.45));
  if (tokens.has('music')) return objectCanvas(musicShape(260, 270, 1.45));
  if (tokens.has('prize')) return objectCanvas(prizeShape(260, 300, 1.45));
  if (tokens.has('puzzle')) return objectCanvas(puzzleShape(270, 280, 1.45));
  if (tokens.has('cake')) return objectCanvas(cakeShape(260, 270, 1.45));
  if (tokens.has('candle')) return objectCanvas(candleShape(360, 360, 1.45));
  if (tokens.has('cup')) return objectCanvas(cupShape(290, 310, 1.45));
  if (tokens.has('plate')) return objectCanvas(plateShape(260, 260, 1.45));
  if (tokens.has('doorbell')) return objectCanvas(doorbellShape(330, 310, 1.45));
  if (tokens.has('hug') || tokens.has('hello') || tokens.has('goodbye') || tokens.has('thank')) return objectCanvas(actionCardShape(250, 270, 1.5, color));
  if (tokens.has('photo')) return objectCanvas(photoFrameShape(260, 260, 1.45));
  if (tokens.has('slippers') || tokens.has('shoes')) return objectCanvas(shoesShape(240, 310, 1.45));
  if (tokens.has('car')) return objectCanvas(carShape(200, 360, 1.45));
  if (tokens.has('flower')) return objectCanvas(flowerShape(300, 300, 1.45));
  if (tokens.has('leaf') || tokens.has('leaves')) return objectCanvas(leafShape(290, 330, 1.45));
  if (tokens.has('plant') || tokens.has('pot')) return objectCanvas(plantShape(260, 300, 1.45));
  if (tokens.has('seed')) return objectCanvas(seedShape(330, 330, 1.45));
  if (tokens.has('watering')) return objectCanvas(wateringCanShape(250, 270, 1.45));

  return objectCanvas(actionCardShape(250, 270, 1.5, color));
}

function objectCanvas(content) {
  return svg(1024, 1024, [
    defs(),
    ellipse(512, 850, 300, 58, { fill: '#000000', opacity: 0.14 }),
    content,
  ]);
}

function personSvg(name, color) {
  const hair = name.includes('grandma') ? '#F3F1EA' : name.includes('grandpa') ? '#D8D1C5' : '#5A3A2D';
  const coat = name.includes('doctor') || name.includes('nurse') ? '#FFFFFF' : color;

  return svg(1024, 1536, [
    defs(),
    ellipse(512, 1430, 285, 55, { fill: '#000000', opacity: 0.14 }),
    circle(512, 340, 155, { fill: '#F4BE9A', filter: 'url(#softShadow)' }),
    path('M370 320C410 190 605 180 660 312C580 260 480 260 370 320Z', {
      fill: hair,
    }),
    circle(462, 350, 14, { fill: '#3C2A24' }),
    circle(562, 350, 14, { fill: '#3C2A24' }),
    path('M470 415C505 445 545 445 576 415', {
      fill: 'none',
      stroke: '#9C5B50',
      'stroke-linecap': 'round',
      'stroke-width': 12,
    }),
    path('M352 565C352 470 672 470 672 565V1010C672 1130 352 1130 352 1010Z', {
      fill: coat,
      filter: 'url(#softShadow)',
    }),
    path('M390 1010L330 1370', {
      fill: 'none',
      stroke: '#567BC8',
      'stroke-linecap': 'round',
      'stroke-width': 92,
    }),
    path('M634 1010L694 1370', {
      fill: 'none',
      stroke: '#567BC8',
      'stroke-linecap': 'round',
      'stroke-width': 92,
    }),
    path('M400 590H624', {
      stroke: color,
      'stroke-linecap': 'round',
      'stroke-width': 36,
    }),
    circle(306, 1410, 42, { fill: '#3B4252' }),
    circle(718, 1410, 42, { fill: '#3B4252' }),
  ]);
}

function animalSvg(name) {
  return objectCanvas(animalSilhouette(name, 260, 250, 1.45));
}

function svg(width, height, children) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${children.join('')}</svg>`;
}

function defs() {
  return `
  <defs>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#5C4A36" flood-opacity="0.18"/>
    </filter>
    <linearGradient id="shine" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.72"/>
      <stop offset="0.42" stop-color="#FFFFFF" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>`;
}

function floorLines(color) {
  const lines = [];
  for (let y = 1140; y < 1660; y += 86) {
    lines.push(path(`M0 ${y}H941`, { stroke: color, 'stroke-width': 3, opacity: 0.35 }));
  }
  for (let x = -200; x < 1050; x += 210) {
    lines.push(path(`M${x} 1110L${x + 160} 1672`, { stroke: color, 'stroke-width': 2, opacity: 0.18 }));
  }
  return lines.join('');
}

function softLight(x, y, width, height, opacity) {
  return path(`M${x} ${y}L${x + width} ${y}L${x + width * 0.55} ${y + height}L${x - width * 0.2} ${y + height}Z`, {
    fill: '#FFFFFF',
    opacity,
  });
}

function rect(x, y, width, height, attrs = {}) {
  return tag('rect', { x, y, width, height, ...attrs });
}

function circle(cx, cy, r, attrs = {}) {
  return tag('circle', { cx, cy, r, ...attrs });
}

function ellipse(cx, cy, rx, ry, attrs = {}) {
  return tag('ellipse', { cx, cy, rx, ry, ...attrs });
}

function path(d, attrs = {}) {
  return tag('path', { d, ...attrs });
}

function tag(name, attrs) {
  const serialized = Object.entries(attrs)
    .map(([key, value]) => `${key}="${String(value)}"`)
    .join(' ');

  return `<${name} ${serialized}/>`;
}

function group(children, transform = '') {
  return `<g${transform ? ` transform="${transform}"` : ''}>${children.join('')}</g>`;
}

function colorForName(name) {
  const colors = ['#FF9DB7', '#FFD166', '#8BD3E6', '#A7E38D', '#CDB4DB', '#F4A261', '#BDE0FE'];
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  return colors[hash % colors.length];
}

function isPerson(name) {
  return ['cashier', 'doctor', 'nurse', 'grandma', 'grandpa', 'keeper', 'librarian', 'storyteller', 'lifeguard'].some(token =>
    name.includes(token),
  );
}

function isAnimal(name) {
  return ['cow', 'sheep', 'goat', 'piglet', 'duck', 'chicken', 'monkey', 'giraffe', 'zebra'].some(token =>
    name.includes(token),
  );
}

function shelf(x, y, color) {
  return group([
    rect(0, 0, 310, 430, { fill: '#FCE7B6', rx: 28, filter: 'url(#softShadow)' }),
    rect(22, 42, 266, 46, { fill: color, rx: 14 }),
    rect(22, 142, 266, 46, { fill: color, rx: 14 }),
    rect(22, 242, 266, 46, { fill: color, rx: 14 }),
    rect(22, 342, 266, 46, { fill: color, rx: 14 }),
  ], `translate(${x} ${y})`);
}

function cartShape(x, y, s = 1) {
  return group([
    path('M120 100H415L370 310H170Z', { fill: '#8BD3E6', filter: 'url(#softShadow)' }),
    path('M140 130H390M150 185H382M160 240H370', { fill: 'none', stroke: '#FFFFFF', 'stroke-width': 18, 'stroke-linecap': 'round' }),
    path('M110 95L72 55', { fill: 'none', stroke: '#546A7B', 'stroke-width': 28, 'stroke-linecap': 'round' }),
    circle(185, 360, 42, { fill: '#546A7B' }),
    circle(345, 360, 42, { fill: '#546A7B' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function basketShape(x, y, s = 1) {
  return group([
    path('M110 165H420L370 385H160Z', { fill: '#F4A261', filter: 'url(#softShadow)' }),
    path('M170 155C180 35 350 35 360 155', { fill: 'none', stroke: '#A35D2C', 'stroke-width': 26, 'stroke-linecap': 'round' }),
    path('M150 230H390M140 290H382M170 160L205 385M260 160L260 385M350 160L315 385', { fill: 'none', stroke: '#FFD7A4', 'stroke-width': 16, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function bagShape(x, y, s = 1) {
  return group([
    path('M150 190H380L420 480H110Z', { fill: '#FFD166', filter: 'url(#softShadow)' }),
    path('M185 190C192 78 338 78 345 190', { fill: 'none', stroke: '#C98B27', 'stroke-width': 24, 'stroke-linecap': 'round' }),
    path('M170 270H360', { stroke: '#FFFFFF', 'stroke-width': 28, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function walletShape(x, y, s = 1) {
  return group([
    rect(0, 40, 380, 230, { fill: '#B56576', rx: 36, filter: 'url(#softShadow)' }),
    rect(230, 100, 110, 90, { fill: '#F8E1DD', rx: 20 }),
    circle(280, 145, 12, { fill: '#B56576' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function ticketShape(x, y, s, color) {
  return group([
    path('M40 80H420V170C378 174 378 246 420 250V340H40V250C82 246 82 174 40 170Z', { fill: color, filter: 'url(#softShadow)' }),
    path('M145 130H320M145 205H320M145 280H270', { stroke: '#FFFFFF', 'stroke-width': 20, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function cardShape(x, y, s, color, name) {
  const icon = name.includes('map')
    ? path('M105 150L190 115L285 150L370 115V315L285 350L190 315L105 350Z', { fill: '#BDE0FE' })
    : name.includes('sign')
      ? path('M150 120H330V280H150Z M240 280V390', { fill: 'none', stroke: '#8C6D4D', 'stroke-width': 28, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
      : path('M145 155H340M145 220H330M145 285H275', { stroke: color, 'stroke-width': 22, 'stroke-linecap': 'round' });
  return group([
    rect(40, 40, 420, 500, { fill: '#FFFFFF', rx: 44, filter: 'url(#softShadow)' }),
    rect(78, 80, 344, 76, { fill: color, rx: 28, opacity: 0.82 }),
    icon,
  ], `translate(${x} ${y}) scale(${s})`);
}

function bookShelf(x, y, s = 1) {
  return group([
    rect(0, 0, 360, 430, { fill: '#E0A66B', rx: 28, filter: 'url(#softShadow)' }),
    ...[70, 185, 300].map(row => rect(26, row, 308, 26, { fill: '#9B6B43', rx: 8 })),
    ...Array.from({ length: 12 }, (_, i) => rect(44 + (i % 4) * 70, 45 + Math.floor(i / 4) * 112, 42, 88, { fill: ['#FF9DB7', '#8BD3E6', '#FFD166', '#A7E38D'][i % 4], rx: 8 })),
  ], `translate(${x} ${y}) scale(${s})`);
}

function supermarketAisle(x, y, s = 1) {
  const shelfColors = ['#FF9DB7', '#8BD3E6', '#FFD166'];
  const products = Array.from({ length: 18 }, (_, index) => {
    const sideOffset = index < 9 ? 0 : 430;
    const sideIndex = index % 9;
    const column = sideIndex % 3;
    const row = Math.floor(sideIndex / 3);

    return rect(
      sideOffset + 36 + column * 54,
      70 + row * 112,
      38,
      64,
      {
        fill: shelfColors[(column + row) % shelfColors.length],
        rx: 8,
      },
    );
  });

  return group([
    path('M0 0H210L255 430H0Z', {
      fill: '#E0A66B',
      filter: 'url(#softShadow)',
      'stroke-linejoin': 'round',
    }),
    path('M430 0H640V430H385Z', {
      fill: '#E0A66B',
      filter: 'url(#softShadow)',
      'stroke-linejoin': 'round',
    }),
    ...products,
    ...[145, 257, 369].flatMap(row => [
      path(`M18 ${row}H225`, {
        stroke: '#5AA8BA',
        'stroke-linecap': 'round',
        'stroke-width': 24,
      }),
      path(`M415 ${row}H622`, {
        stroke: '#5AA8BA',
        'stroke-linecap': 'round',
        'stroke-width': 24,
      }),
    ]),
    path('M210 0L255 430M430 0L385 430', {
      fill: 'none',
      stroke: '#F97068',
      'stroke-linecap': 'round',
      'stroke-width': 24,
    }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function produceStand(x, y) {
  return group([
    rect(0, 150, 340, 220, { fill: '#B9753D', rx: 28, filter: 'url(#softShadow)' }),
    path('M40 120H300L340 175H0Z', { fill: '#F4B76A' }),
    ...Array.from({ length: 12 }, (_, i) => circle(48 + (i % 6) * 46, 110 + Math.floor(i / 6) * 48, 24, { fill: ['#F94144', '#90BE6D', '#F9C74F'][i % 3] })),
  ], `translate(${x} ${y})`);
}

function crate(x, y, color) {
  return group([
    rect(0, 0, 250, 150, { fill: color, rx: 18, filter: 'url(#softShadow)' }),
    path('M30 45H220M30 95H220', { stroke: '#FFFFFF', 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.5 }),
  ], `translate(${x} ${y})`);
}

function screenShape(x, y, s = 1) {
  return group([
    rect(0, 0, 220, 160, { fill: '#334155', rx: 22, filter: 'url(#softShadow)' }),
    rect(22, 24, 176, 96, { fill: '#BFEFFF', rx: 16 }),
    rect(88, 160, 44, 90, { fill: '#7C8EA1', rx: 14 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function counterShape(x, y, s = 1) {
  return group([
    rect(0, 100, 450, 220, { fill: '#8BD3E6', rx: 36, filter: 'url(#softShadow)' }),
    rect(30, 55, 390, 70, { fill: '#FFFFFF', rx: 28 }),
    path('M70 190H380', { stroke: '#5AA8BA', 'stroke-width': 22, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function scannerShape(x, y, s = 1) {
  return group([
    rect(120, 80, 170, 290, { fill: '#5D6470', rx: 30, filter: 'url(#softShadow)' }),
    rect(148, 115, 114, 68, { fill: '#8BD3E6', rx: 12 }),
    rect(60, 345, 300, 80, { fill: '#444B55', rx: 30 }),
    path('M165 225H245M165 265H245', { stroke: '#FFFFFF', 'stroke-width': 14, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function scaleShape(x, y, s = 1) {
  return group([
    rect(50, 210, 340, 190, { fill: '#BDE0FE', rx: 42, filter: 'url(#softShadow)' }),
    circle(220, 300, 82, { fill: '#FFFFFF' }),
    path('M220 300L265 265', { stroke: '#FF7B8A', 'stroke-width': 16, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function vegetablesShape(x, y, s = 1) {
  return group([
    basketShape(0, 120, 0.8),
    circle(140, 120, 52, { fill: '#90BE6D' }),
    circle(220, 105, 48, { fill: '#43AA8B' }),
    circle(310, 128, 50, { fill: '#F94144' }),
    carrotShape(180, 155, 0.55),
  ], `translate(${x} ${y}) scale(${s})`);
}

function fruitBowlShape(x, y, s = 1) {
  return group([
    path('M60 240H410C395 360 325 420 235 420C145 420 75 360 60 240Z', { fill: '#FFD166', filter: 'url(#softShadow)' }),
    circle(145, 200, 60, { fill: '#F94144' }),
    circle(235, 175, 60, { fill: '#F9C74F' }),
    circle(325, 205, 60, { fill: '#90BE6D' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function tomatoShape(x, y, s = 1) {
  return group([
    circle(180, 190, 120, { fill: '#F94144', filter: 'url(#softShadow)' }),
    path('M180 85L150 140L180 125L210 140Z', { fill: '#43AA8B' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function carrotShape(x, y, s = 1) {
  return group([
    path('M90 75L350 165L70 355Z', { fill: '#F8961E', filter: 'url(#softShadow)' }),
    path('M96 75C80 10 155 30 135 95M128 86C150 20 215 55 155 115', { fill: 'none', stroke: '#43AA8B', 'stroke-width': 26, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function grapesShape(x, y, s = 1) {
  const grapes = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4 - row; col += 1) {
      grapes.push(circle(110 + col * 64 + row * 30, 110 + row * 58, 36, { fill: '#7B4FB3' }));
    }
  }
  return group([
    path('M180 70C195 30 245 35 260 70', { fill: 'none', stroke: '#43AA8B', 'stroke-width': 22, 'stroke-linecap': 'round' }),
    ...grapes,
  ], `translate(${x} ${y}) scale(${s})`);
}

function drinkShape(x, y, s, color) {
  return group([
    rect(70, 80, 180, 360, { fill: color, rx: 42, filter: 'url(#softShadow)' }),
    rect(105, 35, 110, 80, { fill: '#FFFFFF', rx: 24 }),
    rect(100, 200, 120, 105, { fill: '#FFFFFF', rx: 22, opacity: 0.75 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function hatShape(x, y, s = 1) {
  return group([
    ellipse(210, 320, 190, 62, { fill: '#FFD166', filter: 'url(#softShadow)' }),
    path('M100 320C120 160 300 160 320 320Z', { fill: '#FF9DB7' }),
    path('M135 270H290', { stroke: '#FFFFFF', 'stroke-width': 24, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function sunglassesShape(x, y, s = 1) {
  return group([
    path('M75 190H395', { stroke: '#334155', 'stroke-width': 24, 'stroke-linecap': 'round' }),
    rect(80, 155, 120, 100, { fill: '#334155', rx: 36, filter: 'url(#softShadow)' }),
    rect(270, 155, 120, 100, { fill: '#334155', rx: 36, filter: 'url(#softShadow)' }),
    path('M200 190C220 175 250 175 270 190', { fill: 'none', stroke: '#334155', 'stroke-width': 20, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function bottleShape(x, y, s, color) {
  return group([
    rect(80, 95, 170, 340, { fill: color, rx: 38, filter: 'url(#softShadow)' }),
    rect(115, 35, 100, 84, { fill: '#FFFFFF', rx: 20 }),
    rect(108, 220, 114, 90, { fill: '#FFFFFF', rx: 20, opacity: 0.75 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function foldedClothShape(x, y, s, color) {
  return group([
    rect(40, 90, 360, 270, { fill: color, rx: 42, filter: 'url(#softShadow)' }),
    path('M110 90V360M200 90V360M290 90V360', { stroke: '#FFFFFF', 'stroke-width': 18, opacity: 0.5 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function bucketShape(x, y, s = 1) {
  return group([
    path('M110 140H360L330 420H140Z', { fill: '#8BD3E6', filter: 'url(#softShadow)' }),
    path('M145 145C160 45 310 45 325 145', { fill: 'none', stroke: '#4F8FA4', 'stroke-width': 24, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function shovelShape(x, y, s = 1) {
  return group([
    path('M90 350L320 120', { stroke: '#C98B27', 'stroke-width': 36, 'stroke-linecap': 'round' }),
    path('M310 70L420 180L342 250L238 145Z', { fill: '#FF9DB7', filter: 'url(#softShadow)' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function sandcastleShape(x, y, s = 1) {
  return group([
    rect(70, 200, 320, 220, { fill: '#F4C777', rx: 20, filter: 'url(#softShadow)' }),
    rect(95, 105, 85, 110, { fill: '#F4C777', rx: 14 }),
    rect(255, 105, 85, 110, { fill: '#F4C777', rx: 14 }),
    path('M95 105V70H180V105M255 105V70H340V105', { fill: '#E6B75F' }),
    path('M210 420V310C210 260 250 260 250 310V420', { fill: '#C99049' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function shellShape(x, y, s = 1) {
  return group([
    path('M70 285C80 115 235 60 370 285C310 380 140 380 70 285Z', { fill: '#FFD7C2', filter: 'url(#softShadow)' }),
    path('M220 90V340M145 150L220 340M300 150L220 340', { stroke: '#F29E93', 'stroke-width': 16, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function crabShape(x, y, s = 1) {
  return group([
    ellipse(210, 230, 120, 82, { fill: '#F97068', filter: 'url(#softShadow)' }),
    circle(155, 170, 22, { fill: '#FFFFFF' }),
    circle(265, 170, 22, { fill: '#FFFFFF' }),
    path('M100 235L40 200M320 235L380 200M100 270L45 310M320 270L375 310', { stroke: '#F97068', 'stroke-width': 22, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function flagShape(x, y, s = 1) {
  return group([
    path('M120 80V420', { stroke: '#8C6D4D', 'stroke-width': 28, 'stroke-linecap': 'round' }),
    path('M135 95H360L315 205H135Z', { fill: '#FF6B6B', filter: 'url(#softShadow)' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function pondShape(x, y, s = 1) {
  return group([
    path('M80 240C120 100 320 110 390 210C460 310 300 390 170 360C75 340 40 295 80 240Z', { fill: '#75D2F4', filter: 'url(#softShadow)' }),
    path('M130 235C190 205 270 210 335 250', { fill: 'none', stroke: '#FFFFFF', 'stroke-width': 18, opacity: 0.75, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function showerShape(x, y, s = 1) {
  return group([
    path('M180 95H310C375 95 405 140 405 200', { fill: 'none', stroke: '#80B8C6', 'stroke-width': 28, 'stroke-linecap': 'round' }),
    path('M245 200H420V265H245Z', { fill: '#8BD3E6', filter: 'url(#softShadow)' }),
    ...[275, 325, 375].map(cx => path(`M${cx} 300V390`, { stroke: '#75D2F4', 'stroke-width': 16, 'stroke-linecap': 'round' })),
  ], `translate(${x} ${y}) scale(${s})`);
}

function swimRingShape(x, y, s = 1) {
  return group([
    circle(220, 220, 160, { fill: '#FF7B8A', filter: 'url(#softShadow)' }),
    circle(220, 220, 82, { fill: '#FFFFFF' }),
    path('M220 60V150M220 290V380M60 220H150M290 220H380', { stroke: '#FFFFFF', 'stroke-width': 40 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function treeShape(x, y, s = 1) {
  return group([
    path('M170 260V470', { stroke: '#9A663F', 'stroke-width': 44, 'stroke-linecap': 'round' }),
    circle(170, 180, 105, { fill: '#7FCF7B', filter: 'url(#softShadow)' }),
    circle(95, 230, 78, { fill: '#93DD86' }),
    circle(240, 235, 78, { fill: '#68BE6B' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function benchShape(x, y, s = 1) {
  return group([
    rect(40, 160, 390, 70, { fill: '#D28A4A', rx: 24, filter: 'url(#softShadow)' }),
    rect(70, 260, 330, 70, { fill: '#D28A4A', rx: 24 }),
    path('M100 330V430M360 330V430', { stroke: '#7A5237', 'stroke-width': 26, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function fountainShape(x, y, s = 1) {
  return group([
    path('M200 80C170 170 250 170 220 260', { fill: 'none', stroke: '#75D2F4', 'stroke-width': 24, 'stroke-linecap': 'round' }),
    path('M80 290H380C360 410 100 410 80 290Z', { fill: '#BDE0FE', filter: 'url(#softShadow)' }),
    rect(170, 210, 120, 90, { fill: '#DDE7F2', rx: 18 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function gateShape(x, y, s = 1) {
  return group([
    path('M80 420V125H410V420', { fill: 'none', stroke: '#C98B5C', 'stroke-width': 36, 'stroke-linecap': 'round', filter: 'url(#softShadow)' }),
    path('M130 220H360M130 310H360', { stroke: '#C98B5C', 'stroke-width': 28, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function pathCardShape(x, y, s = 1) {
  return group([
    path('M170 80C90 190 140 280 80 410H350C290 295 350 185 270 80Z', { fill: '#F2CF91', filter: 'url(#softShadow)' }),
    path('M220 95C165 195 210 285 165 410', { fill: 'none', stroke: '#D3A76A', 'stroke-width': 18, 'stroke-dasharray': '28 28' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function frisbeeShape(x, y, s = 1) {
  return group([
    ellipse(210, 220, 175, 70, { fill: '#FF7B8A', filter: 'url(#softShadow)' }),
    ellipse(210, 205, 115, 35, { fill: '#FFD166' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function helmetShape(x, y, s = 1) {
  return group([
    path('M90 260C90 110 340 105 360 260Z', { fill: '#FFD166', filter: 'url(#softShadow)' }),
    path('M110 260H390', { stroke: '#FF9DB7', 'stroke-width': 44, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function scooterShape(x, y, s = 1) {
  return group([
    path('M130 320H330M280 320L355 110', { stroke: '#6AAFE6', 'stroke-width': 30, 'stroke-linecap': 'round' }),
    path('M335 110H420', { stroke: '#6AAFE6', 'stroke-width': 28, 'stroke-linecap': 'round' }),
    circle(130, 360, 46, { fill: '#475569' }),
    circle(340, 360, 46, { fill: '#475569' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function climbingFrameShape(x, y, s = 1) {
  return group([
    path('M80 420L240 90L400 420M150 275H330M120 345H360', { fill: 'none', stroke: '#F4A261', 'stroke-width': 28, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#softShadow)' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function whistleShape(x, y, s = 1) {
  return group([
    path('M90 200H345L420 270L345 340H90Z', { fill: '#FFD166', filter: 'url(#softShadow)' }),
    circle(205, 270, 58, { fill: '#FFFFFF' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function actionCardShape(x, y, s, color) {
  return group([
    rect(40, 40, 390, 430, { fill: '#FFFFFF', rx: 44, filter: 'url(#softShadow)' }),
    circle(160, 190, 62, { fill: color }),
    path('M230 190H345M305 145L355 190L305 235', { fill: 'none', stroke: '#5B6C7D', 'stroke-width': 26, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    path('M120 310H350', { stroke: '#E6EEF5', 'stroke-width': 24, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function rugShape(x, y, s = 1) {
  return group([
    ellipse(250, 260, 220, 105, { fill: '#FFB6C8', filter: 'url(#softShadow)' }),
    ellipse(250, 260, 150, 65, { fill: '#FFD166', opacity: 0.75 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function sandwichShape(x, y, s = 1) {
  return group([
    path('M70 250L250 120L430 250Z', { fill: '#F2C078', filter: 'url(#softShadow)' }),
    path('M105 250H395L250 355Z', { fill: '#8DCB65' }),
    path('M120 275H380L250 390Z', { fill: '#FFE7B3' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function crumbsShape(x, y, s = 1) {
  return group(Array.from({ length: 12 }, (_, i) =>
    circle(80 + (i % 4) * 70, 120 + Math.floor(i / 4) * 65, 18 + (i % 3) * 6, { fill: '#D49A50', filter: 'url(#softShadow)' }),
  ), `translate(${x} ${y}) scale(${s})`);
}

function trashBinShape(x, y, s = 1) {
  return group([
    rect(95, 120, 250, 330, { fill: '#8BD3E6', rx: 34, filter: 'url(#softShadow)' }),
    rect(70, 80, 300, 70, { fill: '#5AA8BA', rx: 28 }),
    path('M150 190V390M220 190V390M290 190V390', { stroke: '#FFFFFF', 'stroke-width': 14, opacity: 0.6 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function animalSilhouette(name, x, y, s = 1) {
  const body = name.includes('zebra') ? '#FFFFFF' : name.includes('giraffe') ? '#D99A3D' : name.includes('piglet') ? '#F7A6B8' : name.includes('cow') ? '#FFFFFF' : name.includes('sheep') ? '#F4F4EE' : '#B77B48';
  const spots = name.includes('zebra')
    ? path('M105 175L355 120M120 240L365 185M140 300L360 260', { stroke: '#2D3748', 'stroke-width': 18, 'stroke-linecap': 'round' })
    : name.includes('cow') || name.includes('giraffe')
      ? [circle(170, 190, 34, { fill: '#6B4B36' }), circle(280, 230, 42, { fill: '#6B4B36' })].join('')
      : '';
  return group([
    ellipse(230, 250, 150, 90, { fill: body, filter: 'url(#softShadow)' }),
    circle(360, 205, 68, { fill: body }),
    path('M120 315V420M220 325V430M310 318V425', { stroke: '#7A5237', 'stroke-width': 28, 'stroke-linecap': 'round' }),
    spots,
    circle(382, 190, 10, { fill: '#2D3748' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function binocularsShape(x, y, s = 1) {
  return group([
    rect(70, 140, 140, 210, { fill: '#475569', rx: 50, filter: 'url(#softShadow)' }),
    rect(245, 140, 140, 210, { fill: '#475569', rx: 50, filter: 'url(#softShadow)' }),
    rect(195, 210, 65, 55, { fill: '#334155', rx: 18 }),
    circle(140, 330, 54, { fill: '#BFEFFF' }),
    circle(315, 330, 54, { fill: '#BFEFFF' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function habitatShape(x, y, s = 1) {
  return group([
    rect(60, 90, 360, 300, { fill: '#DDF8F2', rx: 34, filter: 'url(#softShadow)' }),
    treeShape(90, 95, 0.55),
    pondShape(180, 185, 0.55),
  ], `translate(${x} ${y}) scale(${s})`);
}

function bookShape(x, y, s = 1) {
  return group([
    path('M90 95H240C285 95 300 130 300 160V410C300 380 275 360 240 360H90Z', { fill: '#FF9DB7', filter: 'url(#softShadow)' }),
    path('M300 160C300 130 318 95 362 95H500V360H362C330 360 300 380 300 410Z', { fill: '#8BD3E6', filter: 'url(#softShadow)' }),
    path('M135 175H245M355 175H460M135 240H245M355 240H460', { stroke: '#FFFFFF', 'stroke-width': 18, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function chairShape(x, y, s = 1) {
  return group([
    rect(120, 100, 240, 230, { fill: '#CDB4DB', rx: 38, filter: 'url(#softShadow)' }),
    rect(80, 300, 320, 90, { fill: '#B197C6', rx: 34 }),
    path('M125 390V480M355 390V480', { stroke: '#8A6FA7', 'stroke-width': 26, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function boxShape(x, y, s, color) {
  return group([
    rect(80, 140, 330, 280, { fill: color, rx: 34, filter: 'url(#softShadow)' }),
    path('M80 230H410M245 140V420', { stroke: '#FFFFFF', 'stroke-width': 22, opacity: 0.55 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function bellShape(x, y, s = 1) {
  return group([
    path('M120 330C135 170 335 170 350 330L390 390H80Z', { fill: '#FFD166', filter: 'url(#softShadow)' }),
    circle(235, 410, 34, { fill: '#E59F2B' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function puppetShape(x, y, s = 1) {
  return group([
    circle(230, 140, 90, { fill: '#F8C6A6', filter: 'url(#softShadow)' }),
    path('M125 260C150 200 310 200 335 260V430H125Z', { fill: '#A7E38D' }),
    circle(195, 135, 10, { fill: '#3C2A24' }),
    circle(265, 135, 10, { fill: '#3C2A24' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function cushionShape(x, y, s, color) {
  return group([
    rect(70, 140, 330, 250, { fill: color, rx: 70, filter: 'url(#softShadow)' }),
    path('M120 190C190 250 280 250 350 190', { fill: 'none', stroke: '#FFFFFF', 'stroke-width': 18, opacity: 0.5 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function clinicShape(x, y, s = 1) {
  return group([
    rect(90, 130, 330, 310, { fill: '#FFFFFF', rx: 36, filter: 'url(#softShadow)' }),
    path('M230 200H280V260H340V310H280V370H230V310H170V260H230Z', { fill: '#FF7B8A' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function maskShape(x, y, s = 1) {
  return group([
    path('M90 210C170 135 320 135 400 210V320C330 395 160 395 90 320Z', { fill: '#BFEFFF', filter: 'url(#softShadow)' }),
    path('M135 240H355M135 295H355', { stroke: '#FFFFFF', 'stroke-width': 16, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function stethoscopeShape(x, y, s = 1) {
  return group([
    path('M120 95V230C120 360 340 360 340 230V95', { fill: 'none', stroke: '#475569', 'stroke-width': 30, 'stroke-linecap': 'round', filter: 'url(#softShadow)' }),
    circle(340, 405, 70, { fill: '#BDE0FE', stroke: '#475569', 'stroke-width': 24 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function thermometerShape(x, y, s = 1) {
  return group([
    path('M210 90V330', { stroke: '#FFFFFF', 'stroke-width': 86, 'stroke-linecap': 'round', filter: 'url(#softShadow)' }),
    path('M210 100V330', { stroke: '#FF7B8A', 'stroke-width': 32, 'stroke-linecap': 'round' }),
    circle(210, 380, 70, { fill: '#FF7B8A' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function bandageShape(x, y, s = 1) {
  return group([
    rect(40, 160, 400, 160, { fill: '#FFD7C2', rx: 70, filter: 'url(#softShadow)' }),
    rect(180, 180, 120, 120, { fill: '#F4B69E', rx: 30 }),
    circle(220, 220, 8, { fill: '#D98E78' }),
    circle(260, 260, 8, { fill: '#D98E78' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function earLightShape(x, y, s = 1) {
  return group([
    path('M120 230C120 115 260 90 310 185C350 260 270 315 250 390', { fill: 'none', stroke: '#F8C6A6', 'stroke-width': 70, 'stroke-linecap': 'round', filter: 'url(#softShadow)' }),
    path('M290 120L420 75', { stroke: '#FFD166', 'stroke-width': 36, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function spoonShape(x, y, s = 1) {
  return group([
    ellipse(190, 130, 68, 100, { fill: '#DDE7F2', filter: 'url(#softShadow)' }),
    path('M215 215L350 430', { stroke: '#DDE7F2', 'stroke-width': 36, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function tissueShape(x, y, s = 1) {
  return group([
    rect(90, 220, 320, 190, { fill: '#BDE0FE', rx: 34, filter: 'url(#softShadow)' }),
    path('M150 230C160 120 330 120 350 230', { fill: '#FFFFFF' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function stickerShape(x, y, s = 1) {
  return group([
    path('M120 90H390V300L290 420H120Z', { fill: '#FFD166', filter: 'url(#softShadow)' }),
    path('M290 420V300H390Z', { fill: '#F4A261' }),
    circle(220, 210, 62, { fill: '#FFFFFF', opacity: 0.8 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function balloonCluster(x, y, s = 1) {
  return group([
    ellipse(125, 150, 72, 100, { fill: '#FF7B8A', filter: 'url(#softShadow)' }),
    ellipse(225, 120, 72, 100, { fill: '#8BD3E6', filter: 'url(#softShadow)' }),
    ellipse(320, 160, 72, 100, { fill: '#FFD166', filter: 'url(#softShadow)' }),
    path('M125 250L220 430M225 220L220 430M320 260L220 430', { stroke: '#A07E5B', 'stroke-width': 10 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function bunting(x, y) {
  return group([
    path('M0 0C220 70 440 70 660 0', { fill: 'none', stroke: '#D89F42', 'stroke-width': 12 }),
    ...Array.from({ length: 7 }, (_, i) => path(`M${60 + i * 85} ${18 + (i % 2) * 18}L${100 + i * 85} ${125 + (i % 2) * 18}L${140 + i * 85} ${18 + (i % 2) * 18}Z`, { fill: ['#FF7B8A', '#FFD166', '#8BD3E6', '#A7E38D'][i % 4] })),
  ], `translate(${x} ${y})`);
}

function giftShape(x, y, s = 1) {
  return group([
    rect(90, 170, 310, 250, { fill: '#FF9DB7', rx: 28, filter: 'url(#softShadow)' }),
    path('M245 170V420M90 250H400', { stroke: '#FFD166', 'stroke-width': 36 }),
    path('M245 170C170 90 145 160 245 170C330 90 350 160 245 170Z', { fill: '#FFD166' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function partyHatShape(x, y, s = 1) {
  return group([
    path('M90 390L230 80L370 390Z', { fill: '#FFD166', filter: 'url(#softShadow)' }),
    path('M150 255H310M125 320H335', { stroke: '#FF7B8A', 'stroke-width': 28, 'stroke-linecap': 'round' }),
    circle(230, 75, 36, { fill: '#8BD3E6' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function beanbagShape(x, y, s = 1) {
  return group([
    path('M105 350C75 190 180 100 285 135C420 180 430 360 290 420C205 455 130 420 105 350Z', { fill: '#CDB4DB', filter: 'url(#softShadow)' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function musicShape(x, y, s = 1) {
  return group([
    path('M240 90V310C240 370 160 370 160 320C160 270 240 270 240 320M240 120L380 90V280C380 340 300 340 300 290C300 240 380 240 380 290', { fill: 'none', stroke: '#7B4FB3', 'stroke-width': 34, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', filter: 'url(#softShadow)' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function prizeShape(x, y, s = 1) {
  return group([
    path('M120 90H360V215C360 315 300 365 240 365C180 365 120 315 120 215Z', { fill: '#FFD166', filter: 'url(#softShadow)' }),
    path('M120 135H70C70 245 120 250 145 220M360 135H410C410 245 360 250 335 220', { fill: 'none', stroke: '#FFD166', 'stroke-width': 30, 'stroke-linecap': 'round' }),
    rect(185, 365, 110, 70, { fill: '#C98B27', rx: 16 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function puzzleShape(x, y, s = 1) {
  return group([
    rect(90, 120, 300, 300, { fill: '#8BD3E6', rx: 28, filter: 'url(#softShadow)' }),
    circle(240, 120, 38, { fill: '#FFFFFF' }),
    circle(390, 270, 38, { fill: '#FFFFFF' }),
    path('M240 120V420M90 270H390', { stroke: '#FFFFFF', 'stroke-width': 16, opacity: 0.55 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function tableShape(x, y, s = 1) {
  return group([
    ellipse(230, 120, 210, 72, { fill: '#FFFFFF', filter: 'url(#softShadow)' }),
    path('M70 120H390L340 360H120Z', { fill: '#FFD7C2', opacity: 0.9 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function cakeShape(x, y, s = 1) {
  return group([
    rect(80, 210, 330, 170, { fill: '#FF9DB7', rx: 34, filter: 'url(#softShadow)' }),
    rect(115, 150, 260, 90, { fill: '#FFD7C2', rx: 28 }),
    path('M145 150V90M245 150V90M345 150V90', { stroke: '#FFD166', 'stroke-width': 18, 'stroke-linecap': 'round' }),
    ...[145, 245, 345].map(cx => path(`M${cx} 75C${cx - 16} 55 ${cx} 35 ${cx + 16} 55C${cx + 30} 72 ${cx + 12} 86 ${cx} 75Z`, { fill: '#FF7B8A' })),
  ], `translate(${x} ${y}) scale(${s})`);
}

function candleShape(x, y, s = 1) {
  return group([
    rect(130, 120, 95, 300, { fill: '#FFD166', rx: 24, filter: 'url(#softShadow)' }),
    path('M178 95C145 55 178 35 198 68C215 96 188 112 178 95Z', { fill: '#FF7B8A' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function cupShape(x, y, s = 1) {
  return group([
    path('M100 110H310L280 410H130Z', { fill: '#8BD3E6', filter: 'url(#softShadow)' }),
    path('M305 190C410 185 410 320 295 315', { fill: 'none', stroke: '#8BD3E6', 'stroke-width': 32, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function plateShape(x, y, s = 1) {
  return group([
    circle(220, 220, 170, { fill: '#FFFFFF', filter: 'url(#softShadow)' }),
    circle(220, 220, 105, { fill: '#EEF6FB' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function doorbellShape(x, y, s = 1) {
  return group([
    rect(110, 100, 210, 340, { fill: '#F2D0A7', rx: 45, filter: 'url(#softShadow)' }),
    circle(215, 270, 76, { fill: '#FFD166' }),
    circle(215, 270, 34, { fill: '#FFFFFF' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function photoFrameShape(x, y, s = 1) {
  return group([
    rect(80, 80, 330, 330, { fill: '#F4C777', rx: 34, filter: 'url(#softShadow)' }),
    rect(118, 118, 254, 254, { fill: '#BFEFFF', rx: 24 }),
    circle(200, 225, 52, { fill: '#F8C6A6' }),
    circle(292, 225, 52, { fill: '#F8C6A6' }),
    path('M150 340C180 285 310 285 345 340Z', { fill: '#A7E38D' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function shoesShape(x, y, s = 1) {
  return group([
    path('M70 310C160 250 220 265 245 350H70Z', { fill: '#FF9DB7', filter: 'url(#softShadow)' }),
    path('M250 310C340 250 400 265 425 350H250Z', { fill: '#8BD3E6', filter: 'url(#softShadow)' }),
    path('M120 310H220M300 310H400', { stroke: '#FFFFFF', 'stroke-width': 16, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function carShape(x, y, s = 1) {
  return group([
    path('M80 250L150 140H340L420 250V340H80Z', { fill: '#8BD3E6', filter: 'url(#softShadow)' }),
    rect(165, 165, 150, 70, { fill: '#BFEFFF', rx: 18 }),
    circle(150, 350, 45, { fill: '#475569' }),
    circle(350, 350, 45, { fill: '#475569' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function flowerShape(x, y, s = 1) {
  return group([
    path('M220 220V430', { stroke: '#43AA8B', 'stroke-width': 28, 'stroke-linecap': 'round' }),
    ...[0, 72, 144, 216, 288].map(angle => ellipse(220, 175, 48, 80, { fill: '#FF9DB7', transform: `rotate(${angle} 220 220)` })),
    circle(220, 220, 48, { fill: '#FFD166' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function leafShape(x, y, s = 1) {
  return group([
    path('M90 300C130 120 300 80 410 135C390 320 210 385 90 300Z', { fill: '#7FCF7B', filter: 'url(#softShadow)' }),
    path('M130 290C220 245 290 185 380 135', { stroke: '#3D9B54', 'stroke-width': 20, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function plantShape(x, y, s = 1) {
  return group([
    path('M120 310H360L320 455H160Z', { fill: '#F4A261', filter: 'url(#softShadow)' }),
    path('M240 315C150 250 160 140 235 185C245 105 350 105 330 210C425 205 420 310 300 315Z', { fill: '#7FCF7B' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function seedShape(x, y, s = 1) {
  return group([
    ...Array.from({ length: 7 }, (_, i) => ellipse(100 + (i % 4) * 72, 145 + Math.floor(i / 4) * 78, 30, 45, { fill: '#9A663F', filter: 'url(#softShadow)', transform: `rotate(${20 + i * 17} ${100 + (i % 4) * 72} ${145 + Math.floor(i / 4) * 78})` })),
  ], `translate(${x} ${y}) scale(${s})`);
}

function wateringCanShape(x, y, s = 1) {
  return group([
    rect(90, 190, 230, 170, { fill: '#8BD3E6', rx: 40, filter: 'url(#softShadow)' }),
    path('M305 220L430 165', { stroke: '#8BD3E6', 'stroke-width': 40, 'stroke-linecap': 'round' }),
    path('M120 190C140 80 290 80 305 190', { fill: 'none', stroke: '#5AA8BA', 'stroke-width': 26, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function windowShape(x, y, s = 1) {
  return group([
    rect(0, 0, 270, 300, { fill: '#FFF6DB', rx: 26, filter: 'url(#softShadow)' }),
    rect(24, 24, 222, 252, { fill: '#BFEFFF', rx: 16 }),
    path('M135 24V276M24 150H246', { stroke: '#FFF6DB', 'stroke-width': 18 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function umbrellaShape(x, y, s = 1) {
  return group([
    path('M0 180C130 35 350 35 480 180Z', { fill: '#FF9DB7', filter: 'url(#softShadow)' }),
    path('M240 180V475', { stroke: '#8C6D4D', 'stroke-width': 26, 'stroke-linecap': 'round' }),
    path('M120 180L240 45L360 180', { fill: 'none', stroke: '#FFD166', 'stroke-width': 16 }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function sunShape(x, y, s = 1) {
  return group([
    circle(0, 0, 62, { fill: '#FFD166' }),
    ...Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const x1 = Math.cos(a) * 92;
      const y1 = Math.sin(a) * 92;
      const x2 = Math.cos(a) * 128;
      const y2 = Math.sin(a) * 128;
      return path(`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`, { stroke: '#FFD166', 'stroke-width': 16, 'stroke-linecap': 'round' });
    }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function fence(x, y) {
  return group([
    ...Array.from({ length: 9 }, (_, i) => rect(i * 120, 0, 34, 250, { fill: '#D3A76A', rx: 12 })),
    path('M0 70H1020M0 170H1020', { stroke: '#D3A76A', 'stroke-width': 34, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y})`);
}

function sofaShape(x, y, s = 1) {
  return group([
    rect(0, 170, 510, 210, { fill: '#CDB4DB', rx: 55, filter: 'url(#softShadow)' }),
    rect(55, 70, 400, 165, { fill: '#DCC7EB', rx: 42 }),
    path('M75 380V470M435 380V470', { stroke: '#8A6FA7', 'stroke-width': 32, 'stroke-linecap': 'round' }),
  ], `translate(${x} ${y}) scale(${s})`);
}

function flowerPatch(x, y) {
  return group(Array.from({ length: 8 }, (_, i) => flowerShape((i % 4) * 75, Math.floor(i / 4) * 75, 0.26)), `translate(${x} ${y})`);
}

function getArgValue(name) {
  const prefix = `${name}=`;
  return process.argv.slice(2).find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}
