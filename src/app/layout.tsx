import React from "react";
import type { Metadata } from "next";
import "./globals.css";

import { Jersey_10, Jersey_15, Jersey_20, Jersey_25 } from "next/font/google";

const jersey10 = Jersey_10({
  subsets: ["latin"],
  weight: "400",
  variable: "--jersey-10",
  preload: true,
});
const jersey15 = Jersey_15({
  subsets: ["latin"],
  weight: "400",
  variable: "--jersey-15",
  preload: true,

});
const jersey20 = Jersey_20({
  subsets: ["latin"],
  weight: "400",
  variable: "--jersey-20",
  preload: true,

});
const jersey25 = Jersey_25({
  subsets: ["latin"],
  weight: "400",
  variable: "--jersey-25",
  preload: true,

});

export const metadata: Metadata = {
  title: "Pkm gameplay",
  description: "Pkm gameplay project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jersey10.variable} ${jersey15.variable} ${jersey20.variable} ${jersey25.variable} flex bg-GameBoy-white text-GameBoy-black`}
      >
        {children}
      </body>
    </html>
  );
}
