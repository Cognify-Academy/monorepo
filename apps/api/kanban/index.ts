import { Elysia, t } from "elysia";
import AuthService from "../auth/service";
import prisma from "../prisma";
import type { $Enums } from "@prisma/client";

export default new Elysia({ prefix: "/kanban" })
  .use(AuthService)
  .post(
    "/",
    async ({ body }) => {
      const { title, column } = body;
      const card = await prisma.card.create({
        data: {
          title,
          column: column as $Enums.Column,
        },
      });
      return card;
    },
    {
      detail: { tags: ["Kanban"] },
      body: t.Object({
        title: t.String(),
        column: t.String(),
      }),
      response: {
        201: t.Object({
          id: t.String(),
          title: t.String(),
          column: t.String(),
        }),
      },
    },
  )
  .get(
    "/",
    async () => {
      return prisma.card.findMany();
    },
    {
      detail: { tags: ["Kanban"] },
      response: {
        200: t.Array(
          t.Object({
            id: t.String(),
            title: t.String(),
            column: t.String(),
          }),
        ),
      },
    },
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const { column } = body;
      const card = await prisma.card.update({
        where: { id: params.id },
        data: { column: column as $Enums.Column },
      });
      return card;
    },
    {
      detail: { tags: ["Kanban"] },
      body: t.Object({
        column: t.String(),
      }),
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({
          id: t.String(),
          title: t.String(),
          column: t.String(),
        }),
      },
    },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      const card = await prisma.card.delete({
        where: { id: params.id },
      });
      return card;
    },
    {
      detail: { tags: ["Kanban"] },
      params: t.Object({
        id: t.String(),
      }),
    },
  );
