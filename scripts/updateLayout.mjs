import fs from 'fs';
import path from 'path';

const JSON_FILE = 'layout_update.json';
const LESSONS_DIR = 'src/data/lessons';

function formatObject(obj, indent = '            ') {
  let str = '{\n';
  for (const [key, val] of Object.entries(obj)) {
    str += `${indent}${key}: ${typeof val === 'string' ? `'${val}'` : val},\n`;
  }
  str += `${indent.substring(2)}}`;
  return str;
}

function findObjectBlock(content, id) {
  const regex = new RegExp(`id:\\s*['"]${id}['"]`);
  const match = content.match(regex);
  if (!match) return null;
  
  const idIndex = match.index;
  let startIdx = idIndex;
  while (startIdx >= 0 && content[startIdx] !== '{') {
    startIdx--;
  }
  
  if (startIdx < 0) return null;
  
  let braceCount = 1;
  let endIdx = startIdx + 1;
  while (endIdx < content.length && braceCount > 0) {
    if (content[endIdx] === '{') braceCount++;
    else if (content[endIdx] === '}') braceCount--;
    endIdx++;
  }
  
  if (braceCount !== 0) return null;
  
  return {
    start: startIdx,
    end: endIdx,
    block: content.substring(startIdx, endIdx)
  };
}

function replaceKeyInBlock(block, key, newContentStr) {
  const keyIdx = block.indexOf(`${key}:`);
  if (keyIdx === -1) {
    if (key === 'touchArea') {
      const lastBraceIdx = block.lastIndexOf('}');
      return block.substring(0, lastBraceIdx) + `          touchArea: ${newContentStr},\n        ` + block.substring(lastBraceIdx);
    }
    return block;
  }
  
  let startIdx = keyIdx;
  while (startIdx < block.length && block[startIdx] !== '{') {
    startIdx++;
  }
  if (startIdx >= block.length) return block;
  
  let braceCount = 1;
  let endIdx = startIdx + 1;
  while (endIdx < block.length && braceCount > 0) {
    if (block[endIdx] === '{') braceCount++;
    else if (block[endIdx] === '}') braceCount--;
    endIdx++;
  }
  
  return block.substring(0, startIdx) + newContentStr + block.substring(endIdx);
}

function main() {
  if (!fs.existsSync(JSON_FILE)) {
    console.error(`Error: File ${JSON_FILE} not found. Please create it and paste your JSON.`);
    process.exit(1);
  }

  // Check if JSON_FILE is a directory (user accidentally ran mkdir)
  const stats = fs.statSync(JSON_FILE);
  if (stats.isDirectory()) {
    console.error(`Error: ${JSON_FILE} is a directory! Please remove it and create a file instead.`);
    process.exit(1);
  }

  let raw = fs.readFileSync(JSON_FILE, 'utf8');

  // Strip Metro/Console metadata prefixes like:
  // "AdminSceneEditor.tsx:53 {" or "&platform=ios...:48 {"
  // We can clean up the lines to make JSON parsing easier
  raw = raw.split('\n')
    .map(line => {
      // Remove prefixes that end with a colon and line number followed by space
      // e.g. "AdminSceneEditor.tsx:53 " or "shallow=true:48 "
      return line.replace(/^.*?:\d+\s+/, '');
    })
    .join('\n');

  let objectsToUpdate = [];

  // Parse sections based on header headers
  const headers = [
    { name: 'character', index: raw.indexOf("--- CHARACTER ---") },
    { name: 'objects', index: raw.indexOf("--- OBJECTS ---") },
    { name: 'dropzones', index: raw.indexOf("--- DROPZONES ---") }
  ].filter(h => h.index !== -1)
   .sort((a, b) => a.index - b.index);

  if (headers.length > 0) {
    for (let i = 0; i < headers.length; i++) {
      const current = headers[i];
      const next = headers[i + 1];
      const start = current.index;
      const end = next ? next.index : raw.length;
      const section = raw.substring(start, end);

      if (current.name === 'character') {
        const match = section.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            if (parsed && parsed.id) {
              objectsToUpdate.push(parsed);
            }
          } catch (e) {
            console.warn("Warning: Could not parse character object:", e.message);
          }
        }
      } else if (current.name === 'objects' || current.name === 'dropzones') {
        const match = section.match(/\[[\s\S]*\]/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            if (Array.isArray(parsed)) {
              objectsToUpdate.push(...parsed);
            }
          } catch (e) {
            console.warn(`Warning: Could not parse ${current.name} array:`, e.message);
          }
        }
      }
    }
  }

  // Fallback: if no headers found, but the file is just a single JSON object or array
  if (objectsToUpdate.length === 0) {
    try {
      const parsedDirect = JSON.parse(raw.trim());
      if (Array.isArray(parsedDirect)) {
        objectsToUpdate = parsedDirect;
      } else if (parsedDirect && typeof parsedDirect === 'object') {
        if (parsedDirect.character) objectsToUpdate.push(parsedDirect.character);
        if (Array.isArray(parsedDirect.objects)) objectsToUpdate.push(...parsedDirect.objects);
        if (!parsedDirect.character && !parsedDirect.objects) objectsToUpdate.push(parsedDirect);
      }
    } catch (e) {
      // Ignore fallback error
    }
  }

  if (objectsToUpdate.length === 0) {
    console.log("No objects found to update.");
    return;
  }

  // Find all lesson files
  const files = fs.readdirSync(LESSONS_DIR)
    .filter(f => f.endsWith('.ts'))
    .map(f => path.join(LESSONS_DIR, f));

  let updatedCount = 0;

  for (const file of files) {
    let fileContent = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    for (const obj of objectsToUpdate) {
      const match = findObjectBlock(fileContent, obj.id);
      if (!match) continue;

      let newBlock = match.block;
      
      // Update position
      if (obj.position) {
        const formattedPos = formatObject(obj.position, '            ');
        newBlock = replaceKeyInBlock(newBlock, 'position', formattedPos);
      }

      // Update touchArea
      if (obj.touchArea) {
        const formattedTouch = formatObject(obj.touchArea, '            ');
        newBlock = replaceKeyInBlock(newBlock, 'touchArea', formattedTouch);
      }

      fileContent = fileContent.substring(0, match.start) + newBlock + fileContent.substring(match.end);
      hasChanges = true;
      updatedCount++;
      console.log(`Updated [${obj.id}] in ${path.basename(file)}`);
    }

    if (hasChanges) {
      fs.writeFileSync(file, fileContent, 'utf8');
    }
  }

  console.log(`Successfully updated ${updatedCount} objects!`);
}

main();
