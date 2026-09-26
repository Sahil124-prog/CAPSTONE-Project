import { whoGet } from "../src/clients/whoIcdClient.js";

const uri = process.argv[2];
const node = await whoGet(uri);
console.log("NODE:", node.title["@value"], `(${node.classKind})`);

for (const childUri of node.child ?? []) {
  const child = await whoGet(childUri);
  console.log(
    child.code ?? "-",
    "|",
    child.title["@value"],
    "|",
    child.classKind,
    "|",
    childUri,
  );
}
