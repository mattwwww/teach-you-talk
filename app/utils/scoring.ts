export function scoreTrophies(wordCount: number, minWords: number): number {
  // Higher minWords = harder scenario = bigger max reward
  const low = minWords >= 8 ? 20 : minWords >= 6 ? 15 : 10;
  const mid = minWords >= 8 ? 35 : minWords >= 6 ? 25 : 20;
  const max = minWords >= 8 ? 50 : minWords >= 6 ? 40 : 30;
  if (wordCount < minWords + 3) return low;
  if (wordCount < minWords + 6) return mid;
  return max;
}
