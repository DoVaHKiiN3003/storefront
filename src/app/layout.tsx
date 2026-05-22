import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import CartDrawer from "./components/CartDrawer";
import { CartProvider } from "./lib/CartContext";
import { WishlistProvider } from "./lib/WishlistContext";
import { ThemeProvider } from "./lib/ThemeContext";
import { ReviewProvider } from "./lib/ReviewContext";
import { ToastProvider } from "./lib/ToastContext";
import { AnalyticsProvider } from "./lib/AnalyticsContext";
import { QuickViewProvider } from "./lib/QuickViewContext";
import { CurrencyProvider } from "./lib/CurrencyContext";
import QuickViewModal from "./components/QuickViewModal";
import ScrollToTop from "./components/ScrollToTop";

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
      <head>
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
      </head>
      <body className="font-sans antialiased bg-cream text-espresso">
        <ThemeProvider>
          <AnalyticsProvider>
            <WishlistProvider>
              <ReviewProvider>
                <QuickViewProvider>                    <CurrencyProvider>
                      <CartProvider>
                      <ToastProvider>
                      <Nav />
                      <main>{children}</main>
                      <CartDrawer />
                      <QuickViewModal />
                      <ScrollToTop />
                    </ToastProvider>
                  </CartProvider>
                    </CurrencyProvider>
                </QuickViewProvider>
              </ReviewProvider>
            </WishlistProvider>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
