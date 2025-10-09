import mongoose, { Document, Schema } from 'mongoose';

// User interface / İstifadəçi interfeysi
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'customer' | 'moderator';
  isActive: boolean;
  addresses: IAddress[];
  preferences: {
    language: 'az' | 'en' | 'ru';
    currency: 'AZN' | 'USD' | 'EUR';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Address interface / Ünvan interfeysi
export interface IAddress {
  _id?: string;
  title: string;
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
  isDefault: boolean;
}

// User schema / İstifadəçi şeması
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email tələb olunur / Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Parol tələb olunur / Password is required'],
    minlength: [6, 'Parol ən azı 6 simvol olmalıdır / Password must be at least 6 characters'],
  },
  firstName: {
    type: String,
    required: [true, 'Ad tələb olunur / First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Soyad tələb olunur / Last name is required'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'moderator'],
    default: 'customer',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  addresses: [{
    title: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  }],
  preferences: {
    language: {
      type: String,
      enum: ['az', 'en', 'ru'],
      default: 'az',
    },
    currency: {
      type: String,
      enum: ['AZN', 'USD', 'EUR'],
      default: 'AZN',
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
  },
}, {
  timestamps: true, // createdAt və updatedAt avtomatik əlavə edir
});

// Indexes / İndekslər
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

// Virtual fields / Virtual sahələr
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Methods / Metodlar
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Export model / Modeli export et
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
