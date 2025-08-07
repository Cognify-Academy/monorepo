import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function POST(request: NextRequest) {
  try {
    console.log("Login API route called");
    const body = await request.json();
    const { handle, password } = body;

    if (!handle || !password) {
      return NextResponse.json(
        { error: "Handle and password are required" },
        { status: 400 },
      );
    }

    console.log("Forwarding to backend:", `${API_BASE_URL}/api/v1/auth/login`);

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ handle, password }),
    });

    console.log("Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Login failed" },
        { status: response.status },
      );
    }

    const result = await response.json();
    console.log("Login successful");

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
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
