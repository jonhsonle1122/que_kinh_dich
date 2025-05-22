import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // CLIENT_ID chính là OAuth client ID bạn tạo

export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  // payload chứa thông tin user từ Google
  return payload;
}
