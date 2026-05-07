"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCcw, Trash2, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getDeletedCustomers, restoreCustomer, hardDeleteCustomer } from "@/app/actions";

export default function CopKutusuCarilerPage() {
  const [isPending, startTransition] = useTransition();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    getDeletedCustomers().then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRestore = (id: string) => {
    startTransition(async () => {
      await restoreCustomer(id);
      fetchData();
    });
  };

  const handleHardDelete = (id: string) => {
    if (confirm("Bu cariyi kalıcı olarak sildiğinizde, ona ait tüm geçmiş işlemler de kalıcı olarak silinir. Bu işlem geri alınamaz. Emin misiniz?")) {
      startTransition(async () => {
        await hardDeleteCustomer(id);
        fetchData();
      });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 pb-20 md:pb-0 max-w-3xl mx-auto w-full md:bg-transparent">
      <header className="sticky md:static top-0 z-10 bg-background/80 md:bg-transparent backdrop-blur-md border-b md:border-none px-4 py-3 md:p-8 md:pb-0 flex items-center gap-3">
        <Link href="/profil" className="p-2 -ml-2 rounded-full hover:bg-muted active:scale-95 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Silinen Cariler</h1>
      </header>

      <main className="flex-1 p-4 md:px-8 mt-4 space-y-4">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-background rounded-xl border">Çöp kutusu boş.</div>
        ) : (
          customers.map((c) => (
            <Card key={c.id} className="border-none shadow-sm md:border">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted rounded-full">
                    <Users size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Silinme: {new Date(c.deletedAt).toLocaleDateString("tr-TR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleRestore(c.id)} disabled={isPending} className="p-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-50" title="Geri Yükle">
                    <RefreshCcw size={18} />
                  </button>
                  <button onClick={() => handleHardDelete(c.id)} disabled={isPending} className="p-2 text-rose-600 bg-rose-100 rounded-lg hover:bg-rose-200 disabled:opacity-50" title="Kalıcı Sil">
                    <Trash2 size={18} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
