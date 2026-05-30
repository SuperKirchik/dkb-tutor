import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type AuthPayload = {
  sub: string;
  role: "ADMIN" | "STUDENT";
};

export async function getCurrentUserFromCookie() {
  const token = (await cookies()).get("tutor_token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET ?? "dev-secret") as AuthPayload;
  } catch {
    return null;
  }
}

export async function isAdminRequest() {
  const user = await getCurrentUserFromCookie();
  return user?.role === "ADMIN";
}
