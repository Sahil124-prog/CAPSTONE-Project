import { whoGet } from "../src/clients/whoIcdClient.js";
import { fetchTm2Concepts } from "../src/modules/ingestion/icdTm2.service.js";
import { saveRelease } from "../src/modules/ingestion/ingestion.repository.js";
import pool from "../src/config/db.js";

const root = await whoGet("https://id.who.int/icd/release/11/mms");
const version = root.latestRelease.split("/").at(-2); // "2026-01"

console.log(`Fetching TM2 codes for release ${version}...`);
const concepts = await fetchTm2Concepts(root.latestRelease);

const releaseId = await saveRelease("ICD11_TM2", version, concepts);
console.log(`Saved ${concepts.length} codes under release id ${releaseId}`);

await pool.end(); // close DB connections so the script can exit
