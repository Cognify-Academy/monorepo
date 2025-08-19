"use client";

import { ContactForm } from "@/components/contact-form";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function ContactPage() {
  return (
    <div className="bg-gray-50 text-gray-800">
      <Navbar />

      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Contact Us
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Have a question, suggestion, or need support? We&apos;d love to
              hear from you. Fill out the form below and we&apos;ll get back to
              you as soon as possible.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <ContactForm
                onSuccess={(data) => {
                  // You can add toast notification here
                  console.log("Form submitted successfully:", data);
                }}
                onError={(error) => {
                  // You can add toast notification here
                  console.error("Form submission error:", error);
                }}
              />
            </div>

            <div className="mt-12 text-center">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                Other Ways to Reach Us
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">support@cognify.academy</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-medium text-gray-900">
                    Response Time
                  </h3>
                  <p className="text-gray-600">Within 24 hours</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-1 font-medium text-gray-900">
                    Help Center
                  </h3>
                  <p className="text-gray-600">Browse our FAQ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
