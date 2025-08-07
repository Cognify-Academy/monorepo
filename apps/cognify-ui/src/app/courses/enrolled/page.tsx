"use client";

import { EnrolledCourses } from "@/components/course-clouds";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import ReadyToLearn from "@/components/ready-to-learn";

export default function EnrolledCoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <EnrolledCourses
        title="My Enrolled Courses"
        subtitle="Continue your learning journey with these courses"
      />
      <ReadyToLearn />
      <Footer />
    </div>
  );
}
