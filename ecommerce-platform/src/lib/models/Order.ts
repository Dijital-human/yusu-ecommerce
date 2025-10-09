import mongoose, { Document, Schema } from 'mongoose';

// Order interface / Sifariş interfeysi
export interface IOrder extends Document {
  _id: string;
  orderNumber: string; // Unique order number / Unikal sifariş nömrəsi
  customer: string | IUser; // Customer reference / Müştəri istinadı
  items: IOrderItem[];
  shipping: IShippingInfo;
  billing: IBillingInfo;
  payment: IPaymentInfo;
  totals: IOrderTotals;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Order item interface / Sifariş məhsulu interfeysi
export interface IOrderItem {
  product: string | IProduct; // Product reference / Məhsul istinadı
  variant?: string; // Product variant / Məhsul variantı
  name: {
    az: string;
    en: string;
    ru: string;
  };
  sku: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
  attributes?: {
    name: string;
    value: string;
  }[];
}

// Shipping info interface / Çatdırılma məlumatları interfeysi
export interface IShippingInfo {
  method: string;
  cost: number;
  address: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
}

// Billing info interface / Faktura məlumatları interfeysi
export interface IBillingInfo {
  address: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  taxNumber?: string;
  sameAsShipping: boolean;
}

// Payment info interface / Ödəniş məlumatları interfeysi
export interface IPaymentInfo {
  method: 'stripe' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  gatewayResponse?: any;
}

// Order totals interface / Sifariş cəmləri interfeysi
export interface IOrderTotals {
  subtotal: number; // Məhsulların cəmi / Products total
  shipping: number; // Çatdırılma / Shipping
  tax: number; // Vergi / Tax
  discount: number; // Endirim / Discount
  total: number; // Ümumi məbləğ / Grand total
  currency: 'AZN' | 'USD' | 'EUR';
}

// Order schema / Sifariş şeması
const OrderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: [true, 'Sifariş nömrəsi tələb olunur / Order number is required'],
    unique: true,
    uppercase: true,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Müştəri tələb olunur / Customer is required'],
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Məhsul tələb olunur / Product is required'],
    },
    variant: { type: String, trim: true },
    name: {
      az: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
    },
    sku: {
      type: String,
      required: [true, 'SKU tələb olunur / SKU is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Qiymət tələb olunur / Price is required'],
      min: [0, 'Qiymət mənfi ola bilməz / Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Miqdar tələb olunur / Quantity is required'],
      min: [1, 'Miqdar ən azı 1 olmalıdır / Quantity must be at least 1'],
    },
    total: {
      type: Number,
      required: [true, 'Cəmi tələb olunur / Total is required'],
      min: [0, 'Cəmi mənfi ola bilməz / Total cannot be negative'],
    },
    image: { type: String },
    attributes: [{
      name: { type: String, required: true, trim: true },
      value: { type: String, required: true, trim: true },
    }],
  }],
  shipping: {
    method: {
      type: String,
      required: [true, 'Çatdırılma üsulu tələb olunur / Shipping method is required'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Çatdırılma qiyməti tələb olunur / Shipping cost is required'],
      min: [0, 'Çatdırılma qiyməti mənfi ola bilməz / Shipping cost cannot be negative'],
    },
    address: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      company: { type: String, trim: true },
      address1: { type: String, required: true, trim: true },
      address2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    trackingNumber: { type: String, trim: true },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
  },
  billing: {
    address: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      company: { type: String, trim: true },
      address1: { type: String, required: true, trim: true },
      address2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    taxNumber: { type: String, trim: true },
    sameAsShipping: {
      type: Boolean,
      default: false,
    },
  },
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer', 'cash_on_delivery'],
      required: [true, 'Ödəniş üsulu tələb olunur / Payment method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    transactionId: { type: String, trim: true },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number, min: 0 },
    gatewayResponse: { type: Schema.Types.Mixed },
  },
  totals: {
    subtotal: {
      type: Number,
      required: [true, 'Alt cəmi tələb olunur / Subtotal is required'],
      min: [0, 'Alt cəmi mənfi ola bilməz / Subtotal cannot be negative'],
    },
    shipping: {
      type: Number,
      required: [true, 'Çatdırılma tələb olunur / Shipping is required'],
      min: [0, 'Çatdırılma mənfi ola bilməz / Shipping cannot be negative'],
    },
    tax: {
      type: Number,
      required: [true, 'Vergi tələb olunur / Tax is required'],
      min: [0, 'Vergi mənfi ola bilməz / Tax cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Endirim mənfi ola bilməz / Discount cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Ümumi məbləğ tələb olunur / Total is required'],
      min: [0, 'Ümumi məbləğ mənfi ola bilməz / Total cannot be negative'],
    },
    currency: {
      type: String,
      enum: ['AZN', 'USD', 'EUR'],
      default: 'AZN',
    },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  notes: { type: String, trim: true },
  trackingNumber: { type: String, trim: true },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  refundedAt: { type: Date },
}, {
  timestamps: true,
});

// Indexes / İndekslər
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customer: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'payment.status': 1 });

// Virtual fields / Virtual sahələr
OrderSchema.virtual('isPaid').get(function() {
  return this.payment.status === 'paid';
});

OrderSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

OrderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed', 'processing'].includes(this.status);
});

// Methods / Metodlar
OrderSchema.methods.updateStatus = function(newStatus: string) {
  this.status = newStatus;
  
  // Update related timestamps / Əlaqəli zaman damğalarını yenilə
  switch (newStatus) {
    case 'delivered':
      this.deliveredAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
    case 'refunded':
      this.refundedAt = new Date();
      break;
  }
  
  return this.save();
};

OrderSchema.methods.calculateTotals = function() {
  const subtotal = this.items.reduce((sum: number, item: IOrderItem) => sum + item.total, 0);
  const shipping = this.shipping.cost;
  const tax = subtotal * 0.18; // 18% VAT / 18% ƏDV
  const discount = 0; // Can be calculated based on coupons / Kuponlara əsasən hesablana bilər
  const total = subtotal + shipping + tax - discount;
  
  this.totals = {
    subtotal,
    shipping,
    tax,
    discount,
    total,
    currency: this.totals.currency,
  };
  
  return this.save();
};

// Pre-save middleware / Kaydetmeden önce middleware
OrderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    // Generate unique order number / Unikal sifariş nömrəsi yarad
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Export model / Modeli export et
export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
