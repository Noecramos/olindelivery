import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OlinDelivery",
  description: "Peça sua comida favorita pelo WhatsApp.",
  manifest: "/manifest.json",
  icons: {
    icon: 'https://rfbwcz2lzvkh4d7s.public.blob.vercel-storage.com/olindelivery-favicon.jpg',
    apple: 'https://rfbwcz2lzvkh4d7s.public.blob.vercel-storage.com/olindelivery-favicon.jpg',
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
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
