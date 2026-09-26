import { whoGet } from "../src/clients/whoIcdClient.js";

const root = await whoGet("https://id.who.int/icd/release/11/mms");
console.log("Latest release:", root.latestRelease);

const release = await whoGet(root.latestRelease);
for (const chapterUri of release.child) {
  const chapter = await whoGet(chapterUri);
  console.log(chapterUri, "-", chapter.title["@value"]);
}


