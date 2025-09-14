import { db } from "../firebase.js"; // Adjust the path as needed

export interface OAuthToken {
  accessToken: string;
  tokenType: string,
  expiresIn: number; // Unix timestamp
  refreshToken: string;
  scope: string;
  receivedAt: Date
}

const COLLECTION = "oauthTokens";

/**
 * Stores an OAuth token for a Discord user.
 */
export async function saveToken(discordId: string, token: OAuthToken): Promise<void> {
  const ref = db.collection(COLLECTION).doc(discordId);
  await ref.set(token);
}

/**
 * Retrieves an OAuth token for a Discord user.
 */
export async function getToken(discordId: string): Promise<OAuthToken | null> {
  const ref = db.collection(COLLECTION).doc(discordId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return snap.data() as OAuthToken;
}


export default {
  saveToken,
  getToken
}