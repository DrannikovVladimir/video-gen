// Нарезаем текст на фразы и считаем тайминги
export function buildSubtitles(text, durationSec) {
  // Разбиваем текст на фразы по знакам препинания
  const phrases = text
    .split(/[,!?.]+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const count = phrases.length;
  const timePerPhrase = durationSec / count;

  // Каждой фразе назначаем время появления и исчезновения
  return phrases.map((text, i) => ({
    text,
    start: i * timePerPhrase,
    end:   (i + 1) * timePerPhrase
  }));
}