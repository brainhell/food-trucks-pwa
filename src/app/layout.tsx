import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "FoodTruck Hub",
  description: "Sistema de gestión colaborativa para comunidades de Food Trucks",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FoodTruck Hub",
  },
  icons: {
    apple: "/icons/logo.svg",
  },
};

export const viewport = {
  themeColor: "#FF6B35",
};

import InstallPrompt from "@/components/InstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased transition-colors duration-300`}>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
