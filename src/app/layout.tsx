import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";
import { readData } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Justin Solomon — OJT Portfolio | BSCpE 2-6",
  description:
    "On-the-Job Training (OJT 1) Academic & Engineering Dossier of Justin Royse L. Solomon, BS Computer Engineering 2-6, Polytechnic University of the Philippines (SY 2025–2026).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#252525",
};

interface AboutSummary {
  name: string;
  course: string;
  studentId: string;
  avatarUrl?: string;
}

interface LogSummary {
  hours: string;
}

interface RequirementSummary {
  href: string;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [about, logs, requirements] = await Promise.all([
    readData<AboutSummary>("about.json"),
    readData<LogSummary[]>("logs.json"),
    readData<RequirementSummary[]>("requirements.json"),
  ]);

  let totalHours = 0;
  for (const log of logs) {
    const match = log.hours.match(/(\d+)/);
    if (match) {
      totalHours += parseInt(match[0], 10);
    }
  }

  const submittedDocs = requirements.filter(
    (req) => Boolean(req.href && req.href !== "#")
  ).length;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#252525] text-[#f4f4f6]">
        <AppLayout
          profile={{
            name: about.name,
            course: about.course,
            studentId: about.studentId,
            avatarUrl: about.avatarUrl || "",
            totalHours,
            targetHours: 300,
            submittedDocs,
            totalDocs: requirements.length,
          }}
        >
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
