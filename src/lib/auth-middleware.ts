import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, verifyToken } from "@/lib/auth";

export interface AuthMiddlewareResponse {
  success: boolean;
  message: string;
}

export function withAuth(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    ...args: any[]
  ): Promise<NextResponse> => {
    try {
      const token = await getAuthToken();

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            message: "Authentication required",
          } as AuthMiddlewareResponse,
          { status: 401 }
        );
      }

      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or expired token",
          } as AuthMiddlewareResponse,
          { status: 401 }
        );
      }

      // Add user info to request headers for the handler
      request.headers.set("x-user", payload.username);

      return await handler(request, ...args);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Authentication error",
        } as AuthMiddlewareResponse,
        { status: 500 }
      );
    }
  };
}
