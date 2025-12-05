/**
 * Partial Payment Service / Qismən Ödəniş Xidməti
 * Business logic for partial payment operations
 * Qismən ödəniş əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { parsePrice } from "@/lib/utils/price-helpers";

export interface CreatePartialPaymentData {
  orderId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}

export interface PartialPaymentStatus {
  orderId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
    paidAt?: Date;
    createdAt: Date;
  }>;
}

/**
 * Create partial payment / Qismən ödəniş yarat
 */
export async function createPartialPayment(data: CreatePartialPaymentData) {
  // Get order / Sifarişi al
  const order = await prisma.orders.findUnique({
    where: { id: data.orderId },
    include: {
      partialPayments: {
        orderBy: { createdAt: "desc" },
      },
    } as any,
  });

  if (!order) {
    throw new Error("Order not found / Sifariş tapılmadı");
  }

  // Calculate already paid amount / Artıq ödənilmiş məbləği hesabla
  const paidAmount = (order as any).partialPayments
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + parsePrice(p.amount), 0);

  const totalAmount = parsePrice(order.totalAmount);
  const remainingAmount = totalAmount - paidAmount;

  // Validate payment amount / Ödəniş məbləğini yoxla
  if (data.amount <= 0) {
    throw new Error("Payment amount must be greater than 0 / Ödəniş məbləği 0-dan böyük olmalıdır");
  }

  if (data.amount > remainingAmount) {
    throw new Error(
      `Payment amount (${data.amount}) exceeds remaining balance (${remainingAmount}) / Ödəniş məbləği (${data.amount}) qalan balansı (${remainingAmount}) keçir`
    );
  }

  // Create partial payment / Qismən ödəniş yarat
  const partialPayment = await (prisma as any).partialPayment.create({
    data: {
      orderId: data.orderId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      status: "PENDING",
      remainingAmount: remainingAmount - data.amount,
    },
  });

  logger.info("Partial payment created / Qismən ödəniş yaradıldı", {
    partialPaymentId: partialPayment.id,
    orderId: data.orderId,
    amount: data.amount,
    remainingAmount: remainingAmount - data.amount,
  });

  return partialPayment;
}

/**
 * Complete partial payment / Qismən ödənişi tamamla
 */
export async function completePartialPayment(partialPaymentId: string) {
  const partialPayment = await (prisma as any).partialPayment.findUnique({
    where: { id: partialPaymentId },
    include: {
      order: true,
    },
  });

  if (!partialPayment) {
    throw new Error("Partial payment not found / Qismən ödəniş tapılmadı");
  }

  if (partialPayment.status === "COMPLETED") {
    throw new Error("Payment already completed / Ödəniş artıq tamamlanıb");
  }

  // Update payment status / Ödəniş statusunu yenilə
  const updated = await (prisma as any).partialPayment.update({
    where: { id: partialPaymentId },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
    },
  });

  // Check if order is fully paid / Sifarişin tam ödənilib-ödənilmədiyini yoxla
  const order = await prisma.orders.findUnique({
    where: { id: partialPayment.orderId },
    include: {
      partialPayments: true,
    } as any,
  });

  if (order) {
    const totalPaid = (order as any).partialPayments
      .filter((p: any) => p.status === "COMPLETED")
      .reduce((sum: number, p: any) => sum + parsePrice(p.amount), 0);

    const totalAmount = parsePrice(order.totalAmount);

    // If fully paid, update order status / Əgər tam ödənilibsə, sifariş statusunu yenilə
    if (totalPaid >= totalAmount) {
      await prisma.orders.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED", // Or appropriate status / Və ya uyğun status
        },
      });
      logger.info("Order fully paid / Sifariş tam ödənildi", { orderId: order.id });
    }
  }

  logger.info("Partial payment completed / Qismən ödəniş tamamlandı", {
    partialPaymentId,
    orderId: partialPayment.orderId,
  });

  return updated;
}

/**
 * Get partial payment status / Qismən ödəniş statusunu al
 */
export async function getPartialPaymentStatus(orderId: string): Promise<PartialPaymentStatus> {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      partialPayments: {
        orderBy: { createdAt: "desc" },
      },
    } as any,
  });

  if (!order) {
    throw new Error("Order not found / Sifariş tapılmadı");
  }

  const totalAmount = parsePrice(order.totalAmount);
  const paidAmount = (order as any).partialPayments
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + parsePrice(p.amount), 0);
  const remainingAmount = totalAmount - paidAmount;

  return {
    orderId: order.id,
    totalAmount,
    paidAmount,
    remainingAmount,
    payments: (order as any).partialPayments.map((p: any) => ({
      id: p.id,
      amount: parsePrice(p.amount),
      paymentMethod: p.paymentMethod,
      status: p.status,
      paidAt: p.paidAt || undefined,
      createdAt: p.createdAt,
    })),
  };
}

/**
 * Refund partial payment / Qismən ödənişi geri qaytar
 */
export async function refundPartialPayment(partialPaymentId: string) {
  const partialPayment = await (prisma as any).partialPayment.findUnique({
    where: { id: partialPaymentId },
  });

  if (!partialPayment) {
    throw new Error("Partial payment not found / Qismən ödəniş tapılmadı");
  }

  if (partialPayment.status !== "COMPLETED") {
    throw new Error("Only completed payments can be refunded / Yalnız tamamlanmış ödənişlər geri qaytarıla bilər");
  }

  const updated = await (prisma as any).partialPayment.update({
    where: { id: partialPaymentId },
    data: {
      status: "REFUNDED",
    },
  });

  logger.info("Partial payment refunded / Qismən ödəniş geri qaytarıldı", {
    partialPaymentId,
    orderId: partialPayment.orderId,
  });

  return updated;
}

/**
 * Get payment schedule for order / Sifariş üçün ödəniş cədvəlini al
 */
export async function getPaymentSchedule(orderId: string): Promise<{
  schedule: Array<{
    id: string;
    amount: number;
    dueDate: Date;
    status: string;
    paidAt?: Date;
  }>;
  nextPaymentDue?: Date;
  totalRemaining: number;
}> {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      partialPayments: {
        orderBy: { createdAt: 'asc' },
      },
    } as any,
  });

  if (!order) {
    throw new Error("Order not found / Sifariş tapılmadı");
  }

  const totalAmount = parsePrice(order.totalAmount);
  const payments = (order as any).partialPayments.map((p: any) => ({
    id: p.id,
    amount: parsePrice(p.amount),
    dueDate: p.createdAt,
    status: p.status,
    paidAt: p.paidAt || undefined,
  }));

  const paidAmount = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalRemaining = totalAmount - paidAmount;

  const nextPaymentDue = payments.find((p) => p.status === "PENDING")?.dueDate;

  return {
    schedule: payments,
    nextPaymentDue,
    totalRemaining,
  };
}

/**
 * Send payment reminder / Ödəniş xatırlatması göndər
 */
export async function sendPaymentReminder(orderId: string): Promise<void> {
  const schedule = await getPaymentSchedule(orderId);
  
  if (!schedule.nextPaymentDue) {
    logger.info("No pending payments for reminder / Xatırlatma üçün gözləyən ödəniş yoxdur", { orderId });
    return;
  }

  // TODO: Send email/SMS reminder / Email/SMS xatırlatması göndər
  logger.info("Payment reminder sent / Ödəniş xatırlatması göndərildi", {
    orderId,
    nextPaymentDue: schedule.nextPaymentDue,
  });
}

/**
 * Get payment history for order / Sifariş üçün ödəniş tarixçəsini al
 */
export async function getPaymentHistory(orderId: string): Promise<Array<{
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  createdAt: Date;
  paidAt?: Date;
}>> {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      partialPayments: {
        orderBy: { createdAt: 'desc' },
      },
    } as any,
  });

  if (!order) {
    throw new Error("Order not found / Sifariş tapılmadı");
  }

  return (order as any).partialPayments.map((p: any) => ({
    id: p.id,
    amount: parsePrice(p.amount),
    paymentMethod: p.paymentMethod,
    status: p.status,
    transactionId: p.transactionId || undefined,
    createdAt: p.createdAt,
    paidAt: p.paidAt || undefined,
  }));
}

