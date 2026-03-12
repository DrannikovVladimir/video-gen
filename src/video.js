import ffmpeg from 'fluent-ffmpeg';
import 'dotenv/config';
import { buildSubtitles } from './subtitles.js';

const FONT = 'C\\:/Windows/Fonts/arial.ttf';

function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration);
    });
  });
}

function buildSubtitleFilters(subtitles, prevStream, duration) {
  const filters = [];
  let stream = prevStream;

  subtitles.forEach((sub, i) => {
    // Последний субтитр → prefade, остальные → sub0, sub1...
    const next = i === subtitles.length - 1 ? 'prefade' : `sub${i}`;
    const enable = `between(t,${sub.start.toFixed(2)},${sub.end.toFixed(2)})`;

    filters.push(
      `[${stream}]drawtext=` +
      `fontfile='${FONT}':` +
      `text='${sub.text}':` +
      `fontsize=42:` +
      `fontcolor=white:` +
      `borderw=3:` +
      `bordercolor=black:` +
      `x=(w-text_w)/2:` +
      `y=1450:` +
      `enable='${enable}'` +
      `[${next}]`
    );

    stream = next;
  });

  // Fade in/out после субтитров
  filters.push(
    `[prefade]fade=t=in:st=0:d=0.5,fade=t=out:st=${(duration - 0.5).toFixed(2)}:d=0.5[final]`
  );

  return filters;
}

export async function generateVideo(input, audioPath, outputPath) {
  const { name, oldPrice, newPrice } = input;
  const discount = Math.round((1 - newPrice / oldPrice) * 100);

  const duration = await getAudioDuration(audioPath);
  console.log(`Длина аудио: ${duration.toFixed(1)} сек`);

  const subtitles = buildSubtitles(input.voiceText, duration);

  return new Promise((resolve, reject) => {
    const filters = [
      '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg]',
      '[0:v]scale=1080:1080:force_original_aspect_ratio=decrease[fg]',
      '[bg][fg]overlay=(W-w)/2:(H-h)/2[base]',
      '[base]drawbox=x=0:y=80:w=1080:h=160:color=red@0.85:t=fill[box1]',
      `[box1]drawtext=fontfile='${FONT}':text='-${discount}%':fontsize=100:fontcolor=white:x=(w-text_w)/2:y=100[disc]`,
      '[disc]drawbox=x=0:y=1600:w=1080:h=320:color=black@0.7:t=fill[box2]',
      `[box2]drawtext=fontfile='${FONT}':text='${name}':fontsize=52:fontcolor=white:x=(w-text_w)/2:y=1630[name]`,
      `[name]drawtext=fontfile='${FONT}':text='${oldPrice} руб':fontsize=48:fontcolor=gray:x=(w-text_w)/2:y=1710[old]`,
      `[old]drawtext=fontfile='${FONT}':text='${newPrice} руб':fontsize=72:fontcolor=yellow:x=(w-text_w)/2:y=1780[sub_start]`,
    ];

    // Субтитры + fade — всё в одной цепочке
    const subtitleFilters = buildSubtitleFilters(subtitles, 'sub_start', duration);
    filters.push(...subtitleFilters);

    ffmpeg()
      .input(input.image).inputOptions(['-loop 1'])
      .input(audioPath)
      .complexFilter(filters)
      .outputOptions([
        '-map [final]',
        '-map 1:a',
        '-c:v libx264',
        '-c:a aac',
        '-shortest',
        '-pix_fmt yuv420p',
        '-r 30'
      ])
      .output(outputPath)
      .on('start', (cmd) => {
        console.log('Генерирую видео...');
        console.log('CMD:', cmd);
      })
      .on('end', () => {
        console.log(`Видео готово: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Ошибка FFmpeg:', err.message);
        reject(err);
      })
      .run();
  });
}