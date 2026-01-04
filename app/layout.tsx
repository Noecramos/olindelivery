import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "./context/CartContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OlinDelivery",
  description: "Peça sua comida favorita pelo WhatsApp.",
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.ico',
    apple: '/splash-logo.png', // Using the high res image for apple touch icon equivalent
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF4D00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <CartProvider>
          <div className="container">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
