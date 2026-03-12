import axios from 'axios';
import fs from 'fs';
import 'dotenv/config';

const API_KEY  = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

export async function generateVoice(text, outputPath) {
  console.log('🎙  Генерирую озвучку...');

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      text,
      model_id: 'eleven_multilingual_v2', // поддерживает русский
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,            // выразительность стиля (0.0-1.0)
        use_speaker_boost: true // улучшает качество звука
      }
    },
    {
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      responseType: 'stream' // получаем аудио как поток байт
    }
  );

  // Сохраняем MP3 в tmp/
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    writer.on('finish', () => {
      console.log(`✅ Озвучка сохранена: ${outputPath}`);
      resolve(outputPath);
    });
    writer.on('error', reject);
  });
}