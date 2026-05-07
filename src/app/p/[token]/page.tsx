"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Building2, CheckCircle2 } from "lucide-react";
import { use } from "react";

export default function PublicCariPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  
  // Dummy data (Normalde token ile veritabanından çekilir)
  const firmaAdi = "Örnek Ticaret A.Ş.";
  const musteriAdi = "Orhan Eymur";
  const bakiye = 5000;
  const isAlacakli = true; // Bizim alacağımız var, müşteri bize borçlu. Yani müşterinin ekranında "Borcunuz" yazacak.

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {/* Şirket Başlığı (Sade) */}
      <header className="bg-background border-b px-6 py-5 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
          <Building2 size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">{firmaAdi}</h1>
        <p className="text-sm text-muted-foreground mt-1">Cari Hesap Ekstresi</p>
      </header>

      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6">
        {/* Karşılama */}
        <div className="text-center mt-2">
          <h2 className="text-lg font-medium text-muted-foreground">Sayın {musteriAdi},</h2>
          <p className="text-sm text-muted-foreground mt-1">Güncel hesap durumunuz aşağıdadır.</p>
        </div>

        {/* Bakiye Kartı (Müşteri Gözünden) */}
        <Card className={`border-none shadow-lg text-white ${isAlacakli ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-medium opacity-90 uppercase tracking-wider mb-2">
              {isAlacakli ? 'Toplam Borcunuz' : 'Toplam Alacağınız'}
            </p>
            <div className="text-5xl font-bold tracking-tight mb-2">
              ₺{bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            {/* Eğer sıfırsa yeşil tik göster */}
            {bakiye === 0 && (
              <div className="flex items-center justify-center gap-2 mt-4 bg-white/20 w-fit mx-auto px-4 py-2 rounded-full">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Borcunuz Bulunmamaktadır</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Son İşlemler (Sadece Görüntüleme) */}
        <div>
          <h3 className="font-semibold text-lg tracking-tight mb-4 px-1 text-center md:text-left">Son Hesap Hareketleri</h3>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => {
              // Müşteri gözünden işlem yönü
              // Biz tahsilat yaptıysak müşteri ödeme yapmıştır (yeşil)
              // Biz borç yazdıysak müşteri borçlanmıştır (kırmızı)
              const isOdeme = i % 2 !== 0; 

              return (
                <Card key={i} className="border-none shadow-sm bg-background">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isOdeme ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {isOdeme ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{isOdeme ? 'Ödeme Yaptınız' : 'Fatura/Borç Kaydı'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{10 + i} Nisan 2026</p>
                      </div>
                    </div>
                    <div className={`font-bold ${isOdeme ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isOdeme ? '-' : '+'}₺{i * 1000}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Güven Bandı */}
        <div className="mt-8 text-center pb-8 opacity-50">
          <p className="text-xs font-medium">Bu ekstre <strong>Cari Takip Sistemi</strong> altyapısı ile oluşturulmuştur.</p>
        </div>
      </main>
    </div>
  );
}
