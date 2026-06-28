import fs from 'fs';

const path = 'src/data/lessons/morningRoutine.ts';
let content = fs.readFileSync(path, 'utf8');

function fixObject(content, id) {
  const regex = new RegExp(`id:\\s*['"]${id}['"]`);
  const match = content.match(regex);
  if (!match) return content;
  
  const idIndex = match.index;
  let startIdx = idIndex;
  while (startIdx >= 0 && content[startIdx] !== '{') startIdx--;
  
  let braceCount = 1;
  let endIdx = startIdx + 1;
  while (endIdx < content.length && braceCount > 0) {
    if (content[endIdx] === '{') braceCount++;
    else if (content[endIdx] === '}') braceCount--;
    endIdx++;
  }
  
  let block = content.substring(startIdx, endIdx);
  
  const posMatch = block.match(/position:\s*\{([^}]+)\}/);
  const touchMatch = block.match(/touchArea:\s*\{([^}]+)\}/);
  
  if (posMatch && touchMatch) {
    const getVal = (str, key) => {
      const m = str.match(new RegExp(`${key}:\\s*([\\d.-]+)`));
      return m ? parseFloat(m[1]) : 0;
    };
    
    const posStr = posMatch[1];
    const touchStr = touchMatch[1];
    
    const pw = getVal(posStr, 'width');
    const ph = getVal(posStr, 'height');
    const px = getVal(posStr, 'x');
    const py = getVal(posStr, 'y');
    
    const tw = getVal(touchStr, 'width');
    const th = getVal(touchStr, 'height');
    
    const extraW = Math.max(0, tw - pw);
    const extraH = Math.max(0, th - ph);
    
    const newTx = px - (extraW / 2);
    const newTy = py - (extraH / 2);
    
    const newTouchStr = `\n            height: ${Math.round(th*100)/100},\n            width: ${Math.round(tw*100)/100},\n            x: ${Math.round(newTx*100)/100},\n            y: ${Math.round(newTy*100)/100},\n          `;
    
    block = block.replace(touchMatch[0], `touchArea: {${newTouchStr}}`);
    content = content.substring(0, startIdx) + block + content.substring(endIdx);
  }
  return content;
}

const objects = ['bedroom-sun', 'bedroom-pillow', 'bedroom-lamp', 'bedroom-clock', 'bedroom-box', 'bedroom-socks', 'bedroom-doll'];
for (const id of objects) {
  content = fixObject(content, id);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed touch areas");
