import { Card, CardContent } from "@/components/ui/card";
import { User, Search, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { getCustomers } from "@/app/actions";

export default async function CarilerPage() {
  const cariler = await getCustomers();

  return (
    <div className="flex flex-col gap-4 p-4 pt-8 md:p-8 h-full max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Cariler</h1>
          <p className="text-sm text-muted-foreground hidden md:block mt-1">Müşteri ve tedarikçilerinizi yönetin</p>
        </div>
        
        {/* Masaüstünde "Yeni Ekle" Butonu */}
        <Link 
          href="/cariler/yeni" 
          className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Yeni Cari Ekle
        </Link>
      </div>

      {/* Arama ve Filtreleme Alanı */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari adı, telefon veya e-posta ile ara..." 
            className="pl-9 bg-background border-none shadow-sm h-12 rounded-xl md:rounded-lg"
          />
        </div>
        <div className="hidden md:flex gap-2">
          <select className="h-12 bg-background border-none shadow-sm rounded-lg px-4 text-sm outline-none cursor-pointer">
            <option>Tümü</option>
            <option>Alacaklılar</option>
            <option>Borçlular</option>
          </select>
          <select className="h-12 bg-background border-none shadow-sm rounded-lg px-4 text-sm outline-none cursor-pointer">
            <option>Sıralama: Yeniden Eskiye</option>
            <option>Bakiyeye Göre: Artan</option>
            <option>Bakiyeye Göre: Azalan</option>
          </select>
        </div>
      </div>

      {/* Cari Listesi */}
      <div className="flex-1 overflow-auto pb-6 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {cariler.map((cari) => (
            <Link key={cari.id} href={`/cariler/${cari.id}`}>
              <Card className="border-none shadow-sm hover:bg-muted/50 hover:shadow-md transition-all bg-background h-full">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="font-semibold line-clamp-1">{cari.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Son işlem: {cari.guncellenme.toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="text-right">
                      <div className={`font-bold text-sm md:text-base ${
                        cari.type === 'alacak' ? 'text-emerald-600' : 
                        cari.type === 'borc' ? 'text-rose-600' : 'text-muted-foreground'
                      }`}>
                        {cari.type === 'borc' ? '-' : cari.type === 'alacak' ? '+' : ''}₺{cari.bakiye}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Bakiye</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/50 hidden md:block" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
