import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { getDashboardStats } from "@/app/actions";

export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-6 p-4 pt-8 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hoş Geldiniz</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">İşletmenizin finansal özeti</p>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          {/* Sadece mobilde görünen header araçları (Masaüstünde sidebar'da var) */}
          <ThemeToggle />
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-semibold text-primary">OE</span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <Card className={`text-primary-foreground border-none shadow-lg md:col-span-1 h-full ${stats.totalKasa >= 0 ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-rose-600 shadow-rose-600/20'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-90">Kasa (Banka & Nakit)</CardTitle>
            <Wallet className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent className="h-[calc(100%-60px)] flex flex-col justify-end">
            <div className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
              {stats.totalKasa < 0 ? '-' : ''}₺{Math.abs(stats.totalKasa).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs opacity-80 mt-2 font-medium bg-white/10 w-fit px-2 py-1 rounded-md">
              {stats.totalKasa >= 0 ? 'Kasadaki Mevcut Para' : 'Kasa Ekside (Açık)'}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:col-span-2">
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground">Toplam Alacak</CardTitle>
              <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-3xl font-bold text-emerald-600 mt-2">₺{stats.totalAlacak.toLocaleString('tr-TR')}</div>
              <p className="text-xs text-muted-foreground mt-2 hidden md:block">Ödenmesi beklenen toplam tutar</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs md:text-sm font-semibold text-muted-foreground">Toplam Borç</CardTitle>
              <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-3xl font-bold text-rose-600 mt-2">₺{stats.totalBorc.toLocaleString('tr-TR')}</div>
              <p className="text-xs text-muted-foreground mt-2 hidden md:block">Ödenecek toplam tutar</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* İçerik Izgarası (Masaüstünde 2 sütun) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Son İşlemler */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg tracking-tight">Son İşlemler</h2>
            <Link href="/raporlar" className="text-xs text-primary font-semibold cursor-pointer px-2 py-1 rounded-md hover:bg-primary/10 transition-colors">Tümünü Gör</Link>
          </div>
          
          {stats.recentTransactions.length === 0 ? (
            <div className="p-8 text-center bg-background rounded-xl text-muted-foreground shadow-sm">Henüz işlem bulunmuyor.</div>
          ) : (
            <div className="space-y-3">
              {stats.recentTransactions.map((t: any) => {
                let colorClass = "";
                let bgClass = "";
                let label = "";
                let isPositiveForUs = false;

                if (t.actionType === "ALACAK_EKLE") {
                  colorClass = "text-indigo-600";
                  bgClass = "bg-indigo-100 text-indigo-600";
                  label = "Alacak Eklendi";
                  isPositiveForUs = true;
                } else if (t.actionType === "BORC_EKLE") {
                  colorClass = "text-orange-600";
                  bgClass = "bg-orange-100 text-orange-600";
                  label = "Borç Eklendi";
                  isPositiveForUs = false;
                } else if (t.actionType === "ODEME_AL") {
                  colorClass = "text-emerald-600";
                  bgClass = "bg-emerald-100 text-emerald-600";
                  label = "Ödeme Alındı";
                  isPositiveForUs = true;
                } else if (t.actionType === "ODEME_YAP") {
                  colorClass = "text-rose-600";
                  bgClass = "bg-rose-100 text-rose-600";
                  label = "Ödeme Yapıldı";
                  isPositiveForUs = false;
                } else {
                  // Fallback
                  const isOdeme = t.type === "CREDIT";
                  colorClass = isOdeme ? "text-emerald-600" : "text-rose-600";
                  bgClass = isOdeme ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600";
                  label = isOdeme ? "Tahsilat Alındı" : "Borçlandırıldı";
                  isPositiveForUs = isOdeme;
                }

                return (
                  <Card key={t.id} className="border-none shadow-sm bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center ${bgClass}`}>
                          {isPositiveForUs ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm md:text-base">{t.customer?.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{label} • {new Date(t.date).toLocaleDateString("tr-TR")}</p>
                        </div>
                      </div>
                      <div className={`font-bold md:text-lg ${colorClass}`}>
                        {isPositiveForUs ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sağ Kolon: Hızlı Aksiyonlar & Vade Yaklaşanlar */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary/5 border border-primary/10 hidden lg:block">
            <CardHeader>
              <CardTitle className="text-lg">Hızlı Aksiyonlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/cariler/yeni" className="w-full flex items-center justify-between p-3 bg-background rounded-xl hover:bg-muted transition-colors shadow-sm text-sm font-semibold">
                Yeni Cari Ekle
                <span className="text-muted-foreground">+</span>
              </Link>
              <Link href="/yeni" className="w-full flex items-center justify-between p-3 bg-background rounded-xl hover:bg-muted transition-colors shadow-sm text-sm font-semibold">
                Yeni İşlem Ekle
                <span className="text-primary">+</span>
              </Link>
              <Link href="/raporlar" className="w-full flex items-center justify-between p-3 bg-background rounded-xl hover:bg-muted transition-colors shadow-sm text-sm font-semibold">
                Raporları Gör
                <span className="text-indigo-600">→</span>
              </Link>
            </CardContent>
          </Card>

          {/* Vadesi Yaklaşanlar */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight px-1 flex items-center gap-2">
              <span className="bg-rose-500 w-2 h-2 rounded-full animate-pulse"></span>
              Vade Takibi
            </h2>
            {stats.upcomingTransactions.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-xl text-center">
                Vadesi gelen veya geciken işlem yok.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.upcomingTransactions.slice(0, 5).map((t: any) => {
                  const isOverdue = new Date(t.dueDate) < new Date();
                  const isBorc = t.actionType === "BORC_EKLE"; // Bizim borcumuz
                  return (
                    <Card key={t.id} className={`border border-l-4 ${isOverdue ? 'border-l-rose-500' : 'border-l-amber-500'} shadow-sm bg-background hover:bg-muted/50 transition-colors`}>
                      <CardContent className="p-3 flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <Link href={`/cariler/${t.customerId}`} className="font-semibold text-sm hover:underline">{t.customer?.name}</Link>
                          <span className={`font-bold text-sm ${isBorc ? 'text-orange-600' : 'text-indigo-600'}`}>
                            {isBorc ? 'Ödememiz' : 'Alacağımız'}: ₺{t.amount.toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{t.description || (isBorc ? "Borç" : "Alacak")}</span>
                          <span className={`font-medium px-2 py-0.5 rounded-full ${isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {new Date(t.dueDate).toLocaleDateString('tr-TR')} {isOverdue && '(Gecikti)'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
