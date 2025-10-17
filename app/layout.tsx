import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "./providers";

export const metadata: Metadata = {
  title: "Ceku.ai - AI-Powered Fitness Platform",
  description: "Create personalized workout plans with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
