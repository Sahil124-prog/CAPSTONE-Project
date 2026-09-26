const TOKEN_URL = "https://icdaccessmanagement.who.int/connect/token";

export async function getToken() {
  const body = new URLSearchParams({
    client_id: process.env.WHO_ICD_CLIENT_ID,
    client_secret: process.env.WHO_ICD_CLIENT_SECRET,
    scope: "icdapi_access",
    grant_type: "client_credentials",
  });

  const res = await fetch(TOKEN_URL, { method: "POST", body });

  if (!res.ok) {
    throw new Error(`WHO token request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}
