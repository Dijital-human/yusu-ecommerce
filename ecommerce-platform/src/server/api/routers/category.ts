import { z } from 'zod';
import { createTRPCRouter, publicProcedure, adminProcedure } from '../trpc';
import Category from '../../../lib/models/Category';
import Product from '../../../lib/models/Product';
import { connectDB } from '../trpc';

// Category input schemas / Kateqoriya input şemaları
const createCategorySchema = z.object({
  name: z.object({
    az: z.string().min(1, 'Azərbaycan adı tələb olunur / Azerbaijani name is required'),
    en: z.string().min(1, 'İngilis adı tələb olunur / English name is required'),
    ru: z.string().min(1, 'Rus adı tələb olunur / Russian name is required'),
  }),
  slug: z.string().optional(), // Auto-generated if not provided / Təmin edilməzsə avtomatik yaradılır
  description: z.object({
    az: z.string().optional(),
    en: z.string().optional(),
    ru: z.string().optional(),
  }).optional(),
  parent: z.string().optional(), // Parent category ID / Ana kateqoriya ID
  image: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().default('#3b82f6'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
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
});

const updateCategorySchema = createCategorySchema.partial().extend({
  _id: z.string().min(1, 'Kateqoriya ID tələb olunur / Category ID is required'),
});

const getCategoriesSchema = z.object({
  parent: z.string().optional(), // Get categories by parent / Ana kateqoriyaya görə kateqoriyaları əldə et
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Category router / Kateqoriya router
export const categoryRouter = createTRPCRouter({
  // Get all categories / Bütün kateqoriyaları əldə et
  getAll: publicProcedure
    .input(getCategoriesSchema)
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const { parent, isActive, search, sortBy, sortOrder } = input;
        
        // Build filter / Filter qur
        const filter: any = {};
        
        if (parent !== undefined) {
          filter.parent = parent || null; // null for root categories / null kök kateqoriyalar üçün
        }
        
        if (isActive !== undefined) {
          filter.isActive = isActive;
        }
        
        if (search) {
          filter.$or = [
            { 'name.az': { $regex: search, $options: 'i' } },
            { 'name.en': { $regex: search, $options: 'i' } },
            { 'name.ru': { $regex: search, $options: 'i' } },
            { 'description.az': { $regex: search, $options: 'i' } },
            { 'description.en': { $regex: search, $options: 'i' } },
            { 'description.ru': { $regex: search, $options: 'i' } },
          ];
        }
        
        // Build sort / Sıralama qur
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Execute query / Sorğunu icra et
        const categories = await Category.find(filter)
          .populate('parent', 'name slug')
          .populate('children', 'name slug image')
          .sort(sort)
          .lean();
        
        return categories;
      } catch (error) {
        throw new Error(`Kateqoriyalar əldə edilmədi / Failed to fetch categories: ${error}`);
      }
    }),
  
  // Get category by ID / Kateqoriyanı ID-yə görə əldə et
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const category = await Category.findById(input.id)
          .populate('parent', 'name slug')
          .populate('children', 'name slug image')
          .lean();
        
        if (!category) {
          throw new Error('Kateqoriya tapılmadı / Category not found');
        }
        
        return category;
      } catch (error) {
        throw new Error(`Kateqoriya əldə edilmədi / Failed to fetch category: ${error}`);
      }
    }),
  
  // Get category by slug / Kateqoriyanı slug-a görə əldə et
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const category = await Category.findOne({ slug: input.slug })
          .populate('parent', 'name slug')
          .populate('children', 'name slug image')
          .lean();
        
        if (!category) {
          throw new Error('Kateqoriya tapılmadı / Category not found');
        }
        
        return category;
      } catch (error) {
        throw new Error(`Kateqoriya əldə edilmədi / Failed to fetch category: ${error}`);
      }
    }),
  
  // Create category / Kateqoriya yarat
  create: adminProcedure
    .input(createCategorySchema)
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        
        // Check if parent category exists / Ana kateqoriyanın mövcud olub-olmadığını yoxla
        if (input.parent) {
          const parentCategory = await Category.findById(input.parent);
          if (!parentCategory) {
            throw new Error('Ana kateqoriya tapılmadı / Parent category not found');
          }
        }
        
        // Check if slug already exists / Slug-un artıq mövcud olub-olmadığını yoxla
        if (input.slug) {
          const existingCategory = await Category.findOne({ slug: input.slug });
          if (existingCategory) {
            throw new Error('Bu slug artıq mövcuddur / This slug already exists');
          }
        }
        
        // Create category / Kateqoriya yarat
        const category = new Category(input);
        await category.save();
        
        return {
          success: true,
          message: 'Kateqoriya uğurla yaradıldı / Category created successfully',
          category,
        };
      } catch (error) {
        throw new Error(`Kateqoriya yaradılmadı / Failed to create category: ${error}`);
      }
    }),
  
  // Update category / Kateqoriyanı yenilə
  update: adminProcedure
    .input(updateCategorySchema)
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        
        const { _id, ...updateData } = input;
        
        // Check if category exists / Kateqoriyanın mövcud olub-olmadığını yoxla
        const existingCategory = await Category.findById(_id);
        if (!existingCategory) {
          throw new Error('Kateqoriya tapılmadı / Category not found');
        }
        
        // Check if parent category exists / Ana kateqoriyanın mövcud olub-olmadığını yoxla
        if (updateData.parent) {
          const parentCategory = await Category.findById(updateData.parent);
          if (!parentCategory) {
            throw new Error('Ana kateqoriya tapılmadı / Parent category not found');
          }
          
          // Prevent circular reference / Dairəvi istinadı qadağan et
          if (updateData.parent === _id) {
            throw new Error('Kateqoriya özünün ana kateqoriyası ola bilməz / Category cannot be its own parent');
          }
        }
        
        // Check if slug already exists (if changed) / Slug-un artıq mövcud olub-olmadığını yoxla (dəyişdirilərsə)
        if (updateData.slug && updateData.slug !== existingCategory.slug) {
          const slugExists = await Category.findOne({ slug: updateData.slug });
          if (slugExists) {
            throw new Error('Bu slug artıq mövcuddur / This slug already exists');
          }
        }
        
        // Update category / Kateqoriyanı yenilə
        const category = await Category.findByIdAndUpdate(
          _id,
          updateData,
          { new: true, runValidators: true }
        );
        
        return {
          success: true,
          message: 'Kateqoriya uğurla yeniləndi / Category updated successfully',
          category,
        };
      } catch (error) {
        throw new Error(`Kateqoriya yenilənmədi / Failed to update category: ${error}`);
      }
    }),
  
  // Delete category / Kateqoriyanı sil
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        
        // Check if category has children / Kateqoriyanın uşaqları varmı
        const children = await Category.find({ parent: input.id });
        if (children.length > 0) {
          throw new Error('Bu kateqoriyanın alt kateqoriyaları var, əvvəlcə onları silin / This category has subcategories, delete them first');
        }
        
        // Check if category has products / Kateqoriyanın məhsulları varmı
        const products = await Product.find({ category: input.id });
        if (products.length > 0) {
          throw new Error('Bu kateqoriyada məhsullar var, əvvəlcə onları başqa kateqoriyaya köçürün / This category has products, move them to another category first');
        }
        
        // Delete category / Kateqoriyanı sil
        const category = await Category.findByIdAndDelete(input.id);
        if (!category) {
          throw new Error('Kateqoriya tapılmadı / Category not found');
        }
        
        return {
          success: true,
          message: 'Kateqoriya uğurla silindi / Category deleted successfully',
        };
      } catch (error) {
        throw new Error(`Kateqoriya silinmədi / Failed to delete category: ${error}`);
      }
    }),
  
  // Get category tree / Kateqoriya ağacını əldə et
  getTree: publicProcedure
    .query(async () => {
      try {
        await connectDB();
        
        // Get all categories / Bütün kateqoriyaları əldə et
        const categories = await Category.find({ isActive: true })
          .sort({ sortOrder: 1, 'name.az': 1 })
          .lean();
        
        // Build tree structure / Ağac strukturu qur
        const buildTree = (parentId: string | null = null): any[] => {
          return categories
            .filter(cat => cat.parent?.toString() === parentId)
            .map(cat => ({
              ...cat,
              children: buildTree(cat._id.toString()),
            }));
        };
        
        return buildTree();
      } catch (error) {
        throw new Error(`Kateqoriya ağacı əldə edilmədi / Failed to fetch category tree: ${error}`);
      }
    }),
  
  // Get category breadcrumb / Kateqoriya breadcrumb əldə et
  getBreadcrumb: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const breadcrumb = [];
        let currentCategory = await Category.findById(input.id);
        
        while (currentCategory) {
          breadcrumb.unshift({
            _id: currentCategory._id,
            name: currentCategory.name,
            slug: currentCategory.slug,
          });
          
          if (currentCategory.parent) {
            currentCategory = await Category.findById(currentCategory.parent);
          } else {
            break;
          }
        }
        
        return breadcrumb;
      } catch (error) {
        throw new Error(`Breadcrumb əldə edilmədi / Failed to fetch breadcrumb: ${error}`);
      }
    }),
  
  // Get category statistics / Kateqoriya statistikalarını əldə et
  getStats: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const category = await Category.findById(input.id);
        if (!category) {
          throw new Error('Kateqoriya tapılmadı / Category not found');
        }
        
        // Get product count / Məhsul sayını əldə et
        const productCount = await Product.countDocuments({ category: input.id });
        
        // Get subcategory count / Alt kateqoriya sayını əldə et
        const subcategoryCount = await Category.countDocuments({ parent: input.id });
        
        // Get total views / Ümumi baxış sayını əldə et
        const totalViews = await Product.aggregate([
          { $match: { category: input.id } },
          { $group: { _id: null, totalViews: { $sum: '$views' } } },
        ]);
        
        // Get total sales / Ümumi satış sayını əldə et
        const totalSales = await Product.aggregate([
          { $match: { category: input.id } },
          { $group: { _id: null, totalSales: { $sum: '$sales' } } },
        ]);
        
        return {
          productCount,
          subcategoryCount,
          totalViews: totalViews[0]?.totalViews || 0,
          totalSales: totalSales[0]?.totalSales || 0,
        };
      } catch (error) {
        throw new Error(`Statistikalar əldə edilmədi / Failed to fetch statistics: ${error}`);
      }
    }),
});
