import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Traslados Coopelesca",
  description:
    "Aplicación de gestión de traslados para cuadrillas y bodega en Coopelesca.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>        
            <AppSidebar />
            <SidebarInset>
              <Header />
              <section className="bg-linear-to-b from-[#F0F5F9] to-[#F2F4F8] min-h-screen">
                {children}
                <Toaster />
              </section>
            </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
