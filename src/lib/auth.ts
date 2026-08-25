export const SESSION_COOKIE = "pt_session";

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Session token derived from the password; rotating APP_PASSWORD logs everyone out. */
export async function sessionToken(): Promise<string | null> {
  const pw = process.env.APP_PASSWORD;
  return pw ? hmac(pw, "prep-tracker-session") : null;
}
export const authEnabled = () => Boolean(process.env.APP_PASSWORD);
