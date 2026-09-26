const TOKEN_URL = "https://icdaccessmanagement.who.int/connect/token";

let cachedToken = null;
let tokenExpiresAt = 0;


export async function getToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

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
      cachedToken = data.access_token;
      // expires_in is in seconds; renew 60s early to be safe
      tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
      return cachedToken;
}

export async function whoGet(url) {
  const token = await getToken();
  // WHO returns http:// links; using https keeps the token from being dropped on redirect
  const httpsUrl = url.replace(/^http:\/\//, "https://");

  const res = await fetch(httpsUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Accept-Language": "en",
      "API-Version": "v2",
    },
  });

  if (!res.ok) {
    throw new Error(`WHO API ${res.status} for ${httpsUrl}`);
  }
  return res.json();
}

