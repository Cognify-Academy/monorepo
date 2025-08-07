import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function POST(request: NextRequest) {
  try {
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to refresh token" },
        { status: response.status },
      );
    }

    const result = await response.json();

    // Forward the Set-Cookie header from the backend
    const setCookieHeader = response.headers.get("Set-Cookie");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (setCookieHeader) {
      headers["Set-Cookie"] = setCookieHeader;
    }

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error("Auth refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
