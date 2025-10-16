"use client";

import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { useAuth } from "@/contexts/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const { signup, error, isLoading, clearError } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!formData.email.includes("@")) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await signup(
        formData.name,
        formData.username,
        formData.email,
        formData.password,
      );
      router.push("/"); // Redirect to home page to show logged-in dashboard
    } catch (error) {
      // Error is handled by the auth context
      console.error("Signup error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // Clear field-specific errors when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
  };

  return (
    <>
      <h1 className="sr-only">Sign up</h1>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/50 dark:text-red-200">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block w-full text-sm/7 font-medium text-gray-950 dark:text-white"
          >
            Full Name
          </label>
          <TextInput
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-2"
            disabled={isLoading}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="username"
            className="block w-full text-sm/7 font-medium text-gray-950 dark:text-white"
          >
            Username
          </label>
          <TextInput
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-2"
            disabled={isLoading}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="email"
            className="block w-full text-sm/7 font-medium text-gray-950 dark:text-white"
          >
            Email
          </label>
          <TextInput
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-2"
            disabled={isLoading}
          />
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {formErrors.email}
            </p>
          )}
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
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-2"
            disabled={isLoading}
            autoComplete="new-password"
          />
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {formErrors.password}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="confirmPassword"
            className="block w-full text-sm/7 font-medium text-gray-950 dark:text-white"
          >
            Confirm Password
          </label>
          <TextInput
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="mt-2"
            disabled={isLoading}
            autoComplete="new-password"
          />
          {formErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {formErrors.confirmPassword}
            </p>
          )}
        </div>

        <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Log in
        </Link>
      </div>
    </>
  );
}
