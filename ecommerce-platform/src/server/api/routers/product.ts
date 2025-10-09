import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import Product from '../../../lib/models/Product';
import Category from '../../../lib/models/Category';
import { connectDB } from '../trpc';

// Product input schemas / Məhsul input şemaları
const createProductSchema = z.object({
  name: z.object({
    az: z.string().min(1, 'Azərbaycan adı tələb olunur / Azerbaijani name is required'),
    en: z.string().min(1, 'İngilis adı tələb olunur / English name is required'),
    ru: z.string().min(1, 'Rus adı tələb olunur / Russian name is required'),
  }),
  description: z.object({
    az: z.string().optional(),
    en: z.string().optional(),
    ru: z.string().optional(),
  }).optional(),
  shortDescription: z.object({
    az: z.string().optional(),
    en: z.string().optional(),
    ru: z.string().optional(),
  }).optional(),
  sku: z.string().min(1, 'SKU tələb olunur / SKU is required'),
  price: z.object({
    current: z.number().min(0, 'Qiymət mənfi ola bilməz / Price cannot be negative'),
    original: z.number().min(0).optional(),
    currency: z.enum(['AZN', 'USD', 'EUR']).default('AZN'),
  }),
  images: z.array(z.string()).min(1, 'Ən azı bir şəkil tələb olunur / At least one image is required'),
  category: z.string().min(1, 'Kateqoriya tələb olunur / Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.array(z.object({
    name: z.object({
      az: z.string(),
      en: z.string(),
      ru: z.string(),
    }),
    value: z.object({
      az: z.string(),
      en: z.string(),
      ru: z.string(),
    }),
  })).optional(),
  variants: z.array(z.object({
    name: z.object({
      az: z.string(),
      en: z.string(),
      ru: z.string(),
    }),
    options: z.array(z.object({
      name: z.object({
        az: z.string(),
        en: z.string(),
        ru: z.string(),
      }),
      price: z.number().min(0).optional(),
      sku: z.string().optional(),
      stock: z.number().min(0).optional(),
      image: z.string().optional(),
    })),
  })).optional(),
  stock: z.object({
    quantity: z.number().min(0, 'Stok miqdarı mənfi ola bilməz / Stock quantity cannot be negative'),
    trackStock: z.boolean().default(true),
    lowStockThreshold: z.number().min(0).default(10),
    allowBackorder: z.boolean().default(false),
  }),
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    weight: z.number().min(0).optional(),
    unit: z.enum(['cm', 'in']).default('cm'),
  }).optional(),
  shipping: z.object({
    free: z.boolean().default(false),
    cost: z.number().min(0).default(0),
    weight: z.number().min(0).default(0),
    dimensions: z.object({
      length: z.number().min(0).optional(),
      width: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
    }).optional(),
  }),
  seo: z.object({
    title: z.object({
      az: z.string().optional(),
      en: z.string().optional(),
      ru: z.string().optional(),
    }).optional(),
    description: z.object({
      az: z.string().optional(),
      en: z.string().optional(),
      ru: z.string().optional(),
    }).optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const updateProductSchema = createProductSchema.partial().extend({
  _id: z.string().min(1, 'Məhsul ID tələb olunur / Product ID is required'),
});

const getProductsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'views', 'sales']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featured: z.boolean().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
});

// Product router / Məhsul router
export const productRouter = createTRPCRouter({
  // Get all products / Bütün məhsulları əldə et
  getAll: publicProcedure
    .input(getProductsSchema)
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const {
          page,
          limit,
          category,
          search,
          sortBy,
          sortOrder,
          status,
          featured,
          minPrice,
          maxPrice,
          inStock,
        } = input;
        
        // Build filter / Filter qur
        const filter: any = {};
        
        if (category) {
          filter.category = category;
        }
        
        if (status) {
          filter.status = status;
        }
        
        if (featured !== undefined) {
          filter.featured = featured;
        }
        
        if (minPrice !== undefined || maxPrice !== undefined) {
          filter['price.current'] = {};
          if (minPrice !== undefined) {
            filter['price.current'].$gte = minPrice;
          }
          if (maxPrice !== undefined) {
            filter['price.current'].$lte = maxPrice;
          }
        }
        
        if (inStock !== undefined) {
          if (inStock) {
            filter['stock.quantity'] = { $gt: 0 };
          } else {
            filter['stock.quantity'] = { $lte: 0 };
          }
        }
        
        if (search) {
          filter.$or = [
            { 'name.az': { $regex: search, $options: 'i' } },
            { 'name.en': { $regex: search, $options: 'i' } },
            { 'name.ru': { $regex: search, $options: 'i' } },
            { 'description.az': { $regex: search, $options: 'i' } },
            { 'description.en': { $regex: search, $options: 'i' } },
            { 'description.ru': { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
          ];
        }
        
        // Build sort / Sıralama qur
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Calculate pagination / Səhifələmə hesabla
        const skip = (page - 1) * limit;
        
        // Execute query / Sorğunu icra et
        const [products, total] = await Promise.all([
          Product.find(filter)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
          Product.countDocuments(filter),
        ]);
        
        return {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        throw new Error(`Məhsulları əldə etmək mümkün olmadı / Failed to fetch products: ${error}`);
      }
    }),
  
  // Get product by ID / Məhsulu ID-yə görə əldə et
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const product = await Product.findById(input.id)
          .populate('category', 'name slug')
          .lean();
        
        if (!product) {
          throw new Error('Məhsul tapılmadı / Product not found');
        }
        
        // Increment views / Baxış sayını artır
        await Product.findByIdAndUpdate(input.id, { $inc: { views: 1 } });
        
        return product;
      } catch (error) {
        throw new Error(`Məhsul əldə edilmədi / Failed to fetch product: ${error}`);
      }
    }),
  
  // Get product by slug / Məhsulu slug-a görə əldə et
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const product = await Product.findOne({ slug: input.slug })
          .populate('category', 'name slug')
          .lean();
        
        if (!product) {
          throw new Error('Məhsul tapılmadı / Product not found');
        }
        
        // Increment views / Baxış sayını artır
        await Product.findOneAndUpdate(
          { slug: input.slug },
          { $inc: { views: 1 } }
        );
        
        return product;
      } catch (error) {
        throw new Error(`Məhsul əldə edilmədi / Failed to fetch product: ${error}`);
      }
    }),
  
  // Create product / Məhsul yarat
  create: adminProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        
        // Check if category exists / Kateqoriyanın mövcud olub-olmadığını yoxla
        const category = await Category.findById(input.category);
        if (!category) {
          throw new Error('Kateqoriya tapılmadı / Category not found');
        }
        
        // Check if SKU already exists / SKU-nun artıq mövcud olub-olmadığını yoxla
        const existingProduct = await Product.findOne({ sku: input.sku });
        if (existingProduct) {
          throw new Error('Bu SKU artıq mövcuddur / This SKU already exists');
        }
        
        // Create product / Məhsul yarat
        const product = new Product(input);
        await product.save();
        
        return {
          success: true,
          message: 'Məhsul uğurla yaradıldı / Product created successfully',
          product,
        };
      } catch (error) {
        throw new Error(`Məhsul yaradılmadı / Failed to create product: ${error}`);
      }
    }),
  
  // Update product / Məhsulu yenilə
  update: adminProcedure
    .input(updateProductSchema)
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        
        const { _id, ...updateData } = input;
        
        // Check if product exists / Məhsulun mövcud olub-olmadığını yoxla
        const existingProduct = await Product.findById(_id);
        if (!existingProduct) {
          throw new Error('Məhsul tapılmadı / Product not found');
        }
        
        // Check if SKU already exists (if changed) / SKU-nun artıq mövcud olub-olmadığını yoxla (dəyişdirilərsə)
        if (updateData.sku && updateData.sku !== existingProduct.sku) {
          const skuExists = await Product.findOne({ sku: updateData.sku });
          if (skuExists) {
            throw new Error('Bu SKU artıq mövcuddur / This SKU already exists');
          }
        }
        
        // Update product / Məhsulu yenilə
        const product = await Product.findByIdAndUpdate(
          _id,
          updateData,
          { new: true, runValidators: true }
        );
        
        return {
          success: true,
          message: 'Məhsul uğurla yeniləndi / Product updated successfully',
          product,
        };
      } catch (error) {
        throw new Error(`Məhsul yenilənmədi / Failed to update product: ${error}`);
      }
    }),
  
  // Delete product / Məhsulu sil
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        
        const product = await Product.findByIdAndDelete(input.id);
        if (!product) {
          throw new Error('Məhsul tapılmadı / Product not found');
        }
        
        return {
          success: true,
          message: 'Məhsul uğurla silindi / Product deleted successfully',
        };
      } catch (error) {
        throw new Error(`Məhsul silinmədi / Failed to delete product: ${error}`);
      }
    }),
  
  // Get featured products / Əsas məhsulları əldə et
  getFeatured: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const products = await Product.find({
          featured: true,
          status: 'published',
          isActive: true,
        })
          .populate('category', 'name slug')
          .sort({ sortOrder: 1, createdAt: -1 })
          .limit(input.limit)
          .lean();
        
        return products;
      } catch (error) {
        throw new Error(`Əsas məhsullar əldə edilmədi / Failed to fetch featured products: ${error}`);
      }
    }),
  
  // Get related products / Əlaqəli məhsulları əldə et
  getRelated: publicProcedure
    .input(z.object({
      productId: z.string(),
      limit: z.number().min(1).max(20).default(8),
    }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        // Get current product / Cari məhsulu əldə et
        const currentProduct = await Product.findById(input.productId);
        if (!currentProduct) {
          throw new Error('Məhsul tapılmadı / Product not found');
        }
        
        // Get related products / Əlaqəli məhsulları əldə et
        const products = await Product.find({
          _id: { $ne: input.productId },
          category: currentProduct.category,
          status: 'published',
          isActive: true,
        })
          .populate('category', 'name slug')
          .sort({ views: -1, sales: -1 })
          .limit(input.limit)
          .lean();
        
        return products;
      } catch (error) {
        throw new Error(`Əlaqəli məhsullar əldə edilmədi / Failed to fetch related products: ${error}`);
      }
    }),
  
  // Search products / Məhsulları axtar
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1, 'Axtarış sorğusu tələb olunur / Search query is required'),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const products = await Product.find({
          $or: [
            { 'name.az': { $regex: input.query, $options: 'i' } },
            { 'name.en': { $regex: input.query, $options: 'i' } },
            { 'name.ru': { $regex: input.query, $options: 'i' } },
            { 'description.az': { $regex: input.query, $options: 'i' } },
            { 'description.en': { $regex: input.query, $options: 'i' } },
            { 'description.ru': { $regex: input.query, $options: 'i' } },
            { sku: { $regex: input.query, $options: 'i' } },
            { tags: { $in: [new RegExp(input.query, 'i')] } },
          ],
          status: 'published',
          isActive: true,
        })
          .populate('category', 'name slug')
          .sort({ views: -1, sales: -1 })
          .limit(input.limit)
          .lean();
        
        return products;
      } catch (error) {
        throw new Error(`Axtarış uğursuz oldu / Search failed: ${error}`);
      }
    }),
});
