import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

// Указываем путь к ffprobe явно
ffmpeg.setFfprobePath('C:/ffmpeg/bin/ffprobe.exe');

const RAW_DIR   = 'public/music/raw';
const CLIPS_DIR = 'public/music/clips';
const CLIP_DURATION = 20; // секунд

// Нарезаем один трек на кусочки
function sliceTrack(inputPath, trackName) {
  return new Promise((resolve, reject) => {
    // Сначала узнаём длину трека
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);

      const duration = metadata.format.duration;
      const count = Math.floor(duration / CLIP_DURATION);
      const promises = [];

      for (let i = 0; i < count; i++) {
        const outputPath = path.join(CLIPS_DIR, `${trackName}_${i}.mp3`);
        const startTime = i * CLIP_DURATION;

        const p = new Promise((res, rej) => {
          ffmpeg(inputPath)
            .seekInput(startTime)
            .duration(CLIP_DURATION)
            .output(outputPath)
            .on('end', () => {
              console.log(`  ✓ ${trackName}_${i}.mp3`);
              res();
            })
            .on('error', rej)
            .run();
        });

        promises.push(p);
      }

      Promise.all(promises).then(resolve).catch(reject);
    });
  });
}

// Нарезаем все треки
export async function prepareMusic() {
  // Создаём папку clips если нет
  if (!fs.existsSync(CLIPS_DIR)) fs.mkdirSync(CLIPS_DIR, { recursive: true });

  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.mp3'));
  console.log(`Нарезаем ${files.length} треков...`);

  for (const file of files) {
    const trackName = path.basename(file, '.mp3');
    console.log(`Нарезаю: ${file}`);
    await sliceTrack(path.join(RAW_DIR, file), trackName);
  }

  console.log('Готово! Все треки нарезаны.');
}

// Возвращаем случайный кусочек
export function getRandomClip() {
  const clips = fs.readdirSync(CLIPS_DIR).filter(f => f.endsWith('.mp3'));
  if (clips.length === 0) throw new Error('Нет клипов — запусти prepareMusic()');
  const random = clips[Math.floor(Math.random() * clips.length)];
  return path.join('music/clips', random); // относительный путь для staticFile
}