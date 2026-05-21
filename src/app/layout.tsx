import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import CartDrawer from "./components/CartDrawer";
import { CartProvider } from "./lib/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STORE — Essentials Reimagined",
  description:
    "Thoughtfully crafted everyday pieces, designed to last. Discover our latest collection where form meets function.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased bg-cream text-espresso">
        <CartProvider>
          <Nav />
          <main>{children}</main>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
