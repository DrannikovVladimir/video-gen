import { generateVideo } from './src/video.js';
import fs from 'fs';

const input = JSON.parse(fs.readFileSync('input.json', 'utf-8'));

const stat = fs.statSync('tmp/voice.mp3');
console.log('Размер voice.mp3:', stat.size, 'байт');

await generateVideo(input, 'tmp/voice.mp3', 'output/result3.mp4');