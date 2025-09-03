import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export interface AuthStatusResponse {
  authenticated: boolean;
}

export async function GET(): Promise<NextResponse<AuthStatusResponse>> {
  const authenticated = await isAuthenticated();
  return NextResponse.json({ authenticated });
}
