import { Elysia } from "elysia";
import jwt from "jsonwebtoken";

const getJWTSecret = () => process.env["JWT_SECRET"] as string;

const AuthService = new Elysia({ name: "Service.Auth" }).derive(
  { as: "scoped" },
  ({ request: { headers } }) => {
    const authHeader = headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return { Auth: { user: null, hasRole: () => false } };
    }

    try {
      const user = jwt.verify(token, getJWTSecret()) as {
        id: string;
        roles: string[];
      };

      return {
        Auth: {
          user,
          hasRole: (...roles: string[]) =>
            user && roles.some((role) => user.roles.includes(role)),
        },
      };
    } catch {
      return { Auth: { user: null, hasRole: () => false } };
    }
  },
);

export default AuthService;
