import { Elysia, t } from "elysia";
import AuthService from "../../auth/service";
import { relateConcepts, deleteRelation, patchRelation } from "./model";

const relationRouter = new Elysia({ prefix: "/relation" })
  .use(AuthService)
  .post(
    "/",
    async ({
      Auth: { hasRole },
      body,
    }: {
      Auth: { hasRole: (role: string) => boolean };
      body: {
        conceptSourceId: string;
        conceptTargetId: string;
        description: string;
        weighting: number;
      };
    }) => {
      if (!hasRole("ADMIN"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      return await relateConcepts(body);
    },
    {
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      body: t.Object({
        conceptSourceId: t.String(),
        conceptTargetId: t.String(),
        description: t.String(),
        weighting: t.Number(),
      }),
      detail: { tags: ["Edges"] },
    },
  )
  .delete(
    "/:id",
    async ({ Auth: { hasRole }, params }) => {
      if (!hasRole("ADMIN"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      return await deleteRelation(params.id);
    },
    {
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({ id: t.String() }),
      detail: { tags: ["Edges"] },
    },
  )
  .patch(
    "/:id",
    async ({
      Auth: { hasRole },
      params,
      body,
    }: {
      Auth: { hasRole: (role: string) => boolean };
      params: { id: string };
      body: { weighting: number; description: string };
    }) => {
      if (!hasRole("ADMIN"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      return await patchRelation({
        id: params.id,
        weighting: body.weighting,
        description: body.description,
      });
    },
    {
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({ id: t.String() }),
      detail: { tags: ["Edges"] },
    },
  );

export default relationRouter;
