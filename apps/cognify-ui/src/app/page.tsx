"use client";

import { LandingPage } from "@/components/landing-page";
import { LoggedInDashboard } from "@/components/logged-in-dashboard";
import { useAuth } from "@/contexts/auth";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <LoggedInDashboard />;
  }

  return <LandingPage />;
}
