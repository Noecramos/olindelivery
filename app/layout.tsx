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
    icon: '/icon.jpg',
    apple: '/icon.jpg',
  },
  openGraph: {
    title: 'OlinDelivery',
    description: 'Peça sua comida favorita pelo WhatsApp.',
    images: ['/icon.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OlinDelivery',
    description: 'Peça sua comida favorita pelo WhatsApp.',
    images: ['/icon.jpg'],
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
