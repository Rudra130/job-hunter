import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "JobPilot AI — Agentic AI Job Hunter & Career SaaS",
  description: "Autonomous multi-source job discovery, truthful resume matching, cover letter generation, and application pipeline tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
