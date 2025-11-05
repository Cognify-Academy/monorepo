import { AuthProvider } from "@/contexts/auth";
import { SolanaWalletProvider } from "@/contexts/solana-wallet";
import { clsx } from "clsx";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
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
        "scroll-pt-16 font-sans antialiased",
      )}
    >
      <body className="bg-white dark:bg-gray-950">
        <AuthProvider>
          <SolanaWalletProvider>
            <div className="isolate bg-white dark:bg-gray-950">{children}</div>
          </SolanaWalletProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
