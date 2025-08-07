"use client";

import { AuthProvider } from "@/contexts/auth";
import AboutPageContent from "./page-content";

export default function AboutPage() {
  return (
    <AuthProvider>
      <AboutPageContent />
    </AuthProvider>
  );
}
