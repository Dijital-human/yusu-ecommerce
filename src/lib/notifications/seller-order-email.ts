/**
 * Seller Order Email Notification / Satıcı Sifariş Email Bildirişi
 * Send new order notification to seller when order is created
 * Sifariş yaradıldıqda satıcıya yeni sifariş bildirişi göndər
 */

import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/utils/logger";
import type { OrderItem, OrderForSellerEmail } from "@/types/orders";

/**
 * Send new order notification email to seller
 * Satıcıya yeni sifariş bildiriş email-i göndər
 */
export async function sendNewOrderEmailToSeller(
  order: OrderForSellerEmail,
  sellerEmail: string
): Promise<boolean> {
  try {
    const orderItems = order.items.map((item, index) => {
      const variantInfo = item.variant ? ` (${item.variant.name})` : "";
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.product.name}${variantInfo}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${Number(item.price).toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.quantity * Number(item.price)).toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const shippingAddress = typeof order.shippingAddress === 'string'
      ? order.shippingAddress
      : JSON.stringify(order.shippingAddress);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🛍️ Yeni Sifariş / New Order</h1>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #1f2937; margin-bottom: 20px;">
            Salam / Hello,
          </p>
          <p style="font-size: 16px; color: #1f2937; margin-bottom: 20px;">
            Yeni sifariş alındı! / A new order has been received!
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Sifariş Məlumatları / Order Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Sifariş Nömrəsi / Order ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 700;">${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Tarix / Date:</td>
                <td style="padding: 8px 0; color: #1f2937;">${new Date(order.createdAt).toLocaleString('az-AZ', { dateStyle: 'long', timeStyle: 'short' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Müştəri / Customer:</td>
                <td style="padding: 8px 0; color: #1f2937;">${order.customer.name || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">${order.customer.email || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Ümumi Məbləğ / Total Amount:</td>
                <td style="padding: 8px 0; color: #1f2937; font-size: 20px; font-weight: 700; color: #2563eb;">$${Number(order.totalAmount).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Çatdırılma Ünvanı / Shipping Address</h2>
            <p style="color: #1f2937; margin: 0; white-space: pre-line;">${shippingAddress}</p>
          </div>

          <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Sifariş Elementləri / Order Items</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">#</th>
                  <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Məhsul / Product</th>
                  <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Miqdar / Qty</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Qiymət / Price</th>
                  <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Cəmi / Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="padding: 12px 8px; text-align: right; font-weight: 700; border-top: 2px solid #e5e7eb;">Ümumi / Total:</td>
                  <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 18px; color: #2563eb; border-top: 2px solid #e5e7eb;">$${Number(order.totalAmount).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3002"}/seller/orders/${order.id}" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Sifarişə Bax / View Order
            </a>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
            Bu email avtomatik göndərilmişdir. / This email was sent automatically.
          </p>
        </div>
      </div>
    `;

    const itemsText = order.items.map((item, index) => {
      const variantInfo = item.variant ? ` (${item.variant.name})` : "";
      return `${index + 1}. ${item.product.name}${variantInfo} - Qty: ${item.quantity} - Price: $${Number(item.price).toFixed(2)} - Total: $${(item.quantity * Number(item.price)).toFixed(2)}`;
    }).join("\n");

    const text = `Yeni sifariş alındı!\n\nSifariş Nömrəsi: ${order.id}\nMüştəri: ${order.customer.name}\nEmail: ${order.customer.email}\nÜmumi Məbləğ: $${Number(order.totalAmount).toFixed(2)}\n\nSifariş Elementləri:\n${itemsText}\n\nÇatdırılma Ünvanı:\n${shippingAddress}\n\nSifarişə baxmaq üçün: ${process.env.NEXTAUTH_URL || "http://localhost:3002"}/seller/orders/${order.id}`;

    const result = await sendEmail(
      sellerEmail,
      `🛍️ Yeni Sifariş #${order.id} / New Order #${order.id}`,
      html,
      text
    );

    return result.success || false;
  } catch (error) {
    logger.error("Error sending new order email to seller", error, { orderId: order.id, sellerEmail });
    return false;
  }
}

