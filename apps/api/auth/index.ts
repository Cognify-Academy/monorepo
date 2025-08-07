import { Elysia, t } from "elysia";
import { signup, login, refreshToken, logout } from "./model";

const authRouter = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async ({
      body,
    }: {
      body: { name: string; username: string; email: string; password: string };
    }) => await signup(body),
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
    async ({ body }: { body: { handle: string; password: string } }) =>
      await login(body),
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
      const cookieHeader = headers.cookie;
      if (!cookieHeader) {
        console.error("No Cookie header found");
        throw new Error("Token not found in cookies");
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
        throw new Error("Token not found in cookies");
      }
      console.log("Refresh token from cookie:", token);
      return await refreshToken(token);
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
      const cookieHeader = headers.cookie;
      if (!cookieHeader) {
        throw new Error("Token not found in cookies");
      }
      return await logout(cookieHeader);
    },
    {
      headers: t.Object({
        cookie: t.String(),
      }),
      detail: { tags: ["Auth"] },
    },
  );

export default authRouter;
