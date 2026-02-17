import fs from 'fs';
import path from 'path';

const songsDir = path.join(process.cwd(), 'public/songs');
const files = fs.readdirSync(songsDir).filter((f) => f.endsWith('.xml'));

const songIndex = files.map((file) => {
  const content = fs.readFileSync(path.join(songsDir, file), 'utf8');

  // Simple regex to extract metadata from the Basic XML we generate
  const titleMatch = content.match(/<work-title>([^<]+)<\/work-title>/);
  const bpmMatch = content.match(/<per-minute>([^<]+)<\/per-minute>/);

  const id = file.replace('.xml', '');
  const name = titleMatch ? titleMatch[1] : id;
  const bpm = bpmMatch ? parseInt(bpmMatch[1], 10) : 120;

  return {
    id,
    name,
    bpm,
    path: `songs/${file}`,
  };
});

fs.writeFileSync(path.join(songsDir, 'index.json'), JSON.stringify(songIndex, null, 2));

console.log(`Generated index.json with ${songIndex.length} songs (metadata only).`);
