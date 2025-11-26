import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "模擬タイムライン実験",
  description: "Experimental timeline simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  );
}
