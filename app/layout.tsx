import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { QueryProvider } from "./providers/query-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <QueryProvider>
          <Providers>{children}</Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
