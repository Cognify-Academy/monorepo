import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create instructor user
  const instructorPassword = await bcrypt.hash("password123", 10);
  const instructor = await prisma.user.upsert({
    where: { username: "instructor" },
    update: {},
    create: {
      name: "Test Instructor",
      username: "instructor",
      email: "instructor@test.com",
      password: instructorPassword,
    },
  });

  // Add INSTRUCTOR role
  await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: instructor.id,
        role: "INSTRUCTOR",
      },
    },
    update: {},
    create: {
      userId: instructor.id,
      role: "INSTRUCTOR",
    },
  });

  // Create student user
  const studentPassword = await bcrypt.hash("password123", 10);
  const student = await prisma.user.upsert({
    where: { username: "student" },
    update: {},
    create: {
      name: "Test Student",
      username: "student",
      email: "student@test.com",
      password: studentPassword,
    },
  });

  // Add STUDENT role
  await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: student.id,
        role: "STUDENT",
      },
    },
    update: {},
    create: {
      userId: student.id,
      role: "STUDENT",
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Test Admin",
      username: "admin",
      email: "admin@test.com",
      password: adminPassword,
    },
  });

  // Add ADMIN role
  await prisma.userRole.upsert({
    where: {
      userId_role: {
        userId: admin.id,
        role: "ADMIN",
      },
    },
    update: {},
    create: {
      userId: admin.id,
      role: "ADMIN",
    },
  });

  // Create a test course for the instructor
  const course = await prisma.course.upsert({
    where: { slug: "test-course" },
    update: {},
    create: {
      title: "Test Course",
      slug: "test-course",
      description: "This is a test course for e2e testing",
      published: true,
      userId: instructor.id,
    },
  });

  // Add instructor to course
  await prisma.courseInstructor.upsert({
    where: {
      courseId_userId: {
        courseId: course.id,
        userId: instructor.id,
      },
    },
    update: {},
    create: {
      courseId: course.id,
      userId: instructor.id,
    },
  });

  // Create a test section for the course
  const section = await prisma.section.upsert({
    where: { id: "test-section-e2e" },
    update: {},
    create: {
      id: "test-section-e2e",
      title: "Introduction Section",
      description: "An introductory section for the test course",
      courseId: course.id,
      order: 1,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("");
  console.log("Test users created:");
  console.log("  📚 Instructor:");
  console.log("     Username: instructor");
  console.log("     Password: password123");
  console.log("     Email: instructor@test.com");
  console.log("");
  console.log("  👨‍🎓 Student:");
  console.log("     Username: student");
  console.log("     Password: password123");
  console.log("     Email: student@test.com");
  console.log("");
  console.log("  👑 Admin:");
  console.log("     Username: admin");
  console.log("     Password: password123");
  console.log("     Email: admin@test.com");
  console.log("");
  console.log("  📖 Test Course:");
  console.log(`     ID: ${course.id}`);
  console.log("     Slug: test-course");
  console.log("     URL: /instructor/courses/" + course.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

