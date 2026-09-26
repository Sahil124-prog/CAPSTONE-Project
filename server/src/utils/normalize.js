export function normalizeTerm(term) {
  if (!term) return null;
  return term
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // replace punctuation with space
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim();
}

