import axios from 'axios';
import fs from 'fs';
import 'dotenv/config';

const API_KEY  = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

export async function generateVoice(text, outputPath) {
  console.log('Генерирую озвучку с таймингами...');

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
    {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      }
    },
    {
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'  // теперь JSON а не stream
      }
    }
  );

  const { audio_base64, alignment } = response.data;

  // Сохраняем MP3
  const audioBuffer = Buffer.from(audio_base64, 'base64');
  fs.writeFileSync(outputPath, audioBuffer);
  console.log(`Озвучка сохранена: ${outputPath}`);

  // Собираем тайминги по словам из символьных таймингов
  const words = buildWordTimings(alignment);
  console.log(`Слов с таймингами: ${words.length}`);

  return words;
}

// Группируем символы в слова с таймингами
function buildWordTimings(alignment) {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;

  const words = [];
  let currentWord = '';
  let wordStart = null;

  characters.forEach((char, i) => {
    if (char === ' ' || i === characters.length - 1) {
      // Добавляем последний символ если не пробел
      if (char !== ' ') currentWord += char;

      if (currentWord.trim().length > 0) {
        words.push({
          word:  currentWord.trim(),
          start: wordStart,
          end:   character_end_times_seconds[i]
        });
      }

      currentWord = '';
      wordStart = null;
    } else {
      if (wordStart === null) wordStart = character_start_times_seconds[i];
      currentWord += char;
    }
  });

  return words;
}