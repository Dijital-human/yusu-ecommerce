import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session } from 'next-auth';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getServerAuthSession } from '../auth';

// Context interface / Kontekst interfeysi
interface CreateContextOptions {
  session: Session | null;
}

// Create inner context / Daxili kontekst yarat
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
  };
};

// Create context / Kontekst yarat
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

// Initialize tRPC / tRPC-ni başlat
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Base router and procedure helpers / Əsas router və prosedur köməkçiləri
export const createTRPCRouter = t.router;

// Public procedure / İctimai prosedur
export const publicProcedure = t.procedure;

// Protected procedure / Qorunan prosedur
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Admin procedure / Admin prosedur
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  // Check if user is admin / İstifadəçinin admin olub-olmadığını yoxla
  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Rate limiting procedure / Rate limiting prosedur
export const rateLimitedProcedure = t.procedure.use(({ ctx, next }) => {
  // Implement rate limiting logic here / Rate limiting məntiqini burada tətbiq et
  // This is a placeholder for rate limiting / Bu rate limiting üçün placeholder-dır
  
  return next({
    ctx,
  });
});

// Input validation helpers / Input validasiya köməkçiləri
export const createInputValidation = <T>(schema: any) => {
  return (input: T) => {
    try {
      return schema.parse(input);
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid input / Yanlış input',
        cause: error,
      });
    }
  };
};

// Error handling helpers / Xəta idarəetmə köməkçiləri
export const handleTRPCError = (error: any) => {
  if (error instanceof TRPCError) {
    throw error;
  }
  
  if (error.code === 11000) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Duplicate entry / Təkrarlanan giriş',
    });
  }
  
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong / Nəsə səhv getdi',
    cause: error,
  });
};

// Database connection helpers / Verilənlər bazası əlaqə köməkçiləri
export const connectDB = async () => {
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('MongoDB connected / MongoDB bağlandı');
  } catch (error) {
    console.error('MongoDB connection error / MongoDB əlaqə xətası:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database connection failed / Verilənlər bazası əlaqəsi uğursuz',
    });
  }
};

// Utility functions / Utility funksiyaları
export const utils = {
  // Format currency / Valyuta formatla
  formatCurrency: (amount: number, currency: string = 'AZN') => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },
  
  // Format date / Tarix formatla
  formatDate: (date: Date) => {
    return new Intl.DateTimeFormat('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  },
  
  // Generate slug / Slug yarat
  generateSlug: (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  },
  
  // Validate email / Email yoxla
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate phone / Telefon yoxla
  validatePhone: (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  },
};
