import {
  test,
  expect,
  mock,
  describe,
  beforeEach,
  afterEach,
  jest,
} from "bun:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "testsecret";
process.env.JWT_REFRESH_SECRET = "testsecret";
process.env.JWT_EXPIRATION = "1h";
process.env.JWT_REFRESH_EXPIRATION = "7d";

import {
  signup,
  login,
  verify,
  refreshToken,
  logout,
  forgotPassword,
} from "../model";
import prisma from "../../prisma";

const JWT_SECRET = "testsecret";
const JWT_REFRESH_SECRET = "testsecret";

const mockCreate = mock(() => ({
  id: 1,
  username: "testuser",
  email: "test@example.com",
  password: bcrypt.hashSync("password123", 10),
}));

const mockFindFirst = mock((): any => ({
  id: 1,
  username: "testuser",
  email: "test@example.com",
  password: bcrypt.hashSync("password123", 10),
  roles: [],
}));

const mockUserRole = mock(() => ({
  userId: 1,
  role: "STUDENT",
}));

const mockRefreshTokenFindUnique = mock((): any => ({
  id: 1,
  token: "valid_refresh_token",
  userId: 1,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
}));

const mockUserFindUnique = mock((): any => ({
  id: 1,
  username: "testuser",
  email: "test@example.com",
  password: bcrypt.hashSync("password123", 10),
  roles: [{ role: "STUDENT" }],
}));

prisma.user.create = mockCreate as any;
prisma.user.findFirst = mockFindFirst as any;
prisma.user.findUnique = mockUserFindUnique as any;
prisma.userRole.create = mockUserRole as any;
prisma.refreshToken.create = jest.fn();
prisma.refreshToken.findUnique = mockRefreshTokenFindUnique as any;
prisma.refreshToken.delete = jest.fn();
prisma.refreshToken.deleteMany = jest.fn();
prisma.refreshToken.update = jest.fn();
prisma.$transaction = jest.fn();
const mockVerify = mock(() => ({ id: 1, username: "testuser" }));
const jwtVerify = jwt.verify;

beforeEach(() => {
  jwt.verify = mockVerify as any;
  mockCreate.mockClear();
  mockFindFirst.mockClear();
  mockUserFindUnique.mockClear();
  mockRefreshTokenFindUnique.mockClear();
  mockVerify.mockClear();
  (prisma.refreshToken.create as any).mockClear();
  (prisma.refreshToken.delete as any).mockClear();
  (prisma.refreshToken.deleteMany as any).mockClear();
  (prisma.refreshToken.update as any).mockClear();
  (prisma.$transaction as any).mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
  jwt.verify = jwtVerify;
});

describe("Signup", () => {
  test("create a new user and return a token", async () => {
    const res = await signup({
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.token).toBeDefined();
    expect(mockCreate).toHaveBeenCalled();
  });
});

describe("Login", () => {
  test("return a token for valid login", async () => {
    const res = await login({
      handle: "testuser",
      password: "password123",
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.token).toBeDefined();
    expect(mockFindFirst).toHaveBeenCalled();
  });

  test("fail when user not found", async () => {
    mockFindFirst.mockImplementationOnce(() => null);
    const res = await login({
      handle: "testuser",
      password: "password123",
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Invalid credentials");
    expect(mockFindFirst).toHaveBeenCalled();
  });

  test("fail when incorrect password", async () => {
    const wrongPasswordMock = mock(() => ({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password: bcrypt.hashSync("wrongpassword", 10),
    }));

    prisma.user.findFirst = wrongPasswordMock as any;
    const res = await login({
      handle: "testuser",
      password: "password123",
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Invalid credentials");
    expect(wrongPasswordMock).toHaveBeenCalled();
  });
});

describe("Verify", () => {
  test("should return user data for a valid token", async () => {
    const token = jwt.sign({ id: 1, username: "testuser" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const req = new Request("http://localhost/verify", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await verify(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.user).toEqual({ id: 1, username: "testuser" });
    expect(mockVerify).toHaveBeenCalled();
  });

  test("should return 401 if no authorization header is present", async () => {
    const req = new Request("http://localhost/verify", { method: "GET" });

    const res = await verify(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  test("should return 401 if the token is invalid", async () => {
    const invalidToken = "invalid.token.value";

    const req = new Request("http://localhost/verify", {
      method: "GET",
      headers: { Authorization: `Bearer ${invalidToken}` },
    });

    mockVerify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    const res = await verify(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Invalid token");
    expect(mockVerify).toHaveBeenCalled();
  });
});

describe("Refresh Token", () => {
  test("should return new access token for valid refresh token", async () => {
    const validRefreshToken = jwt.sign(
      { id: 1, username: "testuser", roles: ["STUDENT"] },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // Mock the transaction to execute its callback
    (prisma.$transaction as any).mockImplementationOnce(
      async (callback: any) => {
        const mockTx = {
          refreshToken: {
            delete: jest.fn(),
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        };
        return await callback(mockTx);
      },
    );

    const res = await refreshToken(validRefreshToken);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.token).toBeDefined();
    expect(mockRefreshTokenFindUnique).toHaveBeenCalledWith({
      where: { token: validRefreshToken },
    });
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { roles: true },
    });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  test("should return 401 if refresh token not found in database", async () => {
    const validRefreshToken = jwt.sign(
      { id: 1, username: "testuser", roles: ["STUDENT"] },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    mockRefreshTokenFindUnique.mockImplementationOnce(() => null);

    const res = await refreshToken(validRefreshToken);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(mockRefreshTokenFindUnique).toHaveBeenCalledWith({
      where: { token: validRefreshToken },
    });
  });

  test("should return 401 and delete token if refresh token is expired", async () => {
    const validRefreshToken = jwt.sign(
      { id: 1, username: "testuser", roles: ["STUDENT"] },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    mockRefreshTokenFindUnique.mockReturnValueOnce({
      id: 1,
      token: validRefreshToken,
      userId: 1,
      expiresAt: new Date(Date.now() - 1000),
    });

    const res = await refreshToken(validRefreshToken);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Refresh token expired");
    expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
      where: { token: validRefreshToken },
    });
  });

  test("should return 401 if user not found", async () => {
    const validRefreshToken = jwt.sign(
      { id: 999, username: "nonexistentuser", roles: ["STUDENT"] },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    mockVerify.mockImplementationOnce(() => ({
      id: 999,
      username: "nonexistentuser",
      roles: ["STUDENT"],
    }));

    mockUserFindUnique.mockImplementationOnce(() => null);

    const res = await refreshToken(validRefreshToken);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { id: 999 },
      include: { roles: true },
    });
  });

  test("should return 401 if refresh token is invalid", async () => {
    const invalidRefreshToken = "invalid.refresh.token";

    mockVerify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    const res = await refreshToken(invalidRefreshToken);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });
});

describe("Logout", () => {
  test("should successfully logout with valid refresh token in cookie", async () => {
    const cookieString = "refreshToken=valid_refresh_token; HttpOnly; Secure";

    const res = await logout(cookieString);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Logged out");
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: "valid_refresh_token" },
    });
    expect(res.headers.get("Set-Cookie")).toContain("refreshToken=;");
  });

  test("should return 401 if no refresh token found in cookie", async () => {
    const cookieString = "someOtherCookie=value";

    const res = await logout(cookieString);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
  });

  test("should return 401 if cookie string is empty", async () => {
    const cookieString = "";

    const res = await logout(cookieString);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
  });

  test("should return 401 if database deletion fails", async () => {
    const cookieString = "refreshToken=valid_refresh_token; HttpOnly; Secure";
    (prisma.refreshToken.deleteMany as any).mockRejectedValueOnce(
      new Error("Database error"),
    );

    const res = await logout(cookieString);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: "valid_refresh_token" },
    });
  });
});

describe("Forgot Password", () => {
  test("should return success message for existing user", async () => {
    const originalFindFirst = prisma.user.findFirst;
    const findFirstMock = mock(() => ({
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password: bcrypt.hashSync("password123", 10),
      roles: [],
    }));
    prisma.user.findFirst = findFirstMock as any;

    const res = await forgotPassword({ email: "test@example.com" });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Email sent");
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });

    prisma.user.findFirst = originalFindFirst;
  });

  test("should return 404 for non-existent user", async () => {
    const originalFindFirst = prisma.user.findFirst;
    const findFirstMock = mock(() => null);
    prisma.user.findFirst = findFirstMock as any;

    const res = await forgotPassword({ email: "nonexistent@example.com" });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("User not found");
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { email: "nonexistent@example.com" },
    });

    prisma.user.findFirst = originalFindFirst;
  });
});
