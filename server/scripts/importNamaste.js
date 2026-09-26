import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });

const { default: pool } = await import("../src/config/db.js");
const { parseNamasteFile } =
  await import("../src/modules/ingestion/namaste.service.js");
const { saveRelease } =
  await import("../src/modules/ingestion/ingestion.repository.js");
const { default: path } = await import("path");

await pool.query("SELECT 1"); // fail fast
console.log("DB connection OK");

const VERSION = "2024-v1";

const files = [
  { tradition: "Ayurveda", file: "NATIONAL_AYURVEDA_MORBIDITY_CODES.xls" },
  { tradition: "Siddha", file: "NATIONAL_SIDDHA_MORBIDITY_CODES.xls" },
  { tradition: "Unani", file: "NATIONAL_UNANI_MORBIDITY_CODES.xls" },
];

for (const { tradition, file } of files) {
  const existing = await pool.query(
    "SELECT id FROM terminology_releases WHERE system = $1 AND version = $2",
    [`NAMASTE_${tradition.toUpperCase()}`, VERSION],
  );
  if (existing.rows.length > 0) {
    console.log(`${tradition} already imported. Skipping.`);
    continue;
  }

  const filePath = path.resolve("data", file);
  console.log(`Parsing ${tradition}...`);
  const concepts = parseNamasteFile(filePath, tradition);
  console.log(`  → ${concepts.length} concepts found`);

  const releaseId = await saveRelease(
    `NAMASTE_${tradition.toUpperCase()}`,
    VERSION,
    concepts,
  );
  console.log(`  → Saved under release id ${releaseId}`);
}

await pool.end();
console.log("Done.");
