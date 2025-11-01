import { Elysia, t } from "elysia";
import AuthService from "../auth/service";
import { issueCertificate } from "./service";
import {
  getEnrollment,
  getCertificatesByUserId,
  getCertificateByVcHash,
} from "./model";

export default new Elysia({ prefix: "/certificates" })
  .use(AuthService)
  .post(
    "/issue",
    async ({
      Auth: { user, hasRole },
      body,
      set,
    }: {
      Auth: {
        user: { id: string; roles: string[] } | null;
        hasRole: (role: string) => boolean;
      };
      body: {
        userId: string;
        courseId: string;
        studentDid: string;
        studentWallet: string;
        txSignature: string;
        nftAddress?: string;
      };
      set: any;
    }) => {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized: Authentication required" };
      }

      // Students can only issue certificates for themselves, admins can issue for anyone
      const isAdmin = hasRole("ADMIN");
      if (!isAdmin && user.id !== body.userId) {
        set.status = 403;
        return {
          error: "Forbidden: You can only issue certificates for yourself",
        };
      }

      try {
        // Check if the student has enrolled and completed the course
        const enrollment = await getEnrollment(body.userId, body.courseId);

        if (!enrollment) {
          set.status = 404;
          return { error: "Enrollment not found for this course" };
        }

        if (!enrollment.completed) {
          set.status = 403;
          return {
            error:
              "Forbidden: Course must be completed before issuing a certificate",
          };
        }

        const certificate = await issueCertificate({
          userId: body.userId,
          courseId: body.courseId,
          studentDid: body.studentDid,
          studentWallet: body.studentWallet,
          txSignature: body.txSignature,
          nftAddress: body.nftAddress,
        });

        return { success: true, certificate };
      } catch (err: any) {
        console.error("Certificate issue error:", err);
        set.status = err.message.includes("not found") ? 404 : 500;
        return { error: err.message || "Failed to issue certificate" };
      }
    },
    {
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      body: t.Object({
        userId: t.String({ description: "User ID of the student" }),
        courseId: t.String({ description: "Course ID" }),
        studentDid: t.String({
          description: "Student's DID (Decentralized Identifier)",
        }),
        nftAddress: t.Optional(
          t.String({
            description: "NFT address (optional)",
          }),
        ),
        txSignature: t.String({
          description: "Transaction signature",
        }),
        studentWallet: t.String({
          description: "Student wallet address",
        }),
      }),
      response: {
        200: t.Object({
          success: t.Boolean(),
          certificate: t.Object({
            id: t.String(),
            userId: t.String(),
            courseId: t.String(),
            studentDid: t.String(),
            issuerDid: t.String(),
            vcJson: t.Any(),
            vcHash: t.String(),
            nftAddress: t.Union([t.String(), t.Null()]),
            createdAt: t.Any(),
          }),
        }),
        401: t.Object({
          error: t.String(),
        }),
        403: t.Object({
          error: t.String(),
        }),
        404: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Certificates"],
        security: [{ bearerAuth: [] }],
        description:
          "Issue a verifiable credential certificate to a student (Students can issue for themselves after course completion, Admins can issue for anyone)",
      },
    },
  )
  .get(
    "/student/:userId",
    async ({
      Auth: { user, hasRole },
      params,
      set,
    }: {
      Auth: {
        user: { id: string; roles: string[] } | null;
        hasRole: (role: string) => boolean;
      };
      params: { userId: string };
      set: any;
    }) => {
      const isOwnProfile = user?.id === params.userId;
      const isAdmin = hasRole("ADMIN");

      if (!user || (!isOwnProfile && !isAdmin)) {
        set.status = 403;
        return { error: "Forbidden: You can only view your own certificates" };
      }

      try {
        const certs = await getCertificatesByUserId(params.userId);
        return { certificates: certs };
      } catch (err) {
        console.error("Error fetching certificates:", err);
        set.status = 500;
        return { error: "Failed to fetch certificates" };
      }
    },
    {
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({
        userId: t.String({ description: "User ID of the student" }),
      }),
      response: {
        200: t.Object({
          certificates: t.Array(
            t.Object({
              id: t.String(),
              userId: t.String(),
              courseId: t.String(),
              studentDid: t.String(),
              issuerDid: t.String(),
              vcJson: t.Any(),
              vcHash: t.String(),
              nftAddress: t.Union([t.String(), t.Null()]),
              createdAt: t.Any(),
              course: t.Object({
                id: t.String(),
                title: t.String(),
                description: t.String(),
              }),
            }),
          ),
        }),
        403: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
      detail: {
        tags: ["Certificates"],
        security: [{ bearerAuth: [] }],
        description:
          "Get all certificates for a student (Student can view own, Admin can view any)",
      },
    },
  )
  .get(
    "/verify/:vcHash",
    async ({ params }: { params: { vcHash: string } }) => {
      try {
        const certificate = await getCertificateByVcHash(params.vcHash);
        return { valid: true, certificate };
      } catch (error) {
        return { valid: false, error: "Certificate not found" };
      }
    },
    {
      params: t.Object({
        vcHash: t.String({ description: "Hash of the verifiable credential" }),
      }),
      response: {
        200: t.Object({
          valid: t.Boolean(),
          certificate: t.Optional(
            t.Object({
              vcJson: t.Any(),
              nftAddress: t.Union([t.String(), t.Null()]),
            }),
          ),
          error: t.Optional(t.String()),
        }),
      },
      detail: {
        tags: ["Certificates"],
        description:
          "Verify a verifiable credential certificate (Public endpoint - no authentication required)",
      },
    },
  );
