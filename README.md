# video-gen

Автоматическая генерация коротких рекламных роликов (10-15 сек) для Instagram Reels, TikTok и YouTube Shorts.

**Стек:** Node.js + Remotion + ElevenLabs TTS + FFmpeg

---

## Что делает программа

1. Читает данные о товаре из `input.json`
2. Генерирует озвучку через ElevenLabs с точными таймингами каждого слова
3. Рендерит видео 1080×1920 через Remotion:
   - Картинка товара с анимацией Ken Burns + вспышка в пике
   - Субтитры с подсветкой текущего слова
   - Фоновая музыка с нарастанием и затуханием
4. Сохраняет готовый MP4 в папку `output/`

---

## Структура проекта

```
video-gen/
├── index.js                  # Точка входа — запускает весь пайплайн
├── prepare-music.js          # Одноразовый скрипт нарезки музыки
├── input.json                # Данные о товаре
├── .env                      # API ключи
├── package.json
├── public/                   # Статические файлы для Remotion
│   ├── product.png           # Картинка товара (копируется автоматически)
│   ├── voice.mp3             # Озвучка (копируется автоматически)
│   └── music/
│       ├── raw/              # Оригинальные треки (добавляешь вручную)
│       └── clips/            # Нарезанные кусочки (генерируются автоматически)
├── src/
│   ├── tts.js                # ElevenLabs TTS + тайминги слов
│   ├── music.js              # Нарезка треков + выбор случайного клипа
│   ├── render.js             # Рендер видео через Remotion
│   └── remotion/
│       ├── index.jsx         # Точка входа Remotion
│       ├── Root.jsx          # Регистрация композиции
│       ├── VideoComp.jsx     # Главный компонент видео
│       └── components/
│           ├── Background.jsx    # Белый фон
│           ├── Product.jsx       # Картинка с анимацией
│           └── Subtitles.jsx     # Субтитры с подсветкой слов
├── tmp/                      # Временные файлы
│   ├── voice.mp3
│   └── words.json
└── output/                   # Готовые видео
```

---

## Установка

### 1. Требования

- Node.js 20+
- FFmpeg — установить и добавить в PATH

**Mac:**
```bash
brew install ffmpeg
```

**Windows:** скачать с [gyan.dev/ffmpeg/builds](https://www.gyan.dev/ffmpeg/builds/) файл `ffmpeg-release-essentials.zip`, распаковать в `C:\ffmpeg`, добавить `C:\ffmpeg\bin` в системный PATH.

**Linux:**
```bash
sudo apt install ffmpeg
```

Проверить:
```bash
ffmpeg -version
ffprobe -version
```

### 2. Клонировать и установить зависимости

```bash
git clone <repo>
cd video-gen
npm install
```

### 3. Настроить `.env`

```env
ELEVENLABS_API_KEY=твой_ключ
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
```

Получить ключ: [elevenlabs.io](https://elevenlabs.io) → ElevenCreative → Profile → API Key

### 4. Добавить фоновую музыку

Скачать треки с [pixabay.com/music](https://pixabay.com/music/) (бесплатно, без атрибуции) и положить в `public/music/raw/`.

Нарезать на кусочки по 20 сек:
```bash
node prepare-music.js
```

---

## Использование

### 1. Заполнить `input.json`

```json
{
  "name": "Наушники JBL Tune",
  "oldPrice": "1000",
  "newPrice": "585",
  "image": "tmp/123.png",
  "voiceText": "Беспроводные наушники JBL Tune! Отличный звук, удобная посадка. Сейчас по специальной цене со скидкой 45 процентов! Успей купить прямо сейчас"
}
```

| Поле | Описание |
|---|---|
| `name` | Название товара |
| `oldPrice` | Старая цена (только цифры) |
| `newPrice` | Новая цена (только цифры) |
| `image` | Путь к картинке товара |
| `voiceText` | Текст озвучки (в будущем генерируется LLM) |

### 2. Запустить

```bash
node index.js
```

Готовый файл появится в `output/result_<timestamp>.mp4`.

### 3. Предпросмотр в браузере

```bash
npm run studio
```

Открыть [localhost:3000](http://localhost:3000) — Remotion Studio с live-preview.

---

## Настройки анимации

Все параметры анимации находятся в `src/remotion/components/Product.jsx`.

```javascript
// Blur to sharp — длина эффекта в секундах
const blur = interpolate(
  frame,
  [0, fps * 2, durationInFrames - fps * 1, durationInFrames],
  [20,      0,                          0,               15],
  //                                                     ^^ сила размытия в конце
);

// Ken Burns + пульс
const scale = interpolate(
  frame,
  [0,   durationInFrames * 0.7,  durationInFrames],
  [1.0,                   1.25,              1.05],
  // ^                    ^^^^               ^^^^
  // старт               пик (70%)          конец
);

// Поворот
const rotate = interpolate(
  frame,
  [0,  durationInFrames * 0.7,  durationInFrames],
  [3,                       -3,               0],
  // ^ градусы              ^                 ^ финальный угол
);

// Цветная вспышка в пике
const peakFrame = durationInFrames * 0.7; // когда вспышка (70% видео)
const flashOpacity = interpolate(
  frame,
  [peakFrame - 10, peakFrame, peakFrame + 10],
  [0,                    0.4,              0],
  //                     ^^^ яркость вспышки (0.0 - 1.0)
);
```

---

## Настройки субтитров

Файл `src/remotion/components/Subtitles.jsx`.

```javascript
// Слова которые выделяются цветом
const HIGHLIGHT_WORDS = ['585', '1000', '45', 'скидкой', 'скидка'];

// Количество слов в одной строке
const WORDS_PER_LINE = 4;

// Размер шрифта
fontSize: 60

// Цвет активного слова
color: isActive ? '#FFE600' : 'white'

// Позиция субтитров (от низа экрана)
bottom: '27%'
```

---

## Настройки музыки

Файл `src/remotion/VideoComp.jsx`.

```javascript
// Громкость фоновой музыки (0.0 - 1.0)
[0, fps * 1, durationInFrames - fps * 1, durationInFrames],
[0,   0.12,                       0.12,                0],
//    ^^^^                         ^^^^ — громкость
```

Файл `src/music.js`.

```javascript
const CLIP_DURATION = 20; // длина одного кусочка в секундах
```

---

## Голоса ElevenLabs

Менять в `.env` поле `ELEVENLABS_VOICE_ID`.

| Голос | Voice ID | Характер |
|---|---|---|
| Sarah | `EXAVITQu4vr4xnSDxMaL` | женский, нейтральный |
| Antoni | `ErXwobaYiN019PkySvjV` | мужской, мягкий |
| Arnold | `VR6AewLTigWG4xSOukaG` | мужской, уверенный |

Настройки голоса в `src/tts.js`:

```javascript
voice_settings: {
  stability: 0.5,        // 0.0 эмоционально — 1.0 монотонно
  similarity_boost: 0.75, // качество воспроизведения голоса
  style: 0.5,            // выразительность
  use_speaker_boost: true
}
```

---

## Пайплайн

```
input.json
    │
    ▼
tts.js ──────────────── ElevenLabs API
    │                        │
    │                   voice.mp3
    │                   words.json (тайминги слов)
    │
    ▼
music.js
    │
    └── getRandomClip() → случайный кусочек из public/music/clips/
    │
    ▼
render.js ──────────── Remotion
    │                      │
    │              VideoComp.jsx
    │                  ├── Background.jsx  (белый фон)
    │                  ├── Product.jsx     (картинка + анимация)
    │                  ├── Subtitles.jsx   (субтитры)
    │                  ├── Audio (voice.mp3)
    │                  └── Audio (music clip, volume 0.12)
    │
    ▼
output/result_<timestamp>.mp4
```

---

## Планы развития

- [ ] Генерация `voiceText` через LLM (Claude/GPT) на основе данных товара
- [ ] Автопарсинг товара по URL (Ozon, WB, AliExpress)
- [ ] Несколько шаблонов оформления на выбор
- [ ] Генерация фоновой музыки через ElevenLabs Music API
- [ ] Интеграция с Deals-ботом — автогенерация видео для каждой скидки
- [ ] Автопостинг в Instagram / TikTok через API

---

## Лицензия

MIT
