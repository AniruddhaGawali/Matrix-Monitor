import type { Metadata } from "next";
import "./globals.css";
import "remixicon/fonts/remixicon.css";
import QueryProvider from "@/provider/QueryProvider";
import { Toaster } from "sonner";
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Matrix Monitor",
  description: "Live Global DDoS Attack Map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jetBrainsMono.className}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
