"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Building, Settings, LogOut, Bell, Shield, ChevronRight, Trash2 } from "lucide-react";

export default function ProfilPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20 pb-20 md:pb-0 md:bg-transparent">
      {/* Header */}
      <header className="sticky md:static top-0 z-10 bg-background/80 md:bg-transparent backdrop-blur-md border-b md:border-none px-4 py-3 md:p-8 md:pb-0 flex items-center justify-between">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Profil & Ayarlar</h1>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
        
        {/* Kullanıcı Profili Özet */}
        <div className="flex items-center gap-4 p-4 md:p-6 bg-background rounded-2xl border shadow-sm">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            OE
          </div>
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold">Orhan Eymur</h2>
            <p className="text-sm md:text-base text-muted-foreground">orhan@ornek.com</p>
          </div>
          <button 
            onClick={() => alert("Bu özellik MVP sürümünde henüz aktif değil.")}
            className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/20 transition-colors hidden md:block"
          >
            Profili Düzenle
          </button>
        </div>

        {/* Ayarlar Menüsü */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm md:border md:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">İşletme</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                onClick={() => alert("Bu özellik MVP sürümünde henüz aktif değil.")}
                className="flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-foreground"><Building size={20} /></div>
                  <span className="font-medium">İşletme Bilgileri</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
              <div 
                onClick={() => alert("Bu özellik MVP sürümünde henüz aktif değil.")}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-foreground"><User size={20} /></div>
                  <span className="font-medium">Kullanıcılar ve Roller</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm md:border md:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Tercihler</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-foreground"><Settings size={20} /></div>
                  <span className="font-medium">Karanlık Mod (Tema)</span>
                </div>
                <ThemeToggle />
              </div>
              <div 
                onClick={() => alert("Bu özellik MVP sürümünde henüz aktif değil.")}
                className="flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-foreground"><Bell size={20} /></div>
                  <span className="font-medium">Bildirimler</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
              <div 
                onClick={() => alert("Bu özellik MVP sürümünde henüz aktif değil.")}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg text-foreground"><Shield size={20} /></div>
                  <span className="font-medium">Güvenlik ve Şifre</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm md:border md:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Çöp Kutusu (Arşiv)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                onClick={() => window.location.href = "/profil/cop-kutusu/cariler"}
                className="flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Trash2 size={20} /></div>
                  <span className="font-medium">Silinen Cariler</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
              <div 
                onClick={() => window.location.href = "/profil/cop-kutusu/islemler"}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Trash2 size={20} /></div>
                  <span className="font-medium">Silinen İşlemler</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Çıkış Yap */}
          <button 
            onClick={() => {
              alert("Güvenli çıkış yapıldı.");
              window.location.href = "/";
            }}
            className="w-full flex items-center justify-center gap-2 p-4 mt-4 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <LogOut size={20} />
            Güvenli Çıkış Yap
          </button>
        </div>
      </main>
    </div>
  );
}
