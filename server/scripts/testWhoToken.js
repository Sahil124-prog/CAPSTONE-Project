import { getToken } from "../src/clients/whoIcdClient.js";

const token = await getToken();
console.log("Token received, length:", token.length);
