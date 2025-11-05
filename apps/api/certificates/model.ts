import prisma from "../prisma";

export async function getCertificateById(id: string) {
  return await prisma.issuedCertificate.findUnique({
    where: { id },
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
}

export async function getCertificateByUserIdAndCourseId({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) {
  return await prisma.issuedCertificate.findFirst({
    where: { userId, courseId },
    select: { vcJson: true, nftAddress: true, vcHash: true },
  });
}

export async function getCertificatesByUserId(userId: string) {
  return await prisma.issuedCertificate.findMany({
    where: { userId },
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
}

export async function getCertificateByVcHash(vcHash: string) {
  return await prisma.issuedCertificate.findFirstOrThrow({
    where: { vcHash },
    select: { vcJson: true, nftAddress: true },
  });
}

export async function getCertificateByNftAddress(nftAddress: string) {
  return await prisma.issuedCertificate.findFirstOrThrow({
    where: { nftAddress },
    select: { vcJson: true, nftAddress: true, vcHash: true },
  });
}

export async function createCertificate(data: {
  userId: string;
  courseId: string;
  studentDid: string;
  issuerDid: string;
  vcJson: any;
  vcHash: string;
  nftAddress: string | null;
}) {
  return await prisma.issuedCertificate.create({
    data,
  });
}

export async function getCourseTitle(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true },
  });
  return course;
}

export async function getEnrollment(userId: string, courseId: string) {
  return await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });
}

export async function getAllCertificates() {
  return await prisma.issuedCertificate.findMany({
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
}
