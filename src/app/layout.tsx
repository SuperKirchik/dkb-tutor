import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Кабинет репетитора",
  description: "Рабочий кабинет для расписания, домашних заданий, материалов, прогресса и оплат.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Репетитор",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/skhool-app-icon.png",
    icon: "/skhool-app-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta name="theme-color" content="#F8FAFC" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
