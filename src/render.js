import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');  // корень проекта

export async function renderVideo(words, musicClip, outputPath) {
  console.log('Bundling...');

  const bundled = await bundle({
    entryPoint: path.resolve(__dirname, './remotion/index.jsx'),
    webpackOverride: (config) => config,
    publicDir: path.resolve(ROOT, 'public'),  // явно указываем папку public
  });

  const input = JSON.parse(fs.readFileSync('input.json', 'utf-8'));

  const durationSec = words[words.length - 1].end + 1;
  const durationInFrames = Math.ceil(durationSec * 30);

  const props = {
    input: { ...input, image: 'product.png' },
    words,
    musicClip,  // передаём клип
  };

  console.log('Выбираем композицию...');

  const composition = await selectComposition({
    serveUrl: bundled,
    id: 'VideoAd',
    inputProps: props,
  });

  composition.durationInFrames = durationInFrames;

  console.log('Рендерим видео...');

  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps: props,
  });

  console.log(`Готово: ${outputPath}`);
}