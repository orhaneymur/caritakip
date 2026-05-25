"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client"; // 1. BURAYA EKLEDİK

// --- PRISMA TIPI TANIMLAMALARI --- // 2. BURAYA YERLEŞTİRİYORUZ
type CustomerWithTransactions = Prisma.CustomerGetPayload<{
  include: { transactions: true }
}>;

type TransactionType = Prisma.TransactionGetPayload<{}>;

// Dummy Organization and User IDs for MVP
const ORG_ID = "org_dummy_1";
const USER_ID = "usr_dummy_1";

// --- CUSTOMER (Cari) İŞLEMLERİ ---

export async function createCustomer(data: { name: string; phone?: string; email?: string; address?: string; type: "BORCLU" | "ALACAKLI"; initialBalance: number }) {
  // Önce organizasyonu ve user'ı güvene alalım (Eğer yoksa oluşturalım)
  await prisma.organization.upsert({
    where: { id: ORG_ID },
    update: {},
    create: { id: ORG_ID, name: "Örnek İşletme" },
  });

  await prisma.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: { id: USER_ID, name: "Orhan Eymur", email: "orhan@ornek.com", role: "ADMIN", organizationId: ORG_ID },
  });

  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      organizationId: ORG_ID,
    },
  });

  // Eğer başlangıç bakiyesi varsa, otomatik bir işlem (Transaction) oluştur
  if (data.initialBalance > 0) {
    await prisma.transaction.create({
      data: {
        customerId: customer.id,
        userId: USER_ID,
        type: data.type === "BORCLU" ? "DEBIT" : "CREDIT",
        amount: data.initialBalance,
        description: "Başlangıç Bakiyesi",
      },
    });
  }

  revalidatePath("/cariler");
  return { success: true, customerId: customer.id };
}

export async function getCustomers() {
  const customers = await prisma.customer.findMany({
    where: { organizationId: ORG_ID, deletedAt: null },
    include: {
      transactions: {
        where: { deletedAt: null },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Bakiyeleri hesapla (c parametresine CustomerWithTransactions tipini atadık)
  return customers.map((c: CustomerWithTransactions) => {
  let totalDebit = 0;
  let totalCredit = 0;

  // t parametresine TransactionType tipini verdik
  c.transactions.forEach((t: TransactionType) => {
    if (t.type === "DEBIT") totalDebit += t.amount;
    else totalCredit += t.amount;
  });

    const bakiye = Math.round((totalDebit - totalCredit) * 100) / 100;
    
    return {
      ...c,
      bakiye: Math.abs(bakiye),
      type: bakiye > 0 ? "borc" : bakiye < 0 ? "alacak" : "notr",
      guncellenme: c.updatedAt,
    };
  });
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      transactions: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!customer) return null;

  let totalDebit = 0; 
  let totalCredit = 0; 

  // t parametresine TransactionType tipini atadık
  customer.transactions.forEach((t: TransactionType) => {
    if (t.type === "DEBIT") totalDebit += t.amount;
    else totalCredit += t.amount;
  });

  const bakiye = Math.round((totalDebit - totalCredit) * 100) / 100;

  return {
    ...customer,
    bakiye: Math.abs(bakiye),
    totalDebit,
    totalCredit,
    type: bakiye > 0 ? "borc" : bakiye < 0 ? "alacak" : "notr",
  };
}

export async function updateCustomer(id: string, data: { name: string; phone?: string; email?: string; address?: string }) {
  await prisma.customer.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
    },
  });
  revalidatePath("/cariler");
  revalidatePath(`/cariler/${id}`);
  return { success: true };
}

// --- TRANSACTION (İşlem) İŞLEMLERİ ---

export async function createTransaction(data: { customerId: string; type: "DEBIT" | "CREDIT"; actionType: string; amount: number; description?: string; dueDate?: Date | null }) {
  try {
    // Sadece güvenlik için User var mı kontrol et veya upsert yap
    await prisma.user.upsert({
      where: { id: USER_ID },
      update: {},
      create: { id: USER_ID, name: "Orhan Eymur", email: "orhan@ornek.com", role: "ADMIN", organizationId: ORG_ID },
    });

    await prisma.transaction.create({
      data: {
        userId: USER_ID,
        customerId: data.customerId,
        type: data.type,
        actionType: data.actionType,
        amount: data.amount,
        description: data.description || null,
        dueDate: data.dueDate || null,
      },
    });

    revalidatePath("/cariler");
    revalidatePath(`/cariler/${data.customerId}`);
    revalidatePath("/");
    revalidatePath("/raporlar");
    revalidatePath("/islemler");
    return { success: true };
  } catch (error) {
    console.error("createTransaction hatası:", error);
    throw error;
  }
}

export async function updateTransaction(id: string, data: { actionType: string; amount: number; description?: string; dueDate?: Date | null }) {
  try {
    // İlk önce mevcut transaction'ı bulalım, customerId lazım
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) throw new Error("İşlem bulunamadı");

    let type: "DEBIT" | "CREDIT" = "CREDIT";
    if (data.actionType === "ALACAK_EKLE" || data.actionType === "ODEME_YAP") {
      type = "DEBIT";
    }

    await prisma.transaction.update({
      where: { id },
      data: {
        type,
        actionType: data.actionType,
        amount: data.amount,
        description: data.description || null,
        dueDate: data.dueDate || null,
      },
    });

    revalidatePath("/cariler");
    revalidatePath(`/cariler/${existing.customerId}`);
    revalidatePath("/");
    revalidatePath("/raporlar");
    revalidatePath("/islemler");
    return { success: true };
  } catch (error) {
    console.error("updateTransaction hatası:", error);
    throw error;
  }
}

// --- DASHBOARD (Rapor) İŞLEMLERİ ---

export async function getDashboardStats() {
  const transactions = await prisma.transaction.findMany({
    where: { customer: { organizationId: ORG_ID }, deletedAt: null },
  });

  let totalAlacak = 0; // Bize ödenmesi beklenen toplam tutar
  let totalBorc = 0; // Bizim ödememiz gereken toplam tutar
  let totalKasa = 0; // Kasaya giren - Kasadan çıkan

  // Müşteri bazında gruplamak lazım
  const customerBalances: Record<string, number> = {};

  // t parametresine TransactionType tipini atadık
  transactions.forEach((t: TransactionType) => {
    // Cari hesaplama
    if (!customerBalances[t.customerId]) customerBalances[t.customerId] = 0;
    if (t.type === "DEBIT") customerBalances[t.customerId] += t.amount;
    else customerBalances[t.customerId] -= t.amount;

    // Kasa hesaplama
    if (t.actionType === "ODEME_AL") totalKasa += t.amount;
    else if (t.actionType === "ODEME_YAP") totalKasa -= t.amount;
    else if (!t.actionType) {
      if (t.type === "CREDIT") totalKasa += t.amount; // Eski sistemde Tahsilat
    }
  });

  Object.values(customerBalances).forEach((balance: number) => {
    if (balance > 0) totalAlacak += balance;
    else if (balance < 0) totalBorc += Math.abs(balance);
  });

  // Son işlemleri de döndürelim
  const recentTransactions = await prisma.transaction.findMany({
    where: { customer: { organizationId: ORG_ID }, deletedAt: null },
    take: 5,
    orderBy: { date: "desc" },
    include: { customer: true },
  });

  // Yaklaşan veya gecikmiş işlemleri bulalım (Sadece Alacak Ekle ve Borç Ekle için)
  const upcomingTransactionsRaw = await prisma.transaction.findMany({
    where: { 
      customer: { organizationId: ORG_ID }, 
      deletedAt: null,
      dueDate: { not: null }
    },
    orderBy: { dueDate: "asc" },
    include: { customer: true },
  });

  // Sadece bakiyesi açık olan (henüz ödenmemiş) müşterilerin vade işlemlerini göster
  // t parametresi için Prisma'nın otomatik çıkardığı ham tipi atadık
  const upcomingTransactions = upcomingTransactionsRaw.filter(t => {
    const bal = customerBalances[t.customerId] || 0;
    if (t.type === "DEBIT" && bal > 0) return true;
    if (t.type === "CREDIT" && bal < 0) return true;
    return false;
  });

  return {
    netBakiye: totalAlacak - totalBorc,
    totalKasa,
    totalAlacak,
    totalBorc,
    recentTransactions,
    upcomingTransactions,
  };
}

export async function getAllTransactions() {
  const transactions = await prisma.transaction.findMany({
    where: { customer: { organizationId: ORG_ID }, deletedAt: null },
    orderBy: { date: "desc" },
    include: { customer: true },
  });

  return transactions;
}

// --- SILME & ÇÖP KUTUSU İŞLEMLERİ ---

export async function softDeleteCustomer(id: string) {
  await prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/cariler");
  revalidatePath("/profil/cop-kutusu/cariler");
  return { success: true };
}

export async function restoreCustomer(id: string) {
  await prisma.customer.update({
    where: { id },
    data: { deletedAt: null },
  });
  revalidatePath("/cariler");
  revalidatePath("/profil/cop-kutusu/cariler");
  return { success: true };
}

export async function hardDeleteCustomer(id: string) {
  await prisma.transaction.deleteMany({
    where: { customerId: id },
  });
  await prisma.customer.delete({
    where: { id },
  });
  revalidatePath("/profil/cop-kutusu/cariler");
  return { success: true };
}

export async function softDeleteTransaction(id: string) {
  const t = await prisma.transaction.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/cariler");
  revalidatePath(`/cariler/${t.customerId}`);
  revalidatePath("/islemler");
  revalidatePath("/");
  return { success: true };
}

export async function restoreTransaction(id: string) {
  const t = await prisma.transaction.update({
    where: { id },
    data: { deletedAt: null },
  });
  revalidatePath("/cariler");
  revalidatePath(`/cariler/${t.customerId}`);
  revalidatePath("/islemler");
  revalidatePath("/");
  return { success: true };
}

export async function hardDeleteTransaction(id: string) {
  await prisma.transaction.delete({
    where: { id },
  });
  revalidatePath("/profil/cop-kutusu/islemler");
  return { success: true };
}

export async function getDeletedCustomers() {
  return await prisma.customer.findMany({
    where: { organizationId: ORG_ID, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
  });
}

export async function getDeletedTransactions() {
  return await prisma.transaction.findMany({
    where: { customer: { organizationId: ORG_ID }, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    include: { customer: true },
  });
}
