import { Elysia, t, error } from "elysia";
import AuthService from "../auth/service";
import { importancesRouter } from "./importances";
import relationRouter from "./relations";
import {
  createConcept,
  deleteConcept,
  getConcept,
  getConcepts,
  importConcepts,
  updateConcept,
} from "./model";

const conceptRouter = new Elysia({ prefix: "/concepts" })
  .use(AuthService)
  .use(relationRouter)
  .use(importancesRouter)
  .post(
    "/",
    async ({
      Auth: { hasRole },
      body,
    }: {
      Auth: {
        hasRole: (role: string) => boolean;
        error: (status: number, message: string) => any;
      };
      body: { name: string; description: string; importance: number };
    }) => {
      console.log("createConcept", body);
      return !hasRole("ADMIN") ? error("Forbidden") : await createConcept(body);
    },
    {
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      body: t.Object({
        name: t.String(),
        description: t.String(),
        importance: t.Number(),
      }),
      detail: { tags: ["Concepts"] },
    },
  )
  .get(
    "/",
    async () => {
      return getConcepts();
    },
    {
      detail: { tags: ["Concepts"] },
    },
  )
  .get(
    "/:slug",
    async ({ params }: { params: { slug: string } }) => {
      return await getConcept(params.slug);
    },
    {
      detail: { tags: ["Concepts"] },
    },
  )
  .post(
    "/import",
    async ({ Auth: { hasRole }, body }) => {
      if (!hasRole("ADMIN")) {
        console.log("Forbidden");
        return error("Forbidden");
      }
      return await importConcepts(body);
    },
    {
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      body: t.Array(
        t.Object({
          id: t.String(),
          name: t.String(),
          slug: t.Optional(t.String()),
          description: t.String(),
          importance: t.Number(),
          conceptSource: t.Optional(
            t.Array(
              t.Object({
                id: t.String(),
                conceptSourceId: t.String(),
                conceptTargetId: t.String(),
                description: t.String(),
                weighting: t.Number(),
              }),
            ),
          ),
          conceptTarget: t.Optional(
            t.Array(
              t.Object({
                id: t.String(),
                conceptSourceId: t.String(),
                conceptTargetId: t.String(),
                description: t.String(),
                weighting: t.Number(),
              }),
            ),
          ),
        }),
      ),
      detail: { tags: ["Concepts"] },
    },
  )
  .patch(
    "/:id",
    async ({ Auth: { hasRole }, params, body }) => {
      if (!hasRole("ADMIN")) return error("Forbidden");
      return await updateConcept({
        id: params.id,
        name: body.name,
        description: body.description,
        importance: body.importance,
      });
    },
    {
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.String(),
        description: t.String(),
        importance: t.Number(),
      }),
      detail: { tags: ["Concepts"] },
    },
  )
  .delete(
    "/:id",
    async ({ Auth: { hasRole }, params }) => {
      if (!hasRole("ADMIN")) return error("Forbidden");
      return await deleteConcept(params.id);
    },
    {
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({ id: t.String() }),
      detail: { tags: ["Concepts"] },
    },
  );
// .post(
//   "/generate-course",
//   async ({ body}) => {
//     try {
//     const concepts = await getConcepts();
//      const response = await fetch("http://localhost:11434/api/generate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         model: "llama3.2",
//         prompt: "I'm an educator and I want to generate a course about " + body.title + ". The course should be structured into sections and units. Each section and unit should have a title, an introduction, content, and the purpose (or what the student will be able to understand and/or do after studying it). Base it on this concept graph: " + JSON.stringify(concepts)
//       })
//     });
//     if (!response.body) {
//       throw new Error("Response body is null");
//     }
//     const reader = response.body.getReader();
//     const decoder = new TextDecoder();

//     let result = "";
//     while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         const raw = decoder.decode(value, { stream: true });
//         try {
//           const temp = JSON.parse(raw);
//           result += temp.response;
//         } catch (error) {
//           console.log(error)
//         }
//     }
//     console.log(result);
//     return result
//   } catch (error) {
//     console.error(error)
//     throw error;
//   }
//   },
//   {
//     body: t.Object({
//       title: t.String()
//     }),
//     detail: { tags: ["Concepts"] },
//   }
// )

export default conceptRouter;
