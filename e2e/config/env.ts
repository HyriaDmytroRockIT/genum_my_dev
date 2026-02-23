export const isCI = Boolean(process.env.CI);

export const webBaseUrl =
  process.env.E2E_WEB_URL ??
  (process.env.E2E === "true" ? "http://127.0.0.1:4080" : "http://127.0.0.1:3080");

export const apiBaseUrl =
  process.env.E2E_API_URL ??
  (process.env.E2E === "true" ? "http://127.0.0.1:4010" : "http://127.0.0.1:3010");

export const authStatePath = "e2e/.auth/state.json";
export const authCredentialsPath = "e2e/.auth/credentials.json";
