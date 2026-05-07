"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, UserCircle, Plus, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();

  // Public (müşteri) ekranlarında yan menüyü gizle
  if (pathname.startsWith("/p/")) {
    return null;
  }

  const navItems = [
    { href: "/", icon: Home, label: "Ana Sayfa" },
    { href: "/cariler", icon: Users, label: "Cariler" },
    { href: "/islemler", icon: Activity, label: "İşlemler" },
    { href: "/yeni", icon: Plus, label: "Hızlı Ekle", isMain: true },
    { href: "/raporlar", icon: FileText, label: "Raporlar" },
    { href: "/profil", icon: UserCircle, label: "Profil" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 min-h-screen fixed left-0 top-0 z-40">
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">C</div>
          Cari Takip
        </h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <div key={item.href} className="pt-4 pb-2">
                <Link
                  href={item.href}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground h-12 rounded-xl shadow-md hover:bg-primary/90 transition-colors active:scale-95 font-semibold"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            OE
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Orhan E.</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
