import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Firechat",
  description: "A fire application to chat with your friends",
};
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased grainy",
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
};
export default RootLayout;
