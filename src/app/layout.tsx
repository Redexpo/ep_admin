import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "EdithPro Admin",
  description: "EdithPro Administrator Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased bg-[#F7F8FC]`}>
        <NextTopLoader color="#8c00ff" showSpinner={false} height={3} />
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
