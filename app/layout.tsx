import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "./context/cartContext";
import { Header } from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { ToastProvider } from "./components/overlays/toast/toast";
import ScrollToTop from "./components/scrollToTop/scrolltoTop";
import ScrollToTopButton from "./components/scrollToTop/scropptoTopButton/scrolltopTopButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vismayam Arts",
  description: "Shop collections from Vismayam Arts.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // No API calls at build time: all product data loads live in the browser.
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider
          position="top-right"
          defaultDuration={4000}
          maxToasts={5}
        >
          <CartProvider>
            <ScrollToTop />
            <Header />
            {children}
            <Footer />
            <ScrollToTopButton />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}