export function revealSegments(text, locale, Segmenter = Intl.Segmenter) {
  if (Segmenter)
    return [
      ...new Segmenter(locale, { granularity: "word" }).segment(text),
    ].map((part) => part.segment);
  return text.match(/\P{Mark}\p{Mark}*|\p{Mark}+/gu) || [];
}
