// Returns word count for Cantonese text (by character for CJK, by space for mixed)
export function cantoneseWordCount(text: string): number {
  const cjkChars = text.match(/[一-鿿㐀-䶿]/g) ?? [];
  const latinWords = text.match(/[a-zA-Z]+/g) ?? [];
  return cjkChars.length + latinWords.length;
}

// Returns a Cantonese encouragement message based on word count improvement
export function encouragement(wordCount: number, minWords: number): string {
  if (wordCount === minWords) return '好！剛剛夠，下次試吓多講一句！';
  if (wordCount <= minWords + 3) return '幾好喎！繼續！';
  return '好叻！講得有板有眼！🔥';
}
