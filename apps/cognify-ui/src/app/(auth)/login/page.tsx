"use client";

import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { useAuth } from "@/contexts/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { login, error, isLoading, clearError } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    handle: "",
    password: "",
  });

  useEffect(() => {
    document.title = "Login - Cognify Academy";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData.handle, formData.password);
      router.push("/"); // Redirect to home page to show logged-in dashboard
    } catch (error) {
      // Error is handled by the auth context
      console.error("Login error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <h1 className="sr-only">Login</h1>
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/50 dark:text-red-200"
            data-testid="email-error"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="handle"
            className="block w-full text-sm/7 font-medium text-gray-950 dark:text-white"
          >
            Email or Username
          </label>
          <TextInput
            type="text"
            id="handle"
            name="handle"
            data-testid="email-input"
            value={formData.handle}
            onChange={handleChange}
            required
            className="mt-2"
            disabled={isLoading}
            autoComplete="username"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="password"
            className="block w-full text-sm/7 font-medium text-gray-950 dark:text-white"
          >
            Password
          </label>
          <TextInput
            type="password"
            id="password"
            name="password"
            data-testid="password-input"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-2"
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={isLoading}
          data-testid="login-button"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Sign up
        </Link>
      </div>
    </>
  );
}
