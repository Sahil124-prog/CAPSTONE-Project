export function normalizeTerm(term) {
  if (!term) return null;
  return term
    .normalize("NFD") // Decompose accented chars
    .replace(/[\u0300-\u036f]/g, "") // Strip combining diacritics safely
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // Unicode-aware: keeps all global letters + digits
    .replace(/\s+/g, " ")
    .trim();
}
