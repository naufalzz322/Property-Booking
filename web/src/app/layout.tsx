import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { getPropertyName } from "@/lib/property";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata() {
  try {
    const propertyName = await getPropertyName();
    return {
      title: `${propertyName} - Property Management`,
      description: `Sistem manajemen properti ${propertyName}`,
    } satisfies Metadata;
  } catch {
    return {
      title: "Property Management",
      description: "Sistem manajemen properti",
    } satisfies Metadata;
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full bg-slate-50 antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
