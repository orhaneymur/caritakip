"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTransaction, getCustomers } from "@/app/actions";

export default function YeniIslemPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [islemTipi, setIslemTipi] = useState<"ALACAK_EKLE" | "BORC_EKLE" | "ODEME_AL" | "ODEME_YAP">("ODEME_AL");
  const [tutar, setTutar] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCustomers().then((data) => {
      setCustomers(data);
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  const handleSave = () => {
    if (!customerId) {
      alert("Lütfen bir cari seçiniz.");
      return;
    }
    const amount = parseFloat(tutar.toString().replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      alert("Lütfen geçerli bir tutar giriniz.");
      return;
    }

    startTransition(async () => {
      try {
        let type: "DEBIT" | "CREDIT" = "CREDIT";
        if (islemTipi === "ALACAK_EKLE" || islemTipi === "ODEME_YAP") {
          type = "DEBIT";
        }
        
        await createTransaction({
          customerId,
          type,
          actionType: islemTipi,
          amount,
          description: aciklama,
          dueDate: dueDate ? new Date(dueDate) : null,
        });
        alert("İşlem başarıyla kaydedildi.");
        router.push("/cariler");
      } catch (error) {
        alert("Bir hata oluştu.");
        console.error(error);
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 pb-20 md:pb-0 md:bg-transparent">
      {/* Header (Mobilde yapışkan, masaüstünde normal başlık) */}
      <header className="sticky md:static top-0 z-10 bg-background/80 md:bg-transparent backdrop-blur-md border-b md:border-none px-4 py-3 md:p-8 md:pb-0 flex items-center justify-between">
        <div className="flex items-center gap-3 w-full md:max-w-2xl md:mx-auto">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted active:scale-95 transition-all md:bg-background md:border md:shadow-sm md:ml-0">
            <ArrowLeft size={24} className="md:w-5 md:h-5" />
          </Link>
          <h1 className="text-lg md:text-2xl font-bold tracking-tight">Yeni İşlem Ekle</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 items-center justify-start md:justify-center">
        {/* Masaüstünde ortalanmış genişlikte kapsayıcı */}
        <div className="w-full max-w-full md:max-w-2xl flex flex-col gap-6">
          
          {/* İşlem Tipi Seçimi */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIslemTipi("ALACAK_EKLE")}
              className={`py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
                islemTipi === "ALACAK_EKLE" 
                  ? "bg-indigo-500 text-white border-indigo-600 shadow-md" 
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Alacak Ekle <br/> <span className="text-[10px] md:text-xs opacity-80 font-normal mt-0.5 block">(Bize borçlandı)</span>
            </button>
            <button
              onClick={() => setIslemTipi("BORC_EKLE")}
              className={`py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
                islemTipi === "BORC_EKLE" 
                  ? "bg-orange-500 text-white border-orange-600 shadow-md" 
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Borç Ekle <br/> <span className="text-[10px] md:text-xs opacity-80 font-normal mt-0.5 block">(Biz borçlandık)</span>
            </button>
            <button
              onClick={() => setIslemTipi("ODEME_AL")}
              className={`py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
                islemTipi === "ODEME_AL" 
                  ? "bg-emerald-500 text-white border-emerald-600 shadow-md" 
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Ödeme Al <br/> <span className="text-[10px] md:text-xs opacity-80 font-normal mt-0.5 block">(Kasaya giren)</span>
            </button>
            <button
              onClick={() => setIslemTipi("ODEME_YAP")}
              className={`py-3 px-3 md:px-4 rounded-xl text-xs md:text-sm font-semibold transition-all border ${
                islemTipi === "ODEME_YAP" 
                  ? "bg-rose-500 text-white border-rose-600 shadow-md" 
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Ödeme Yap <br/> <span className="text-[10px] md:text-xs opacity-80 font-normal mt-0.5 block">(Kasadan çıkan)</span>
            </button>
          </div>

          {/* Form Alanı */}
          <Card className="border-none shadow-md md:border md:shadow-lg">
            <CardHeader className="hidden md:block pb-0">
              <CardTitle className="text-lg text-muted-foreground">İşlem Detayları</CardTitle>
            </CardHeader>
            <CardContent className="p-5 md:p-6 space-y-6 md:space-y-8">
              
              {/* Cari Seçimi */}
              <div className="space-y-2">
                <Label htmlFor="cari" className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cari Seç *</Label>
                <select 
                  id="cari" 
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full h-14 md:h-16 px-4 rounded-xl border bg-muted/50 text-base focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer disabled:opacity-50"
                  disabled={isLoading}
                >
                  <option value="">{isLoading ? "Cariler yükleniyor..." : "Müşteri veya Tedarikçi Seçin..."}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Tutar Girişi */}
              <div className="space-y-2">
                <Label htmlFor="tutar" className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tutar *</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-bold text-muted-foreground">₺</span>
                  <Input 
                    id="tutar"
                    type="number" 
                    placeholder="0.00"
                    value={tutar}
                    onChange={(e) => setTutar(e.target.value)}
                    className="pl-10 md:pl-12 h-16 md:h-20 text-2xl md:text-4xl font-bold bg-muted/50 border-none rounded-xl focus-visible:ring-primary"
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div className="space-y-2">
                <Label htmlFor="aciklama" className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Açıklama (İsteğe Bağlı)</Label>
                <Input 
                  id="aciklama"
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                  placeholder="Örn: Nisan ayı taksiti"
                  className="h-14 md:h-16 bg-muted/50 border-none rounded-xl focus-visible:ring-primary md:text-base"
                />
              </div>

              {/* Vade Tarihi (Sadece Borç/Alacak ekleniyorsa) */}
              {(islemTipi === "ALACAK_EKLE" || islemTipi === "BORC_EKLE") && (
                <div className="space-y-2">
                  <Label htmlFor="vade" className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Vade Tarihi (İsteğe Bağlı)</Label>
                  <Input 
                    id="vade"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-14 md:h-16 bg-muted/50 border-none rounded-xl focus-visible:ring-primary md:text-base cursor-pointer"
                  />
                </div>
              )}

              {/* Görsel/Kanıt Ekleme */}
              <div className="space-y-2 pt-2 md:pt-4 border-t">
                <Label className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Görsel / Makbuz Ekle (Demo)</Label>
                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2">
                  <label className="flex flex-col items-center justify-center h-24 md:h-32 border-2 border-dashed rounded-xl border-muted-foreground/30 hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-colors active:scale-95 bg-background">
                    <input type="file" accept="image/*" capture="environment" className="hidden" />
                    <Camera className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground mb-2" />
                    <span className="text-xs md:text-sm font-medium text-muted-foreground">Kamera Aç</span>
                  </label>
                  <label className="flex flex-col items-center justify-center h-24 md:h-32 border-2 border-dashed rounded-xl border-muted-foreground/30 hover:bg-muted/50 hover:border-primary/50 cursor-pointer transition-colors active:scale-95 bg-background">
                    <input type="file" accept="image/*" className="hidden" />
                    <ImageIcon className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground mb-2" />
                    <span className="text-xs md:text-sm font-medium text-muted-foreground">Galeriden Seç</span>
                  </label>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Kaydet Butonu */}
          <button 
            onClick={handleSave}
            disabled={isPending}
            className={`h-14 md:h-16 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg md:text-xl active:scale-95 transition-transform shadow-lg disabled:opacity-70 disabled:pointer-events-none ${
              islemTipi === "ODEME_AL" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : 
              islemTipi === "ODEME_YAP" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20" : 
              islemTipi === "ALACAK_EKLE" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" : 
              "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20"
            }`}
          >
            {isPending ? <Loader2 size={24} className="animate-spin md:w-7 md:h-7" /> : <Check size={24} className="md:w-7 md:h-7" />}
            {isPending ? "Kaydediliyor..." : "İşlemi Kaydet"}
          </button>
        </div>
      </main>
    </div>
  );
}
