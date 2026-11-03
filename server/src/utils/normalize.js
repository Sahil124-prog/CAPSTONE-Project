export function normalizeTerm(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFD") // Decompose combined graphemes
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // Keep Unicode letters/numbers, replace rest with space
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
}
