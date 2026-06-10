import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { SiteGate } from "@/components/security/SiteGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://academy.masterfabric.co"),
  title: "MasterFabric Academy — Agentic AI Developer",
  description:
    "Official academic curriculum for the end-to-end autonomous AI agent development lifecycle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteGate />
        {children}
      </body>
    </html>
  );
}
