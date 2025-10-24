"use client";

import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth";
import { apiClient } from "@/lib/api";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface ProfileData {
  id?: string;
  email?: string;
  username?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const { isAuthenticated, accessToken, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getProfile(accessToken);
      setProfile(response);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setError("Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthenticated && accessToken && !authLoading) {
      fetchProfile();
    }
  }, [isAuthenticated, accessToken, authLoading, fetchProfile]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Please log in to view your profile
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You need to be logged in to see your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <Navbar />

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading your profile...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && profile && (
            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
              {/* Header with Avatar */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-6 dark:border-gray-700 dark:bg-gray-700/50">
                <div className="flex items-center space-x-4">
                  <Image
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name || profile.username}`}
                    alt="Profile Avatar"
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full border-2 border-white shadow-md dark:border-gray-600"
                  />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {profile.name || "No name set"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      @{profile.username || "No username"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="px-6 py-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Full Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile.name || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Username
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile.username || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile.email || "Not provided"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      User ID
                    </dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                      {profile.id || "Not available"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Member Since
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(profile.createdAt)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Last Updated
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(profile.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

