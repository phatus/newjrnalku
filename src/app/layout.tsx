import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "newjurnalku - Jurnal Mengajar & Catatan Kinerja",
  description: "Aplikasi pencatatan jurnal mengajar dan laporan kinerja guru.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f59e0b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-slate-50 text-slate-900 antialiased")}>
        <div className="flex min-h-screen">
          <Sidebar user={user} profile={profile} />
          <main className={cn("flex-1 min-w-0 pb-24 sm:pb-0", user && "sm:pl-72")}>
            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>
          </main>
        </div>
        <MobileNav user={user} />
      </body>
    </html>
  );
}
