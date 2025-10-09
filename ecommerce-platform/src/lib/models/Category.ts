import mongoose, { Document, Schema } from 'mongoose';

// Category interface / Kateqoriya interfeysi
export interface ICategory extends Document {
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
  parent?: string | ICategory; // Parent category / Ana kateqoriya
  children?: ICategory[]; // Child categories / Alt kateqoriyalar
  image?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
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
  createdAt: Date;
  updatedAt: Date;
}

// Category schema / Kateqoriya şeması
const CategorySchema = new Schema<ICategory>({
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
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  image: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#3b82f6',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
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
}, {
  timestamps: true,
});

// Indexes / İndekslər
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ sortOrder: 1 });

// Virtual fields / Virtual sahələr
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Methods / Metodlar
CategorySchema.methods.getFullPath = function(language: 'az' | 'en' | 'ru' = 'az') {
  const path = [];
  let current = this;
  
  while (current) {
    path.unshift(current.name[language]);
    current = current.parent;
  }
  
  return path.join(' > ');
};

// Pre-save middleware / Kaydetmeden önce middleware
CategorySchema.pre('save', function(next) {
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
export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
