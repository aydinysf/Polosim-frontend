import React from "react"
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "POLO SIM - Mobile App",
  description: "One Sim, One World. Get instant mobile data in 200+ countries.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
