import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
const AUTH_COOKIE_NAME = "olh-auth-token";

export interface AuthPayload {
  username: string;
  exp: number;
}

export async function createToken(username: string): Promise<string> {
  return await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const validUsername = process.env.AUTH_USERNAME;
  const validPasswordHash = process.env.AUTH_PASSWORD_HASH;

  if (!validUsername || !validPasswordHash) {
    throw new Error("Authentication not properly configured");
  }

  // Decode base64 hash if needed
  let decodedHash = validPasswordHash;
  try {
    // Check if it's base64 encoded (doesn't start with $)
    if (!validPasswordHash.startsWith("$")) {
      decodedHash = Buffer.from(validPasswordHash, "base64").toString("utf-8");
    }
  } catch (error) {
    // If base64 decode fails, use original hash
    decodedHash = validPasswordHash;
  }

  if (username !== validUsername) {
    return false;
  }

  return await bcrypt.compare(password, decodedHash);
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  if (!token) return false;

  const payload = await verifyToken(token);
  return payload !== null;
}
