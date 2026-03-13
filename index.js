import { generateVoice } from './src/tts.js';
import { renderVideo } from './src/render.js';
import { getRandomClip } from './src/music.js';
import fs from 'fs';

const input = JSON.parse(fs.readFileSync('input.json', 'utf-8'));

// Шаг 1 — озвучка и тайминги
const words = await generateVoice(input.voiceText, 'tmp/voice.mp3');
fs.writeFileSync('tmp/words.json', JSON.stringify(words, null, 2));
console.log('Тайминги сохранены');

// Шаг 2 — копируем файлы в public
fs.copyFileSync(input.image, 'public/product.png');
fs.copyFileSync('tmp/voice.mp3', 'public/voice.mp3');
console.log('Файлы скопированы');

// Шаг 3 — случайный музыкальный клип
const musicClip = getRandomClip();
console.log('Музыка:', musicClip);

// Шаг 4 — рендер
const outputPath = `output/result_${Date.now()}.mp4`;
await renderVideo(words, musicClip, outputPath);