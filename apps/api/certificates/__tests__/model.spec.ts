import {
  test,
  expect,
  mock,
  describe,
  beforeEach,
  afterEach,
  jest,
} from "bun:test";

import {
  getCertificateById,
  getCertificatesByUserId,
  getCertificateByVcHash,
  createCertificate,
  getCourseTitle,
  getEnrollment,
  getAllCertificates,
} from "../model";
import prisma from "../../prisma";

const mockCertificate = {
  id: "cert-1",
  userId: "user-1",
  studentDid: "did:example:student123",
  issuerDid: "did:example:issuer456",
  courseId: "course-1",
  vcJson: {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential"],
    credentialSubject: {
      id: "did:example:student123",
    },
  },
  vcHash: "hash123",
  nftAddress: "solana:abc123",
  createdAt: new Date("2025-01-01"),
};

const mockCertificateWithRelations = {
  ...mockCertificate,
  course: {
    id: "course-1",
    title: "Advanced TypeScript",
    description: "Learn advanced TypeScript features",
  },
  user: {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
  },
};

const mockCourse = {
  id: "course-1",
  title: "Advanced TypeScript",
};

const mockEnrollment = {
  id: "enrollment-1",
  userId: "user-1",
  courseId: "course-1",
  completed: true,
  createdAt: new Date("2025-01-01"),
};

const mockFindUnique = mock((): any => mockCertificateWithRelations);
const mockFindMany = mock((): any => [mockCertificateWithRelations]);
const mockFindFirstOrThrow = mock((): any => ({
  vcJson: mockCertificate.vcJson,
  nftAddress: mockCertificate.nftAddress,
}));
const mockCreate = mock((): any => mockCertificate);
const mockCourseFindUnique = mock((): any => mockCourse);
const mockEnrollmentFindUnique = mock((): any => mockEnrollment);

prisma.issuedCertificate.findUnique = mockFindUnique as any;
prisma.issuedCertificate.findMany = mockFindMany as any;
prisma.issuedCertificate.findFirstOrThrow = mockFindFirstOrThrow as any;
prisma.issuedCertificate.create = mockCreate as any;
prisma.course.findUnique = mockCourseFindUnique as any;
prisma.enrollment.findUnique = mockEnrollmentFindUnique as any;

beforeEach(() => {
  mockFindUnique.mockClear();
  mockFindMany.mockClear();
  mockFindFirstOrThrow.mockClear();
  mockCreate.mockClear();
  mockCourseFindUnique.mockClear();
  mockEnrollmentFindUnique.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getCertificateById", () => {
  test("should return certificate with course and user details", async () => {
    const result = await getCertificateById("cert-1");

    expect(result).toEqual(mockCertificateWithRelations);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: "cert-1" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  });

  test("should return null if certificate not found", async () => {
    mockFindUnique.mockImplementationOnce(() => null);

    const result = await getCertificateById("nonexistent-id");

    expect(result).toBeNull();
    expect(mockFindUnique).toHaveBeenCalled();
  });

  test("should handle database errors", async () => {
    const dbError = new Error("Database connection failed");
    mockFindUnique.mockImplementationOnce(() => {
      throw dbError;
    });

    await expect(getCertificateById("cert-1")).rejects.toThrow(
      "Database connection failed",
    );
  });
});

describe("getCertificatesByUserId", () => {
  test("should return all certificates for a user", async () => {
    const result = await getCertificatesByUserId("user-1");

    expect(result).toEqual([mockCertificateWithRelations]);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  test("should return empty array if user has no certificates", async () => {
    mockFindMany.mockImplementationOnce(() => []);

    const result = await getCertificatesByUserId("user-with-no-certs");

    expect(result).toEqual([]);
    expect(mockFindMany).toHaveBeenCalled();
  });

  test("should return certificates ordered by creation date descending", async () => {
    const cert1 = {
      ...mockCertificateWithRelations,
      createdAt: new Date("2025-01-01"),
    };
    const cert2 = {
      ...mockCertificateWithRelations,
      createdAt: new Date("2025-01-15"),
    };
    mockFindMany.mockImplementationOnce(() => [cert2, cert1]);

    const result = await getCertificatesByUserId("user-1");

    expect(result).toEqual([cert2, cert1]);
    expect(result[0].createdAt.getTime()).toBeGreaterThan(
      result[1].createdAt.getTime(),
    );
  });

  test("should handle database errors", async () => {
    const dbError = new Error("Database timeout");
    mockFindMany.mockImplementationOnce(() => {
      throw dbError;
    });

    await expect(getCertificatesByUserId("user-1")).rejects.toThrow(
      "Database timeout",
    );
  });
});

describe("getCertificateByVcHash", () => {
  test("should return certificate by VC hash", async () => {
    const result = await getCertificateByVcHash("hash123");

    expect(result).toEqual({
      vcJson: mockCertificate.vcJson,
      nftAddress: mockCertificate.nftAddress,
    });
    expect(mockFindFirstOrThrow).toHaveBeenCalledWith({
      where: { vcHash: "hash123" },
      select: { vcJson: true, nftAddress: true },
    });
  });

  test("should throw error if certificate not found", async () => {
    mockFindFirstOrThrow.mockImplementationOnce(() => {
      throw new Error("No IssuedCertificate found");
    });

    await expect(getCertificateByVcHash("invalid-hash")).rejects.toThrow(
      "No IssuedCertificate found",
    );
  });

  test("should only return vcJson and nftAddress fields", async () => {
    const result = await getCertificateByVcHash("hash123");

    expect(result).toHaveProperty("vcJson");
    expect(result).toHaveProperty("nftAddress");
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("userId");
  });
});

describe("createCertificate", () => {
  test("should create a new certificate", async () => {
    const certificateData = {
      userId: "user-1",
      courseId: "course-1",
      studentDid: "did:example:student123",
      issuerDid: "did:example:issuer456",
      vcJson: mockCertificate.vcJson,
      vcHash: "hash123",
      nftAddress: "solana:abc123",
    };

    const result = await createCertificate(certificateData);

    expect(result).toEqual(mockCertificate);
    expect(mockCreate).toHaveBeenCalledWith({
      data: certificateData,
    });
  });

  test("should handle database errors during creation", async () => {
    const dbError = {
      code: "P2003",
      message: "Foreign key constraint failed",
    };
    mockCreate.mockImplementationOnce(() => {
      throw dbError;
    });

    const certificateData = {
      userId: "invalid-user",
      courseId: "course-1",
      studentDid: "did:example:student123",
      issuerDid: "did:example:issuer456",
      vcJson: mockCertificate.vcJson,
      vcHash: "hash123",
      nftAddress: "solana:abc123",
    };

    await expect(createCertificate(certificateData)).rejects.toThrow(
      "Foreign key constraint failed",
    );
  });

  test("should create certificate with all required fields", async () => {
    const certificateData = {
      userId: "user-1",
      courseId: "course-1",
      studentDid: "did:example:student123",
      issuerDid: "did:example:issuer456",
      vcJson: { test: "data" },
      vcHash: "hash123",
      nftAddress: "solana:abc123",
    };

    await createCertificate(certificateData);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        courseId: "course-1",
        studentDid: "did:example:student123",
        issuerDid: "did:example:issuer456",
        vcJson: { test: "data" },
        vcHash: "hash123",
        nftAddress: "solana:abc123",
      }),
    });
  });
});

describe("getCourseTitle", () => {
  test("should return course with title", async () => {
    const result = await getCourseTitle("course-1");

    expect(result).toEqual(mockCourse);
    expect(mockCourseFindUnique).toHaveBeenCalledWith({
      where: { id: "course-1" },
      select: { title: true },
    });
  });

  test("should return null if course not found", async () => {
    mockCourseFindUnique.mockImplementationOnce(() => null);

    const result = await getCourseTitle("nonexistent-course");

    expect(result).toBeNull();
    expect(mockCourseFindUnique).toHaveBeenCalled();
  });

  test("should only select title field", async () => {
    const result = await getCourseTitle("course-1");

    expect(result).toHaveProperty("title");
    expect(result).not.toHaveProperty("description");
    expect(result).not.toHaveProperty("createdAt");
  });
});

describe("getEnrollment", () => {
  test("should return enrollment for user and course", async () => {
    const result = await getEnrollment("user-1", "course-1");

    expect(result).toEqual(mockEnrollment);
    expect(mockEnrollmentFindUnique).toHaveBeenCalledWith({
      where: {
        userId_courseId: {
          userId: "user-1",
          courseId: "course-1",
        },
      },
    });
  });

  test("should return null if enrollment not found", async () => {
    mockEnrollmentFindUnique.mockImplementationOnce(() => null);

    const result = await getEnrollment("user-1", "nonexistent-course");

    expect(result).toBeNull();
    expect(mockEnrollmentFindUnique).toHaveBeenCalled();
  });

  test("should use compound unique key for lookup", async () => {
    await getEnrollment("user-123", "course-456");

    expect(mockEnrollmentFindUnique).toHaveBeenCalledWith({
      where: {
        userId_courseId: {
          userId: "user-123",
          courseId: "course-456",
        },
      },
    });
  });

  test("should handle database errors", async () => {
    const dbError = new Error("Database error");
    mockEnrollmentFindUnique.mockImplementationOnce(() => {
      throw dbError;
    });

    await expect(getEnrollment("user-1", "course-1")).rejects.toThrow(
      "Database error",
    );
  });
});

describe("getAllCertificates", () => {
  test("should return all certificates with relations", async () => {
    const result = await getAllCertificates();

    expect(result).toEqual([mockCertificateWithRelations]);
    expect(mockFindMany).toHaveBeenCalledWith({
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  test("should return empty array if no certificates exist", async () => {
    mockFindMany.mockImplementationOnce(() => []);

    const result = await getAllCertificates();

    expect(result).toEqual([]);
  });

  test("should return certificates ordered by creation date descending", async () => {
    const cert1 = {
      ...mockCertificateWithRelations,
      id: "cert-1",
      createdAt: new Date("2025-01-01"),
    };
    const cert2 = {
      ...mockCertificateWithRelations,
      id: "cert-2",
      createdAt: new Date("2025-01-15"),
    };
    mockFindMany.mockImplementationOnce(() => [cert2, cert1]);

    const result = await getAllCertificates();

    expect(result).toEqual([cert2, cert1]);
    expect(result[0].createdAt.getTime()).toBeGreaterThan(
      result[1].createdAt.getTime(),
    );
  });

  test("should include course and user details", async () => {
    const result = await getAllCertificates();

    expect(result[0]).toHaveProperty("course");
    expect(result[0]).toHaveProperty("user");
    expect(result[0].course).toHaveProperty("title");
    expect(result[0].user).toHaveProperty("name");
  });
});
