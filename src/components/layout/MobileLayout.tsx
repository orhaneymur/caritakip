"use client";

import { usePathname } from "next/navigation";
import { BottomNavigation } from "./BottomNavigation";
import { Sidebar } from "./Sidebar";

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname.startsWith("/p/");

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Masaüstü Yan Menü */}
      {!isPublic && <Sidebar />}

      {/* 
        Ana İçerik Konteyneri 
        Mobilde: max-w-md, ortalanmış.
        Masaüstünde: Yan menünün sağında, tüm alanı kaplar.
      */}
      <div className={`flex-1 flex justify-center ${isPublic ? '' : 'md:pl-64 md:justify-start'}`}>
        <div className={`w-full min-h-screen relative ${isPublic ? 'max-w-2xl mx-auto shadow-2xl border-x bg-background' : 'max-w-md md:max-w-6xl bg-background md:bg-transparent shadow-xl md:shadow-none border-x md:border-none pb-20 md:pb-0'}`}>
          <main className={`min-h-screen flex flex-col ${isPublic ? '' : 'md:p-6'}`}>{children}</main>
          {!isPublic && <BottomNavigation />}
        </div>
      </div>
    </div>
  );
}
