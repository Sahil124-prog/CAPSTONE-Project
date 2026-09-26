import { readFileSync } from "fs";
import XLSX from "xlsx";

const TRADITION_MAP = {
  Ayurveda: {
    codeCol: "NAMC_CODE",
    termCol: "NAMC_term",
    defCol: "Short_definition",
  },
  Siddha: {
    codeCol: "NAMC_CODE",
    termCol: "NAMC_TERM",
    defCol: "Short_definition",
  },
  Unani: {
    codeCol: "NUMC_CODE",
    termCol: "NUMC_TERM",
    defCol: "Short_definition",
  },
};

export function parseNamasteFile(filePath, tradition) {
  const { codeCol, termCol, defCol } = TRADITION_MAP[tradition];

  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  const concepts = [];
  for (const row of rows) {
    const code = String(row[codeCol] ?? "").trim();
    const term = String(row[termCol] ?? "").trim();
    if (!code || !term) continue; // skip blank/header rows
    concepts.push({
      code,
      term,
      description: String(row[defCol] ?? "").trim() || null,
      tradition,
    });
  }
  return concepts;
}
