import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function POST(request: NextRequest) {
  try {
    console.log("Refresh API route called");

    // Check if there's a refresh token in cookies
    const cookieHeader = request.headers.get("cookie");
    console.log("Cookie header:", cookieHeader);

    if (!cookieHeader || !cookieHeader.includes("refreshToken=")) {
      console.log("No refresh token found in cookies");
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 401 },
      );
    }

    console.log(
      "Forwarding to backend:",
      `${API_BASE_URL}/api/v1/auth/refresh`,
    );

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      // Try to parse as JSON, but handle non-JSON responses
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        const errorText = await response.text();
        console.error("Non-JSON error response:", errorText);
        errorData = { error: errorText || "Refresh failed" };
      }

      console.error("Backend error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Refresh failed" },
        { status: response.status },
      );
    }

    const result = await response.json();
    console.log("Refresh successful");

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
