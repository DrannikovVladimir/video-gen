import { generateVoice } from './src/tts.js';
import fs from 'fs';

// Читаем данные из файла
const input = JSON.parse(fs.readFileSync('input.json', 'utf-8'));

await generateVoice(input.voiceText, 'tmp/voice.mp3');