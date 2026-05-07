"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCcw, Trash2, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getDeletedTransactions, restoreTransaction, hardDeleteTransaction } from "@/app/actions";

export default function CopKutusuIslemlerPage() {
  const [isPending, startTransition] = useTransition();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    getDeletedTransactions().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRestore = (id: string) => {
    startTransition(async () => {
      await restoreTransaction(id);
      fetchData();
    });
  };

  const handleHardDelete = (id: string) => {
    if (confirm("Bu işlemi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      startTransition(async () => {
        await hardDeleteTransaction(id);
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
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Silinen İşlemler</h1>
      </header>

      <main className="flex-1 p-4 md:px-8 mt-4 space-y-4">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-background rounded-xl border">Çöp kutusu boş.</div>
        ) : (
          transactions.map((t) => {
            let colorClass = "";
            let iconClass = "";
            let label = "";
            let isPositiveForUs = false;

            if (t.actionType === "ALACAK_EKLE") {
              colorClass = "text-indigo-600";
              iconClass = "bg-indigo-100 text-indigo-600";
              label = "Alacak Eklendi";
              isPositiveForUs = true; // DEBIT (+)
            } else if (t.actionType === "BORC_EKLE") {
              colorClass = "text-orange-600";
              iconClass = "bg-orange-100 text-orange-600";
              label = "Borç Eklendi";
              isPositiveForUs = false; // CREDIT (-)
            } else if (t.actionType === "ODEME_AL") {
              colorClass = "text-emerald-600";
              iconClass = "bg-emerald-100 text-emerald-600";
              label = "Ödeme Alındı";
              isPositiveForUs = false; // CREDIT (-)
            } else if (t.actionType === "ODEME_YAP") {
              colorClass = "text-rose-600";
              iconClass = "bg-rose-100 text-rose-600";
              label = "Ödeme Yapıldı";
              isPositiveForUs = true; // DEBIT (+)
            } else {
              const isOdeme = t.type === "CREDIT";
              colorClass = isOdeme ? "text-emerald-600" : "text-rose-600";
              iconClass = isOdeme ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600";
              label = isOdeme ? "Tahsilat Alındı" : "Borçlandırıldı";
              isPositiveForUs = !isOdeme; // DEBIT is +, CREDIT is -
            }

            return (
              <Card key={t.id} className="border-none shadow-sm md:border">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${iconClass}`}>
                      {isPositiveForUs ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                    </div>
                    <div>
                      <p className="font-bold">{t.customer?.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-sm opacity-90">{label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Silinme: {new Date(t.deletedAt).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className={`font-bold w-full md:w-24 text-right ${colorClass}`}>
                      {isPositiveForUs ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRestore(t.id)} disabled={isPending} className="p-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-50" title="Geri Yükle">
                        <RefreshCcw size={18} />
                      </button>
                      <button onClick={() => handleHardDelete(t.id)} disabled={isPending} className="p-2 text-rose-600 bg-rose-100 rounded-lg hover:bg-rose-200 disabled:opacity-50" title="Kalıcı Sil">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}
