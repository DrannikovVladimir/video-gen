import { useCurrentFrame, useVideoConfig } from 'remotion';

const HIGHLIGHT_WORDS = ['585', '1000', '45', 'скидкой', 'скидка'];
const WORDS_PER_LINE = 4;

function cleanWord(word) {
  return word.replace(/[^а-яёa-z0-9]/gi, '').toLowerCase();
}

function isHighlight(word) {
  const clean = cleanWord(word);
  return HIGHLIGHT_WORDS.some(h => clean === h.toLowerCase());
}

// Нарезаем все слова на строки по WORDS_PER_LINE
function buildLines(words) {
  const lines = [];
  for (let i = 0; i < words.length; i += WORDS_PER_LINE) {
    lines.push(words.slice(i, i + WORDS_PER_LINE));
  }
  return lines;
}

export const Subtitles = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Находим текущее слово
  const currentIndex = words.findIndex(
    w => currentTime >= w.start && currentTime <= w.end
  );

  if (currentIndex === -1) return null;

  // Находим строку для текущего слова
  const lineIndex = Math.floor(currentIndex / WORDS_PER_LINE);
  const lines = buildLines(words);
  const currentLine = lines[lineIndex];

  return (
    <div style={{
      position: 'absolute',
      bottom: '27%',
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      padding: '0 40px',
    }}>
      {currentLine.map((w, i) => {
        const isActive = currentTime >= w.start && currentTime <= w.end;
        const highlight = isHighlight(w.word);

        return (
          <span
            key={lineIndex * WORDS_PER_LINE + i}
            style={{
              fontSize:   60,  // одинаковый для всех
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
              color:      isActive ? '#FFE600' : 'white',
              textShadow: `
                -3px -3px 0 #000,
                3px -3px 0 #000,
                -3px  3px 0 #000,
                3px  3px 0 #000
              `,
              lineHeight: 1.2,
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};