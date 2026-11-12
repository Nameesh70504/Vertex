import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { PostHogIdentity } from "@/components/nav/auth-controls";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vertex — AI-powered learning platform",
  description:
    "Vertex is a learning platform with intelligent, grounded content search.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-neutral-900">
        <ClerkProvider>
          <PostHogIdentity />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}