"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Phone, Mail, MapPin, MoreVertical, Image as ImageIcon, Edit, Trash2, Share2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { use, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCustomerById, updateCustomer, updateTransaction, softDeleteCustomer, softDeleteTransaction } from "@/app/actions";

export default function CariDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Edit Customer State
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState({ name: "", phone: "", email: "", address: "" });

  // Edit Transaction State
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [editTransactionData, setEditTransactionData] = useState({ id: "", actionType: "", amount: "", description: "", dueDate: "" });

  useEffect(() => {
    getCustomerById(resolvedParams.id).then((data) => {
      setCustomer(data);
      if (data) {
        setEditCustomerData({
          name: data.name,
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
        });
      }
      setLoading(false);
    }).catch(console.error);
  }, [resolvedParams.id]);

  const handleShare = () => {
    alert(`Müşteri paylaşım linki kopyalandı:\nhttp://localhost:3000/p/${resolvedParams.id}`);
  };

  const handleUpdateCustomer = () => {
    startTransition(async () => {
      try {
        await updateCustomer(resolvedParams.id, editCustomerData);
        setIsEditCustomerOpen(false);
        // Refresh local data
        const updated = await getCustomerById(resolvedParams.id);
        setCustomer(updated);
        router.refresh();
      } catch (error) {
        alert("Güncelleme başarısız.");
      }
    });
  };

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
        // Refresh local data
        const updated = await getCustomerById(resolvedParams.id);
        setCustomer(updated);
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

  const handleDeleteCustomer = () => {
    if (confirm("Bu cariyi silmek istediğinize emin misiniz?")) {
      startTransition(async () => {
        await softDeleteCustomer(resolvedParams.id);
        router.push("/cariler");
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Bu işlemi silmek istediğinize emin misiniz?")) {
      startTransition(async () => {
        await softDeleteTransaction(id);
        const updated = await getCustomerById(resolvedParams.id);
        setCustomer(updated);
        router.refresh();
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  }

  if (!customer) {
    return <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <h2 className="text-xl font-bold">Cari bulunamadı</h2>
      <Link href="/cariler" className="text-primary underline">Listeye Dön</Link>
    </div>;
  }

  const isAlacakli = customer.type === "alacak";
  const isBorclu = customer.type === "borc";

  return (
    <div className="flex flex-col min-h-screen bg-muted/20 md:bg-transparent md:p-8 max-w-7xl mx-auto w-full">
      {/* Header / App Bar (Mobilde yapışkan, masaüstünde normal başlık) */}
      <header className="sticky md:static top-0 z-20 bg-background/80 md:bg-transparent backdrop-blur-md border-b md:border-none px-4 py-3 md:p-0 flex items-center justify-between mb-0 md:mb-6">
        <div className="flex items-center gap-3">
          <Link href="/cariler" className="p-2 -ml-2 rounded-full hover:bg-muted active:scale-95 transition-all md:bg-background md:border md:shadow-sm md:ml-0">
            <ArrowLeft size={20} className="md:w-5 md:h-5" />
          </Link>
          <h1 className="text-lg md:text-2xl font-bold tracking-tight">Cari Detayı</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <Share2 size={16} /> 
            <span className="hidden md:inline">Müşteriyle Paylaş</span>
          </button>
          <button 
            onClick={() => setIsEditCustomerOpen(true)}
            className="hidden md:flex items-center gap-2 bg-background border px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted transition-colors"
          >
            <Edit size={16} /> Düzenle
          </button>
          <button 
            onClick={handleDeleteCustomer}
            disabled={isPending}
            className="hidden md:flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} /> Sil
          </button>
          <button className="p-2 -mr-2 md:hidden rounded-full hover:bg-muted active:scale-95 transition-all">
            <MoreVertical size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Sol Kolon (Profil ve İletişim) - Masaüstünde yapışkan (sticky) yapılabilir */}
          <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-4 md:sticky md:top-6 md:h-fit">
            {/* Hero Section - Bakiye Kartı */}
            <div className={`p-6 pb-8 md:pb-6 rounded-b-3xl md:rounded-2xl text-white shadow-lg ${
              isAlacakli ? 'bg-emerald-600 md:bg-emerald-600' : isBorclu ? 'bg-rose-600 md:bg-rose-600' : 'bg-slate-600 md:bg-slate-700'
            }`}>
              <div className="text-center mt-2 md:mt-0">
                <h2 className="text-xl md:text-2xl font-bold opacity-95">{customer.name}</h2>
                <p className="text-sm md:text-xs opacity-80 mt-1 font-medium">NET BAKİYE</p>
                <div className="text-4xl md:text-3xl lg:text-4xl font-bold tracking-tight mt-2 mb-4">
                  {isAlacakli ? '+' : isBorclu ? '-' : ''}₺{customer.bakiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex justify-center gap-3 text-sm md:text-xs font-medium flex-wrap">
                  <div className="bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <span className="opacity-75 mr-1">Borç:</span> ₺{customer.totalDebit.toLocaleString('tr-TR')}
                  </div>
                  <div className="bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <span className="opacity-75 mr-1">Alacak:</span> ₺{customer.totalCredit.toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="px-4 -mt-4 relative z-10 md:px-0 md:mt-0">
              <Card className="border-none md:border shadow-md md:shadow-sm">
                <CardContent className="p-4 grid grid-cols-3 md:flex md:flex-col divide-x md:divide-x-0 md:divide-y text-center md:text-left gap-0 md:gap-2">
                  <button className="flex flex-col md:flex-row items-center gap-2 p-2 md:p-3 text-primary md:text-foreground hover:bg-muted/50 rounded-lg transition-colors group">
                    <div className="md:bg-primary/10 md:p-2 rounded-md group-hover:bg-primary/20 transition-colors">
                      <Phone size={20} className="md:text-primary md:w-4 md:h-4" />
                    </div>
                    <span className="text-xs md:text-sm font-medium">{customer.phone || "-"}</span>
                  </button>
                  <button className="flex flex-col md:flex-row items-center gap-2 p-2 md:p-3 text-primary md:text-foreground hover:bg-muted/50 rounded-lg transition-colors group">
                    <div className="md:bg-primary/10 md:p-2 rounded-md group-hover:bg-primary/20 transition-colors">
                      <Mail size={20} className="md:text-primary md:w-4 md:h-4" />
                    </div>
                    <span className="text-xs md:text-sm font-medium truncate w-full md:w-auto">{customer.email || "-"}</span>
                  </button>
                  <button className="flex flex-col md:flex-row items-center gap-2 p-2 md:p-3 text-primary md:text-foreground hover:bg-muted/50 rounded-lg transition-colors group">
                    <div className="md:bg-primary/10 md:p-2 rounded-md group-hover:bg-primary/20 transition-colors">
                      <MapPin size={20} className="md:text-primary md:w-4 md:h-4" />
                    </div>
                    <span className="text-xs md:text-sm font-medium">{customer.address || "-"}</span>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sağ Kolon (İşlem Geçmişi) */}
          <div className="p-4 mt-2 md:p-0 md:mt-0 md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between mb-4 px-1 md:px-0">
              <h3 className="font-semibold text-lg tracking-tight">İşlem Geçmişi</h3>
            </div>
            
            <Card className="border-none shadow-none md:border md:shadow-sm bg-transparent md:bg-background">
              <CardContent className="p-0 md:p-1">
                {customer.transactions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">Henüz işlem bulunmuyor.</div>
                ) : (
                  <div className="space-y-3 md:space-y-1">
                    {customer.transactions.map((t: any) => {
                      let colorClass = "";
                      let iconClass = "";
                      let label = "";
                      let isPositiveForUs = false;

                      if (t.actionType === "ALACAK_EKLE") {
                        colorClass = "text-indigo-600";
                        iconClass = "bg-indigo-100 text-indigo-600";
                        label = "Alacak Eklendi";
                        isPositiveForUs = true; // DEBIT (+) Müşteri borcu arttı
                      } else if (t.actionType === "BORC_EKLE") {
                        colorClass = "text-orange-600";
                        iconClass = "bg-orange-100 text-orange-600";
                        label = "Borç Eklendi";
                        isPositiveForUs = false; // CREDIT (-) Biz borçlandık
                      } else if (t.actionType === "ODEME_AL") {
                        colorClass = "text-emerald-600";
                        iconClass = "bg-emerald-100 text-emerald-600";
                        label = "Ödeme Alındı";
                        isPositiveForUs = false; // CREDIT (-) Müşteri borcunu ödedi
                      } else if (t.actionType === "ODEME_YAP") {
                        colorClass = "text-rose-600";
                        iconClass = "bg-rose-100 text-rose-600";
                        label = "Ödeme Yapıldı";
                        isPositiveForUs = true; // DEBIT (+) Biz borcumuzu ödedik
                      } else {
                        // Fallback for old transactions
                        const isOdeme = t.type === "CREDIT";
                        colorClass = isOdeme ? "text-emerald-600" : "text-rose-600";
                        iconClass = isOdeme ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600";
                        label = isOdeme ? "Tahsilat Alındı" : "Borçlandırıldı";
                        isPositiveForUs = !isOdeme; // DEBIT is +, CREDIT is -
                      }

                      return (
                        <div key={t.id} className="bg-background rounded-xl p-4 shadow-sm border-none md:border-b md:rounded-none md:shadow-none hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex justify-between items-start md:items-center w-full md:w-auto gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${iconClass}`}>
                                {isPositiveForUs ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{label} {t.description ? `(${t.description})` : ''}</p>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("tr-TR")} {new Date(t.date).toLocaleTimeString("tr-TR", {hour: '2-digit', minute:'2-digit'})}</p>
                                  {t.dueDate && (
                                    <p className={`text-xs font-medium ${new Date(t.dueDate) < new Date() && t.actionType !== "ODEME_AL" && t.actionType !== "ODEME_YAP" ? 'text-rose-500' : 'text-muted-foreground'}`}>
                                      Vade: {new Date(t.dueDate).toLocaleDateString('tr-TR')}
                                      {new Date(t.dueDate) < new Date() && t.actionType !== "ODEME_AL" && t.actionType !== "ODEME_YAP" && ' (Gecikti)'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Mobilde sağda, masaüstünde gizli tutar */}
                            <div className="flex flex-col items-end gap-1 md:hidden">
                              <div className={`font-bold ${colorClass}`}>
                                {isPositiveForUs ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => openTransactionEdit(t)} className="text-muted-foreground p-1 rounded-md hover:bg-muted active:scale-95">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteTransaction(t.id)} disabled={isPending} className="text-rose-500 p-1 rounded-md hover:bg-rose-50 active:scale-95 disabled:opacity-50">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-row md:flex-row-reverse items-center justify-between md:justify-start w-full md:w-auto gap-4 pl-11 md:pl-0 mt-1 md:mt-0">
                            <div className="hidden md:block w-[88px]"></div>
                            {/* Masaüstünde sağda tutar */}
                            <div className="flex items-center gap-2 hidden md:flex">
                              <div className={`font-bold w-24 text-right ${colorClass}`}>
                                {isPositiveForUs ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR')}
                              </div>
                              <button onClick={() => openTransactionEdit(t)} className="text-muted-foreground p-1.5 rounded-md hover:bg-muted active:scale-95 transition-colors" title="İşlemi Düzenle">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDeleteTransaction(t.id)} disabled={isPending} className="text-rose-500 p-1.5 rounded-md hover:bg-rose-50 active:scale-95 transition-colors disabled:opacity-50" title="İşlemi Sil">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Cari Düzenleme Modalı */}
      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cari Bilgilerini Düzenle</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad / Firma Adı *</Label>
              <Input id="name" value={editCustomerData.name} onChange={(e) => setEditCustomerData({...editCustomerData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" value={editCustomerData.phone} onChange={(e) => setEditCustomerData({...editCustomerData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" value={editCustomerData.email} onChange={(e) => setEditCustomerData({...editCustomerData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Input id="address" value={editCustomerData.address} onChange={(e) => setEditCustomerData({...editCustomerData, address: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <button 
              onClick={() => setIsEditCustomerOpen(false)}
              className="px-4 py-2 border rounded-md font-medium text-sm hover:bg-muted"
            >
              İptal
            </button>
            <button 
              onClick={handleUpdateCustomer}
              disabled={isPending || !editCustomerData.name}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Kaydet
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
