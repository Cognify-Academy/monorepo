import { Elysia, NotFoundError, t } from "elysia";
import {
  createContact,
  getContacts,
  getContact,
  updateContactStatus,
} from "./model";
import AuthService from "../auth/service";

export default new Elysia({ prefix: "/contact" })
  .use(AuthService)
  .post(
    "/",
    async ({ body }) => {
      const contact = await createContact(body);
      return {
        message: "Contact form submitted successfully",
        id: contact.id,
        createdAt: contact.createdAt.toISOString(),
      };
    },
    {
      detail: {
        tags: ["Contact"],
        description: "Submit a contact form",
      },
      body: t.Object({
        name: t.String({
          description: "Contact's full name",
          minLength: 1,
          maxLength: 100,
        }),
        email: t.String({
          description: "Contact's email address",
          format: "email",
        }),
        subject: t.String({
          description: "Subject of the message",
          minLength: 1,
          maxLength: 200,
        }),
        message: t.String({
          description: "Message content",
          minLength: 1,
          maxLength: 2000,
        }),
      }),
      response: {
        200: t.Object({
          message: t.String(),
          id: t.String(),
          createdAt: t.String(),
        }),
        400: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .get(
    "/",
    async ({
      Auth: { hasRole },
    }: {
      Auth: { hasRole: (role: string) => boolean };
    }) => {
      if (!hasRole("ADMIN")) {
        throw new Error("Unauthorized");
      }

      const contacts = await getContacts();
      return contacts.map((contact: any) => ({
        ...contact,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      }));
    },
    {
      detail: {
        tags: ["Contact"],
        description: "Get all contact submissions (Admin only)",
        security: [{ bearerAuth: [] }],
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      response: {
        200: t.Array(
          t.Object({
            id: t.String(),
            name: t.String(),
            email: t.String(),
            subject: t.String(),
            message: t.String(),
            status: t.Union([
              t.Literal("PENDING"),
              t.Literal("IN_PROGRESS"),
              t.Literal("COMPLETED"),
              t.Literal("ARCHIVED"),
            ]),
            createdAt: t.String(),
            updatedAt: t.String(),
          }),
        ),
        401: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .get(
    "/:id",
    async ({
      params,
      Auth: { hasRole },
    }: {
      params: { id: string };
      Auth: { hasRole: (role: string) => boolean };
    }) => {
      if (!hasRole("ADMIN")) {
        throw new Error("Unauthorized");
      }

      const contact = await getContact(params.id);

      if (!contact) {
        throw new NotFoundError("Contact submission not found");
      }

      return {
        ...contact,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      };
    },
    {
      detail: {
        tags: ["Contact"],
        description: "Get a specific contact submission (Admin only)",
        security: [{ bearerAuth: [] }],
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({
        id: t.String({ description: "The contact submission ID" }),
      }),
      response: {
        200: t.Object({
          id: t.String(),
          name: t.String(),
          email: t.String(),
          subject: t.String(),
          message: t.String(),
          status: t.Union([
            t.Literal("PENDING"),
            t.Literal("IN_PROGRESS"),
            t.Literal("COMPLETED"),
            t.Literal("ARCHIVED"),
          ]),
          createdAt: t.String(),
          updatedAt: t.String(),
        }),
        401: t.Object({
          error: t.String(),
        }),
        404: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .patch(
    "/:id/status",
    async ({
      params,
      body,
      Auth: { hasRole },
    }: {
      params: { id: string };
      body: { status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" };
      Auth: { hasRole: (role: string) => boolean };
    }) => {
      if (!hasRole("ADMIN")) {
        throw new Error("Unauthorized");
      }

      const contact = await updateContactStatus(params.id, body.status);

      return {
        message: "Contact status updated successfully",
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        content: contact.message,
        status: contact.status,
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      };
    },
    {
      detail: {
        tags: ["Contact"],
        description: "Update contact submission status (Admin only)",
        security: [{ bearerAuth: [] }],
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({
        id: t.String({ description: "The contact submission ID" }),
      }),
      body: t.Object({
        status: t.Union([
          t.Literal("PENDING"),
          t.Literal("IN_PROGRESS"),
          t.Literal("COMPLETED"),
          t.Literal("ARCHIVED"),
        ]),
      }),
      response: {
        200: t.Object({
          message: t.String(),
          id: t.String(),
          name: t.String(),
          email: t.String(),
          subject: t.String(),
          content: t.String(),
          status: t.Union([
            t.Literal("PENDING"),
            t.Literal("IN_PROGRESS"),
            t.Literal("COMPLETED"),
            t.Literal("ARCHIVED"),
          ]),
          createdAt: t.String(),
          updatedAt: t.String(),
        }),
        401: t.Object({
          error: t.String(),
        }),
        404: t.Object({
          error: t.String(),
        }),
      },
    },
  );
