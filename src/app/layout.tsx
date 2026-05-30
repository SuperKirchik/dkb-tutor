import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Репетитор Онлайн",
  description: "Минималистичная платформа для репетитора и учеников",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Репетитор",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icon.svg",
    icon: "/icon.svg",
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
        <meta name="theme-color" content="#f5f7f4" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
