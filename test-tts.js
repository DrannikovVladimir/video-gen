import { generateVoice } from './src/tts.js';
import fs from 'fs';

const input = JSON.parse(fs.readFileSync('input.json', 'utf-8'));

const words = await generateVoice(input.voiceText, 'tmp/voice.mp3');

// Сохраняем тайминги в файл для Remotion
fs.writeFileSync('tmp/words.json', JSON.stringify(words, null, 2));
console.log('Тайминги сохранены: tmp/words.json');