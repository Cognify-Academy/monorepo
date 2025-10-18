import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

if (!process.env["JWT_SECRET"]) throw new Error("JWT_SECRET not set");
if (!process.env["JWT_REFRESH_SECRET"])
  throw new Error("JWT_REFRESH_SECRET not set");

const JWT_SECRET = process.env["JWT_SECRET"] as string;
const JWT_REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"] as string;

const JWT_EXPIRATION =
  process.env["ACCESS_TOKEN_EXPIRY"] || process.env["JWT_EXPIRATION"] || "1h"; // Default to 1 hour if not set
const JWT_REFRESH_EXPIRATION =
  process.env["REFRESH_TOKEN_EXPIRY"] ||
  process.env["JWT_REFRESH_EXPIRATION"] ||
  "7d"; // Default to 7 days if not set

// Helper to create an HTTP-only cookie for the refresh token.
function createRefreshCookie(token: string) {
  return `refreshToken=${token}; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`;
}

export async function signup({
  name,
  username,
  email,
  password: rawPassword,
}: {
  name: string;
  username: string;
  email: string;
  password: string;
}) {
  try {
    const password = await bcrypt.hash(rawPassword, 10);
    const user = await prisma.user.create({
      data: { name, username, email, password },
    });
    await prisma.userRole.create({
      data: { userId: user.id, role: "STUDENT" },
    });
    const token = jwt.sign(
      { id: user.id, username, roles: ["STUDENT"] },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRATION,
      } as jwt.SignOptions,
    );
    console.debug("Signup: created token");
    return new Response(JSON.stringify({ token }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    // Handle database connection errors
    if (
      error.message?.includes("Database not connected") ||
      error.code === "P1001"
    ) {
      return new Response(JSON.stringify({ error: "Database not available" }), {
        status: 503, // Service Unavailable
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle unique constraint violations
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      let message = "User already exists";

      if (field === "email") {
        message = "Email already registered";
      } else if (field === "username") {
        message = "Username already taken";
      }

      return new Response(JSON.stringify({ error: message }), {
        status: 409, // Conflict
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle other errors
    return new Response(JSON.stringify({ error: "Failed to create user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function login({
  handle,
  password,
}: {
  handle: string;
  password: string;
}) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: handle }, { email: handle }],
      },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const roles = user.roles.map((role) => role.role);
    const token = jwt.sign(
      { id: user.id, username: user.username, roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION } as jwt.SignOptions,
    );
    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, roles },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRATION } as jwt.SignOptions,
    );
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
      },
    });

    const cookie = createRefreshCookie(refreshToken);

    return new Response(JSON.stringify({ token }), {
      headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
      status: 200,
    });
  } catch (error: any) {
    console.error("Login error:", error);

    // Handle database connection errors
    if (
      error.message?.includes("Database not connected") ||
      error.code === "P1001"
    ) {
      return new Response(JSON.stringify({ error: "Database not available" }), {
        status: 503, // Service Unavailable
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle other errors
    return new Response(JSON.stringify({ error: "Login failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function refreshToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET as string);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (new Date() > tokenRecord.expiresAt) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      return new Response(JSON.stringify({ error: "Refresh token expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: (decoded as any).id },
      include: { roles: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const roles = user.roles.map((role) => role.role);
    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username, roles },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION } as jwt.SignOptions,
    );
    const newRefreshToken = jwt.sign(
      { id: user.id, username: user.username, roles },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRATION } as jwt.SignOptions,
    );

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({
        where: { token: refreshToken },
      });

      await tx.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });

    const cookieHeader = createRefreshCookie(newRefreshToken);

    return new Response(JSON.stringify({ token: newAccessToken }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookieHeader,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function logout(token: string) {
  const refreshToken = token
    .split(";")
    .find((c) => c.trim().startsWith("refreshToken="))
    ?.split("=")[1];
  if (!refreshToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.debug("Logout: deleting refresh token");
  try {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    const cookieHeader = `refreshToken=; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=0`;
    return new Response(JSON.stringify({ message: "Logged out" }), {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookieHeader,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error in logout:", error);
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function verify(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  console.debug("Verify: auth header found");
  const token = authHeader.replace("Bearer ", "");
  console.debug("Verify: token found");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.debug("Verify: decoded token");
    return new Response(JSON.stringify({ user: decoded }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verify: invalid token", error);
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function forgotPassword({ email }: { email: string }) {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Send email with reset link

  return new Response(JSON.stringify({ message: "Email sent" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function resetPassword({
  uuid,
  password: rawPassword,
}: {
  uuid: string;
  password: string;
}) {
  // Reset password for uuid with password length: ${rawPassword.length}
}
