import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import { cn } from "@/lib/utils";
import ClientLayout from "@/components/ClientLayout";

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
        <ClientLayout user={user} profile={profile}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
