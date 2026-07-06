import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const input = join(root, 'public/videos/aurora-cabin.mp4');
const output = join(root, 'public/videos/aurora-cabin-compressed.mp4');

// Try to use available video tools
import { execSync } from 'node:child_process';

// Check for available tools
async function findTool() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return 'ffmpeg';
  } catch {}
  try {
    const ffmpegPath = require.resolve('ffmpeg-static');
    return ffmpegPath;
  } catch {}
  return null;
}

const toolPath = await findTool();
if (!toolPath) {
  console.error('No ffmpeg found. Install ffmpeg or run: npm install ffmpeg-static');
  process.exit(1);
}

const cmd = toolPath === 'ffmpeg'
  ? `ffmpeg -y -i "${input}" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 64k -movflags +faststart "${output}"`
  : `"${toolPath}" -y -i "${input}" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 64k -movflags +faststart "${output}"`;

console.log('Compressing...');
execSync(cmd, { stdio: 'inherit' });

const { size: oldSize } = await import('node:fs').then(fs => fs.statSync(input));
const { size: newSize } = await import('node:fs').then(fs => fs.statSync(output));
console.log(`Original: ${(oldSize / 1024 / 1024).toFixed(1)} MiB`);
console.log(`Compressed: ${(newSize / 1024 / 1024).toFixed(1)} MiB`);
