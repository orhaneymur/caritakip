"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Plus, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  // Public (müşteri) ekranlarında menüyü gizle
  if (pathname.startsWith("/p/")) {
    return null;
  }

  const navItems = [
    { href: "/", icon: Home, label: "Ana Sayfa" },
    { href: "/cariler", icon: Users, label: "Cariler" },
    { href: "/yeni", icon: Plus, label: "Ekle", isMain: true },
    { href: "/islemler", icon: Activity, label: "İşlemler" },
    { href: "/raporlar", icon: FileText, label: "Raporlar" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t pb-safe">
      <nav className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center relative -top-5"
              >
                <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg active:scale-95 transition-transform">
                  <Icon size={28} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
