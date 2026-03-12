import { buildSubtitles } from './src/subtitles.js';

const text = 'Беспроводные наушники JBL Tune! Отличный звук, удобная посадка. Сейчас по специальной цене со скидкой 45 процентов! Успей купить прямо сейчас!';

const subs = buildSubtitles(text, 9);

subs.forEach(s => {
  console.log(`[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s]: ${s.text}`);
});