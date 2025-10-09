import mongoose, { Document, Schema } from 'mongoose';

// Product interface / Məhsul interfeysi
export interface IProduct extends Document {
  _id: string;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  slug: string;
  description?: {
    az: string;
    en: string;
    ru: string;
  };
  shortDescription?: {
    az: string;
    en: string;
    ru: string;
  };
  sku: string; // Stock Keeping Unit / Anbar kodu
  price: {
    current: number;
    original?: number; // Original price for discounts / Endirim üçün orijinal qiymət
    currency: 'AZN' | 'USD' | 'EUR';
  };
  images: string[];
  category: string | ICategory;
  subcategory?: string;
  brand?: string;
  tags: string[];
  attributes: {
    name: {
      az: string;
      en: string;
      ru: string;
    };
    value: {
      az: string;
      en: string;
      ru: string;
    };
  }[];
  variants?: {
    name: {
      az: string;
      en: string;
      ru: string;
    };
    options: {
      name: {
        az: string;
        en: string;
        ru: string;
      };
      price?: number;
      sku?: string;
      stock?: number;
      image?: string;
    }[];
  }[];
  stock: {
    quantity: number;
    trackStock: boolean;
    lowStockThreshold: number;
    allowBackorder: boolean;
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
    unit: 'cm' | 'in';
  };
  shipping: {
    free: boolean;
    cost: number;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  seo: {
    title?: {
      az: string;
      en: string;
      ru: string;
    };
    description?: {
      az: string;
      en: string;
      ru: string;
    };
    keywords?: string[];
  };
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
  views: number;
  sales: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Product schema / Məhsul şeması
const ProductSchema = new Schema<IProduct>({
  name: {
    az: {
      type: String,
      required: [true, 'Azərbaycan adı tələb olunur / Azerbaijani name is required'],
      trim: true,
    },
    en: {
      type: String,
      required: [true, 'İngilis adı tələb olunur / English name is required'],
      trim: true,
    },
    ru: {
      type: String,
      required: [true, 'Rus adı tələb olunur / Russian name is required'],
      trim: true,
    },
  },
  slug: {
    type: String,
    required: [true, 'Slug tələb olunur / Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    az: { type: String, trim: true },
    en: { type: String, trim: true },
    ru: { type: String, trim: true },
  },
  shortDescription: {
    az: { type: String, trim: true },
    en: { type: String, trim: true },
    ru: { type: String, trim: true },
  },
  sku: {
    type: String,
    required: [true, 'SKU tələb olunur / SKU is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  price: {
    current: {
      type: Number,
      required: [true, 'Qiymət tələb olunur / Price is required'],
      min: [0, 'Qiymət mənfi ola bilməz / Price cannot be negative'],
    },
    original: {
      type: Number,
      min: [0, 'Orijinal qiymət mənfi ola bilməz / Original price cannot be negative'],
    },
    currency: {
      type: String,
      enum: ['AZN', 'USD', 'EUR'],
      default: 'AZN',
    },
  },
  images: [{
    type: String,
    required: [true, 'Ən azı bir şəkil tələb olunur / At least one image is required'],
  }],
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kateqoriya tələb olunur / Category is required'],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  attributes: [{
    name: {
      az: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
    },
    value: {
      az: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
    },
  }],
  variants: [{
    name: {
      az: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
      ru: { type: String, required: true, trim: true },
    },
    options: [{
      name: {
        az: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
        ru: { type: String, required: true, trim: true },
      },
      price: { type: Number, min: 0 },
      sku: { type: String, trim: true, uppercase: true },
      stock: { type: Number, min: 0 },
      image: { type: String },
    }],
  }],
  stock: {
    quantity: {
      type: Number,
      required: [true, 'Stok miqdarı tələb olunur / Stock quantity is required'],
      min: [0, 'Stok miqdarı mənfi ola bilməz / Stock quantity cannot be negative'],
    },
    trackStock: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Aşağı stok həddi mənfi ola bilməz / Low stock threshold cannot be negative'],
    },
    allowBackorder: {
      type: Boolean,
      default: false,
    },
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm',
    },
  },
  shipping: {
    free: {
      type: Boolean,
      default: false,
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Çatdırılma qiyməti mənfi ola bilməz / Shipping cost cannot be negative'],
    },
    weight: {
      type: Number,
      default: 0,
      min: [0, 'Çəkisi mənfi ola bilməz / Weight cannot be negative'],
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
  },
  seo: {
    title: {
      az: { type: String, trim: true },
      en: { type: String, trim: true },
      ru: { type: String, trim: true },
    },
    description: {
      az: { type: String, trim: true },
      en: { type: String, trim: true },
      ru: { type: String, trim: true },
    },
    keywords: [String],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  sales: {
    type: Number,
    default: 0,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Reytinq 0-dan az ola bilməz / Rating cannot be less than 0'],
      max: [5, 'Reytinq 5-dən çox ola bilməz / Rating cannot be more than 5'],
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Reytinq sayı mənfi ola bilməz / Rating count cannot be negative'],
    },
  },
}, {
  timestamps: true,
});

// Indexes / İndekslər
ProductSchema.index({ slug: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ 'price.current': 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ brand: 1 });

// Virtual fields / Virtual sahələr
ProductSchema.virtual('isInStock').get(function() {
  return this.stock.trackStock ? this.stock.quantity > 0 : true;
});

ProductSchema.virtual('isLowStock').get(function() {
  return this.stock.trackStock && this.stock.quantity <= this.stock.lowStockThreshold;
});

ProductSchema.virtual('discountPercentage').get(function() {
  if (this.price.original && this.price.original > this.price.current) {
    return Math.round(((this.price.original - this.price.current) / this.price.original) * 100);
  }
  return 0;
});

// Methods / Metodlar
ProductSchema.methods.updateStock = function(quantity: number) {
  if (this.stock.trackStock) {
    this.stock.quantity += quantity;
    if (this.stock.quantity < 0 && !this.stock.allowBackorder) {
      throw new Error('Stok kifayət etmir / Insufficient stock');
    }
  }
  return this.save();
};

// Pre-save middleware / Kaydetmeden önce middleware
ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    // Auto-generate slug if not provided / Slug avtomatik yaradılır
    if (!this.slug) {
      this.slug = this.name.az
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }
  }
  next();
});

// Export model / Modeli export et
export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
