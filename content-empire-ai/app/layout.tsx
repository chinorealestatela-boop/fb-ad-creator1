import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Empire AI",
  description: "Autonomous AI-powered social media management. Upload thousands of content pieces and let AI analyze, schedule, caption, and publish across all platforms.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
