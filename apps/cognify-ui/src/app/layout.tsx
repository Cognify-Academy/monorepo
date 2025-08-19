import { AuthProvider } from "@/contexts/auth";
import { clsx } from "clsx";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import React from "react";
import "./globals.css";

const InterVariable = localFont({
  variable: "--font-inter",
  src: [
    { path: "./InterVariable.woff2", style: "normal" },
    { path: "./InterVariable-Italic.woff2", style: "italic" },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RootLayout({ children }: { children: any }) {
  return (
    <html
      lang="en"
      className={clsx(
        GeistMono.variable,
        InterVariable.variable,
        "scroll-pt-16 font-sans antialiased dark:bg-gray-950",
      )}
    >
      <body>
        <AuthProvider>
          <div className="isolate">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
