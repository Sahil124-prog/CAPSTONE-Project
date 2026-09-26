import { whoGet } from "../src/clients/whoIcdClient.js";
import { fetchTm2Concepts } from "../src/modules/ingestion/icdTm2.service.js";
import { saveRelease } from "../src/modules/ingestion/ingestion.repository.js";
import pool from "../src/config/db.js";


await pool.query("SELECT 1"); // fail fast if the DB is unreachable
console.log("Database connection OK");

const root = await whoGet("https://id.who.int/icd/release/11/mms");
const version = root.latestRelease.split("/").at(-2); // "2026-01"
const existing = await pool.query(
  "SELECT id FROM terminology_releases WHERE system = $1 AND version = $2",
  ["ICD11_TM2", version],
);
if (existing.rows.length > 0) {
  console.log(
    `Release ${version} already imported (id ${existing.rows[0].id}). Nothing to do.`,
  );
  await pool.end();
  process.exit(0);
}


console.log(`Fetching TM2 codes for release ${version}...`);
const concepts = await fetchTm2Concepts(root.latestRelease);

const releaseId = await saveRelease("ICD11_TM2", version, concepts);
console.log(`Saved ${concepts.length} codes under release id ${releaseId}`);

await pool.end(); // close DB connections so the script can exit
