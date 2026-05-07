import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, BarChart3, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { getDashboardStats } from "@/app/actions";

export default async function RaporlarPage() {
  const stats = await getDashboardStats();

  // Şimdilik sadece güncel ayı göstermek adına
  const aylikOzet = [
    { ay: "Tüm Zamanlar", tahsilat: stats.totalAlacak, odeme: stats.totalBorc },
  ];

  const maksDeger = Math.max(stats.totalAlacak, stats.totalBorc, 1000); // 0 olmaması için 1000 default

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 pb-20 md:pb-0 md:bg-transparent">
      {/* Header */}
      <header className="sticky md:static top-0 z-10 bg-background/80 md:bg-transparent backdrop-blur-md border-b md:border-none px-4 py-3 md:p-8 md:pb-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">Finansal Raporlar</h1>
          <p className="text-sm text-muted-foreground hidden md:block mt-1">İşletmenizin gelir/gider analizleri</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-background border rounded-lg text-sm px-3 py-2 outline-none cursor-pointer shadow-sm">
            <option>Tüm Zamanlar</option>
          </select>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
        
        {/* Özet İstatistikleri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-none shadow-sm md:border md:shadow-md">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full mb-2">
                <TrendingUp size={20} />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Toplam Alacak</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600 mt-1">₺{stats.totalAlacak.toLocaleString('tr-TR')}</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm md:border md:shadow-md">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-full mb-2">
                <TrendingDown size={20} />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Toplam Borç</p>
              <p className="text-lg md:text-2xl font-bold text-rose-600 mt-1">₺{stats.totalBorc.toLocaleString('tr-TR')}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm md:border md:shadow-md">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full mb-2">
                <BarChart3 size={20} />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Net Bakiye</p>
              <p className={`text-lg md:text-2xl font-bold mt-1 ${stats.netBakiye >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                {stats.netBakiye >= 0 ? '+' : '-'}₺{Math.abs(stats.netBakiye).toLocaleString('tr-TR')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm md:border md:shadow-md opacity-50">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-full mb-2">
                <Calendar size={20} />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">Vadesi Gelen</p>
              <p className="text-lg md:text-2xl font-bold text-amber-600 mt-1">Yapım Aşamasında</p>
            </CardContent>
          </Card>
        </div>

        {/* Grafik Alanı (Basit CSS Barlar) */}
        <Card className="border-none shadow-sm md:border md:shadow-md mt-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg">Aylık Tahsilat / Ödeme Grafiği</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-6">
            <div className="h-48 md:h-64 flex items-end justify-around gap-2 md:gap-4">
              {aylikOzet.map((veri, index) => {
                const tahsilatYuzde = (veri.tahsilat / maksDeger) * 100;
                const odemeYuzde = (veri.odeme / maksDeger) * 100;

                return (
                  <div key={index} className="flex flex-col items-center justify-end h-full w-full max-w-[60px]">
                    <div className="flex gap-1 md:gap-2 w-full items-end h-[85%]">
                      {/* Tahsilat Barı */}
                      <div className="w-full bg-emerald-500 rounded-t-sm relative group cursor-pointer" style={{ height: `${tahsilatYuzde}%` }}>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded transition-opacity whitespace-nowrap z-10">
                          ₺{veri.tahsilat / 1000}k
                        </div>
                      </div>
                      {/* Ödeme Barı */}
                      <div className="w-full bg-rose-500 rounded-t-sm relative group cursor-pointer" style={{ height: `${odemeYuzde}%` }}>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded transition-opacity whitespace-nowrap z-10">
                          ₺{veri.odeme / 1000}k
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground mt-3">{veri.ay}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-center gap-6 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                Tahsilat
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                Ödeme
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
