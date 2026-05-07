"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Edit, Loader2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getAllTransactions, updateTransaction, softDeleteTransaction } from "@/app/actions";

export default function IslemlerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Transaction State
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [editTransactionData, setEditTransactionData] = useState({ id: "", actionType: "", amount: "", description: "", dueDate: "" });

  const fetchData = () => {
    getAllTransactions().then((data) => {
      setTransactions(data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateTransaction = () => {
    startTransition(async () => {
      try {
        const parsedAmount = parseFloat(editTransactionData.amount.toString().replace(",", "."));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          alert("Lütfen geçerli bir tutar girin.");
          return;
        }

        await updateTransaction(editTransactionData.id, {
          actionType: editTransactionData.actionType,
          amount: parsedAmount,
          description: editTransactionData.description,
          dueDate: editTransactionData.dueDate ? new Date(editTransactionData.dueDate) : null,
        });
        setIsEditTransactionOpen(false);
        fetchData();
        router.refresh();
      } catch (error) {
        alert("Güncelleme başarısız. Lütfen tekrar deneyin.");
      }
    });
  };

  const openTransactionEdit = (t: any) => {
    setEditTransactionData({
      id: t.id,
      actionType: t.actionType || (t.type === "CREDIT" ? "ODEME_AL" : "ALACAK_EKLE"), // fallback if missing
      amount: t.amount.toString(),
      description: t.description || "",
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : "",
    });
    setIsEditTransactionOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Bu işlemi silmek istediğinize emin misiniz?")) {
      startTransition(async () => {
        await softDeleteTransaction(id);
        fetchData();
        router.refresh();
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  // Gruplama işlemi
  const groupedTransactions: Record<string, any[]> = {};
  
  transactions.forEach((t) => {
    // Örn: "22 Nisan 2026 Çarşamba"
    const dateStr = new Date(t.date).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
    if (!groupedTransactions[dateStr]) {
      groupedTransactions[dateStr] = [];
    }
    groupedTransactions[dateStr].push(t);
  });

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 md:bg-transparent md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
      {/* Header / App Bar */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-4 py-4 md:p-0 flex items-center gap-3 border-b md:border-none mb-0 md:mb-6">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted active:scale-95 transition-all md:bg-background md:border md:shadow-sm md:ml-0">
          <ArrowLeft size={20} className="md:w-5 md:h-5" />
        </Link>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Tüm İşlemler</h1>
      </header>

      <main className="flex-1 px-4 md:px-0 mt-4">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="p-8 text-center bg-background rounded-xl text-muted-foreground shadow-sm">Henüz işlem bulunmuyor.</div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedTransactions).map((dateKey) => (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider bg-background px-3 py-1 rounded-full border shadow-sm shrink-0">
                    {dateKey}
                  </h3>
                  <div className="h-px bg-border flex-1 w-full opacity-50" />
                </div>
                
                <div className="space-y-3">
                  {groupedTransactions[dateKey].map((t: any) => {
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
                      // Fallback
                      const isOdeme = t.type === "CREDIT";
                      colorClass = isOdeme ? "text-emerald-600" : "text-rose-600";
                      iconClass = isOdeme ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600";
                      label = isOdeme ? "Tahsilat Alındı" : "Borçlandırıldı";
                      isPositiveForUs = !isOdeme; // DEBIT is +, CREDIT is -
                    }

                    return (
                      <Card key={t.id} className="border-none shadow-sm hover:shadow-md bg-background transition-shadow">
                        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex justify-between items-start md:items-center w-full md:w-auto gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-full ${iconClass}`}>
                                {isPositiveForUs ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                              </div>
                              <div>
                                <Link href={`/cariler/${t.customerId}`} className="font-bold text-base hover:underline line-clamp-1">{t.customer?.name}</Link>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-sm opacity-90">{label}</span>
                                    {t.description && <span className="text-sm text-muted-foreground line-clamp-1">• {t.description}</span>}
                                  </div>
                                  {t.dueDate && (
                                    <div className={`text-xs font-medium ${new Date(t.dueDate) < new Date() && t.actionType !== "ODEME_AL" && t.actionType !== "ODEME_YAP" ? 'text-rose-500' : 'text-muted-foreground'}`}>
                                      Vade: {new Date(t.dueDate).toLocaleDateString('tr-TR')}
                                      {new Date(t.dueDate) < new Date() && t.actionType !== "ODEME_AL" && t.actionType !== "ODEME_YAP" && ' (Gecikti)'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Mobilde sağda tutar */}
                            <div className="flex flex-col items-end gap-1 md:hidden mt-1">
                              <div className={`font-bold text-lg ${colorClass}`}>
                                {isPositiveForUs ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => openTransactionEdit(t)} className="text-muted-foreground p-1 rounded-md hover:bg-muted active:scale-95">
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteTransaction(t.id)} disabled={isPending} className="text-rose-500 p-1 rounded-md hover:bg-rose-50 active:scale-95 disabled:opacity-50">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="hidden md:flex items-center gap-2 w-auto">
                            <div className={`font-bold text-lg w-28 text-right ${colorClass}`}>
                              {isPositiveForUs ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                            </div>
                            <button onClick={() => openTransactionEdit(t)} className="text-muted-foreground p-2 rounded-md hover:bg-muted active:scale-95 transition-colors" title="İşlemi Düzenle">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDeleteTransaction(t.id)} disabled={isPending} className="text-rose-500 p-2 rounded-md hover:bg-rose-50 active:scale-95 transition-colors disabled:opacity-50" title="İşlemi Sil">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* İşlem Düzenleme Modalı */}
      <Dialog open={isEditTransactionOpen} onOpenChange={setIsEditTransactionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>İşlemi Düzenle</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="actionType">İşlem Tipi</Label>
              <select 
                id="actionType"
                value={editTransactionData.actionType}
                onChange={(e) => setEditTransactionData({...editTransactionData, actionType: e.target.value})}
                className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer"
              >
                <option value="ALACAK_EKLE">Alacak Ekle (Bize borçlandı)</option>
                <option value="BORC_EKLE">Borç Ekle (Biz borçlandık)</option>
                <option value="ODEME_AL">Ödeme Al (Tahsilat)</option>
                <option value="ODEME_YAP">Ödeme Yap (Çıkış)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutar">Tutar *</Label>
              <Input 
                id="tutar" 
                type="number" 
                value={editTransactionData.amount} 
                onChange={(e) => setEditTransactionData({...editTransactionData, amount: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Açıklama</Label>
              <Input 
                id="desc" 
                value={editTransactionData.description} 
                onChange={(e) => setEditTransactionData({...editTransactionData, description: e.target.value})} 
              />
            </div>
            {(editTransactionData.actionType === "ALACAK_EKLE" || editTransactionData.actionType === "BORC_EKLE") && (
              <div className="space-y-2">
                <Label htmlFor="editVade">Vade Tarihi</Label>
                <Input 
                  id="editVade" 
                  type="date"
                  value={editTransactionData.dueDate} 
                  onChange={(e) => setEditTransactionData({...editTransactionData, dueDate: e.target.value})} 
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <button 
              onClick={() => setIsEditTransactionOpen(false)}
              className="px-4 py-2 border rounded-md font-medium text-sm hover:bg-muted"
            >
              İptal
            </button>
            <button 
              onClick={handleUpdateTransaction}
              disabled={isPending || !editTransactionData.amount}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Kaydet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
