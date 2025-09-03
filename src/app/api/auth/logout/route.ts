import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function POST(): Promise<NextResponse<LogoutResponse>> {
  try {
    await clearAuthCookie();

    return NextResponse.json(
      { success: true, message: "Logout successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
