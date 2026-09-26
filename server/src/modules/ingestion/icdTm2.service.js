import { whoGet } from "../../clients/whoIcdClient.js";

// Module II (TM2) inside chapter 26
const MODULE_II_ID = "562274788";

export async function fetchTm2Concepts(releaseUri) {
  const concepts = [];

  async function walk(uri) {
    const node = await whoGet(uri);

    if (node.classKind === "category" && node.code) {
      concepts.push({
        code: node.code,
        term: node.title["@value"],
        description: node.definition?.["@value"] ?? null,
      });
    }

    for (const childUri of node.child ?? []) {
      await walk(childUri);
    }
  }

  await walk(`${releaseUri}/${MODULE_II_ID}`);
  return concepts;
}
