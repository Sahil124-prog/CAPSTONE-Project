import { whoGet } from "../src/clients/whoIcdClient.js";
import { fetchTm2Concepts } from "../src/modules/ingestion/icdTm2.service.js";

const root = await whoGet("https://id.who.int/icd/release/11/mms");

console.time("fetch time");
const concepts = await fetchTm2Concepts(root.latestRelease);
console.timeEnd("fetch time");

console.log("Total TM2 codes:", concepts.length);
console.log(concepts.slice(0, 3));
