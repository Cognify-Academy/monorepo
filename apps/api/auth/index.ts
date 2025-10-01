import { Elysia, t } from "elysia";
import { signup, login, refreshToken, logout } from "./model";

const authRouter = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async ({
      body,
    }: {
      body: { name: string; username: string; email: string; password: string };
    }) => {
      try {
        return await signup(body);
      } catch (error) {
        console.error("Signup error:", error);
        return new Response(JSON.stringify({ error: "Signup failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    {
      body: t.Object({
        name: t.String(),
        username: t.String(),
        email: t.String(),
        password: t.String(),
      }),
      detail: { tags: ["Auth"] },
    },
  )
  .post(
    "/login",
    async ({ body }: { body: { handle: string; password: string } }) => {
      try {
        return await login(body);
      } catch (error) {
        console.error("Login error:", error);
        return new Response(JSON.stringify({ error: "Login failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    {
      body: t.Object({
        handle: t.String(),
        password: t.String(),
      }),
      detail: { tags: ["Auth"] },
    },
  )
  .post(
    "/refresh",
    async ({ headers }) => {
      try {
        const cookieHeader = headers.cookie;
        if (!cookieHeader) {
          console.error("No Cookie header found");
          return new Response(JSON.stringify({ error: "No refresh token found" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        
        const cookies = Object.fromEntries(
          cookieHeader.split(";").map((c) => {
            const [key, ...v] = c.trim().split("=");
            return [key, v.join("=")];
          }),
        );
        
        const token = cookies.refreshToken;
        if (!token) {
          console.error("refreshToken not found in cookies", cookies);
          return new Response(JSON.stringify({ error: "No refresh token found" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        
        console.log("Refresh token from cookie:", token);
        return await refreshToken(token);
      } catch (error) {
        console.error("Refresh token error:", error);
        return new Response(JSON.stringify({ error: "Token refresh failed" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    {
      headers: t.Object({
        cookie: t.String(),
      }),
      detail: { tags: ["Auth"] },
    },
  )
  .post(
    "/logout",
    async ({ headers }) => {
      try {
        const cookieHeader = headers.cookie;
        if (!cookieHeader) {
          return new Response(JSON.stringify({ error: "No refresh token found" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        return await logout(cookieHeader);
      } catch (error) {
        console.error("Logout error:", error);
        return new Response(JSON.stringify({ error: "Logout failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    {
      headers: t.Object({
        cookie: t.String(),
      }),
      detail: { tags: ["Auth"] },
    },
  );

export default authRouter;
