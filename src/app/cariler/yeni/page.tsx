"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { createCustomer } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function YeniCariPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [bakiyeType, setBakiyeType] = useState<"BORCLU" | "ALACAKLI">("BORCLU");
  const [initialBalance, setInitialBalance] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      alert("Lütfen Cari Unvanı / Ad Soyad giriniz.");
      return;
    }

    startTransition(async () => {
      try {
        await createCustomer({
          name,
          phone,
          email,
          address,
          type: bakiyeType,
          initialBalance: parseFloat(initialBalance) || 0,
        });
        alert("Cari hesap başarıyla oluşturuldu.");
        router.push("/cariler");
      } catch (error) {
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        console.error(error);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 pb-20 md:pb-0 md:bg-transparent">
      {/* Header */}
      <header className="sticky md:static top-0 z-10 bg-background/80 md:bg-transparent backdrop-blur-md border-b md:border-none px-4 py-3 md:p-8 md:pb-0 flex items-center justify-between">
        <div className="flex items-center gap-3 w-full md:max-w-2xl md:mx-auto">
          <Link href="/cariler" className="p-2 -ml-2 rounded-full hover:bg-muted active:scale-95 transition-all md:bg-background md:border md:shadow-sm md:ml-0">
            <ArrowLeft size={24} className="md:w-5 md:h-5" />
          </Link>
          <h1 className="text-lg md:text-2xl font-bold tracking-tight">Yeni Cari Ekle</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-start md:justify-center">
        <div className="w-full max-w-full md:max-w-2xl">
          <Card className="border-none shadow-md md:border md:shadow-lg">
            <CardHeader className="hidden md:flex flex-row items-center gap-3 pb-2 border-b mb-6">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <UserPlus size={24} />
              </div>
              <div>
                <CardTitle className="text-lg">Müşteri veya Tedarikçi Bilgileri</CardTitle>
                <p className="text-sm text-muted-foreground">Yeni bir cari hesap açmak için formu doldurun</p>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 space-y-5 md:space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="isim" className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cari Unvanı / Ad Soyad *</Label>
                <Input 
                  id="isim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: ABC Teknoloji veya Ahmet Yılmaz"
                  className="h-14 bg-muted/50 border-none rounded-xl focus-visible:ring-primary md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="telefon" className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Telefon</Label>
                  <Input 
                    id="telefon"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="h-14 bg-muted/50 border-none rounded-xl focus-visible:ring-primary md:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eposta" className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">E-posta</Label>
                  <Input 
                    id="eposta"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@firma.com"
                    className="h-14 bg-muted/50 border-none rounded-xl focus-visible:ring-primary md:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adres" className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Adres</Label>
                <Input 
                  id="adres"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Açık adres bilgisi"
                  className="h-14 bg-muted/50 border-none rounded-xl focus-visible:ring-primary md:text-base"
                />
              </div>

              {/* Başlangıç Bakiyesi Opsiyonel */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="bakiye" className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Başlangıç Bakiyesi (İsteğe Bağlı)</Label>
                <div className="flex gap-3">
                  <select 
                    value={bakiyeType}
                    onChange={(e) => setBakiyeType(e.target.value as any)}
                    className="h-14 px-4 rounded-xl border-none bg-muted/50 text-base focus:ring-2 focus:ring-primary outline-none cursor-pointer w-1/3"
                  >
                    <option value="BORCLU">Borçlu</option>
                    <option value="ALACAKLI">Alacaklı</option>
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">₺</span>
                    <Input 
                      id="bakiye"
                      type="number"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      placeholder="0.00"
                      className="pl-10 h-14 font-bold bg-muted/50 border-none rounded-xl focus-visible:ring-primary md:text-lg"
                    />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Kaydet Butonu */}
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="mt-6 w-full h-14 md:h-16 rounded-xl flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-lg md:text-xl hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isPending ? <Loader2 size={24} className="animate-spin md:w-6 md:h-6" /> : <Save size={24} className="md:w-6 md:h-6" />}
            {isPending ? "Kaydediliyor..." : "Cari Hesabı Oluştur"}
          </button>
        </div>
      </main>
    </div>
  );
}
