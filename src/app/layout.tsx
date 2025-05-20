import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shashank Dwivedi - Software Engineer",
  description: "Portfolio of Shashank Dwivedi, a Software Engineer specializing in full-stack development.",
  icons: {
    icon: { url: '/sd-favicon.svg', type: 'image/svg+xml' }, 
    // apple: '/apple-icon.png', // You can add this later if you create one
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>
      <body className={`${inter.className} bg-[#00040F] text-white antialiased`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
