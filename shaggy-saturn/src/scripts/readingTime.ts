const WORDS_PER_MINUTE = 180;

/** Время чтения поста в минутах по сырому markdown-тексту. */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
