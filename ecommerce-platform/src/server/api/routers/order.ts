import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import Order from '../../../lib/models/Order';
import Product from '../../../lib/models/Product';
import User from '../../../lib/models/User';
import { connectDB } from '../trpc';

// Order input schemas / Sifariş input şemaları
const createOrderSchema = z.object({
  customer: z.string().min(1, 'Müştəri tələb olunur / Customer is required'),
  items: z.array(z.object({
    product: z.string().min(1, 'Məhsul tələb olunur / Product is required'),
    variant: z.string().optional(),
    quantity: z.number().min(1, 'Miqdar ən azı 1 olmalıdır / Quantity must be at least 1'),
  })).min(1, 'Ən azı bir məhsul tələb olunur / At least one product is required'),
  shipping: z.object({
    method: z.string().min(1, 'Çatdırılma üsulu tələb olunur / Shipping method is required'),
    cost: z.number().min(0, 'Çatdırılma qiyməti mənfi ola bilməz / Shipping cost cannot be negative'),
    address: z.object({
      firstName: z.string().min(1, 'Ad tələb olunur / First name is required'),
      lastName: z.string().min(1, 'Soyad tələb olunur / Last name is required'),
      company: z.string().optional(),
      address1: z.string().min(1, 'Ünvan tələb olunur / Address is required'),
      address2: z.string().optional(),
      city: z.string().min(1, 'Şəhər tələb olunur / City is required'),
      state: z.string().optional(),
      postalCode: z.string().min(1, 'Poçt kodu tələb olunur / Postal code is required'),
      country: z.string().min(1, 'Ölkə tələb olunur / Country is required'),
      phone: z.string().min(1, 'Telefon tələb olunur / Phone is required'),
    }),
  }),
  billing: z.object({
    address: z.object({
      firstName: z.string().min(1, 'Ad tələb olunur / First name is required'),
      lastName: z.string().min(1, 'Soyad tələb olunur / Last name is required'),
      company: z.string().optional(),
      address1: z.string().min(1, 'Ünvan tələb olunur / Address is required'),
      address2: z.string().optional(),
      city: z.string().min(1, 'Şəhər tələb olunur / City is required'),
      state: z.string().optional(),
      postalCode: z.string().min(1, 'Poçt kodu tələb olunur / Postal code is required'),
      country: z.string().min(1, 'Ölkə tələb olunur / Country is required'),
      phone: z.string().min(1, 'Telefon tələb olunur / Phone is required'),
    }),
    taxNumber: z.string().optional(),
    sameAsShipping: z.boolean().default(false),
  }),
  payment: z.object({
    method: z.enum(['stripe', 'paypal', 'bank_transfer', 'cash_on_delivery']),
  }),
  notes: z.string().optional(),
});

const updateOrderSchema = z.object({
  _id: z.string().min(1, 'Sifariş ID tələb olunur / Order ID is required'),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.date().optional(),
  notes: z.string().optional(),
});

const getOrdersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  customer: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(['createdAt', 'orderNumber', 'totals.total']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Order router / Sifariş router
export const orderRouter = createTRPCRouter({
  // Get all orders / Bütün sifarişləri əldə et
  getAll: adminProcedure
    .input(getOrdersSchema)
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const {
          page,
          limit,
          status,
          customer,
          dateFrom,
          dateTo,
          sortBy,
          sortOrder,
        } = input;
        
        // Build filter / Filter qur
        const filter: any = {};
        
        if (status) {
          filter.status = status;
        }
        
        if (customer) {
          filter.customer = customer;
        }
        
        if (dateFrom || dateTo) {
          filter.createdAt = {};
          if (dateFrom) {
            filter.createdAt.$gte = dateFrom;
          }
          if (dateTo) {
            filter.createdAt.$lte = dateTo;
          }
        }
        
        // Build sort / Sıralama qur
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        
        // Calculate pagination / Səhifələmə hesabla
        const skip = (page - 1) * limit;
        
        // Execute query / Sorğunu icra et
        const [orders, total] = await Promise.all([
          Order.find(filter)
            .populate('customer', 'firstName lastName email')
            .populate('items.product', 'name sku images')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
          Order.countDocuments(filter),
        ]);
        
        return {
          orders,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        throw new Error(`Sifarişlər əldə edilmədi / Failed to fetch orders: ${error}`);
      }
    }),
  
  // Get order by ID / Sifarişi ID-yə görə əldə et
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        await connectDB();
        
        const order = await Order.findById(input.id)
          .populate('customer', 'firstName lastName email phone')
          .populate('items.product', 'name sku images')
          .lean();
        
        if (!order) {
          throw new Error('Sifariş tapılmadı / Order not found');
        }
        
        // Check if user can access this order / İstifadəçinin bu sifarişə girişi varmı
        if (ctx.session.user.role !== 'admin' && order.customer._id.toString() !== ctx.session.user.id) {
          throw new Error('Bu sifarişə giriş icazəniz yoxdur / You do not have access to this order');
        }
        
        return order;
      } catch (error) {
        throw new Error(`Sifariş əldə edilmədi / Failed to fetch order: ${error}`);
      }
    }),
  
  // Get order by order number / Sifarişi sifariş nömrəsinə görə əldə et
  getByOrderNumber: protectedProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        await connectDB();
        
        const order = await Order.findOne({ orderNumber: input.orderNumber })
          .populate('customer', 'firstName lastName email phone')
          .populate('items.product', 'name sku images')
          .lean();
        
        if (!order) {
          throw new Error('Sifariş tapılmadı / Order not found');
        }
        
        // Check if user can access this order / İstifadəçinin bu sifarişə girişi varmı
        if (ctx.session.user.role !== 'admin' && order.customer._id.toString() !== ctx.session.user.id) {
          throw new Error('Bu sifarişə giriş icazəniz yoxdur / You do not have access to this order');
        }
        
        return order;
      } catch (error) {
        throw new Error(`Sifariş əldə edilmədi / Failed to fetch order: ${error}`);
      }
    }),
  
  // Create order / Sifariş yarat
  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await connectDB();
        
        // Verify customer / Müştəri yoxla
        const customer = await User.findById(input.customer);
        if (!customer) {
          throw new Error('Müştəri tapılmadı / Customer not found');
        }
        
        // Check if user can create order for this customer / İstifadəçinin bu müştəri üçün sifariş yarada biləcəyini yoxla
        if (ctx.session.user.role !== 'admin' && input.customer !== ctx.session.user.id) {
          throw new Error('Bu müştəri üçün sifariş yarada bilməzsiniz / You cannot create order for this customer');
        }
        
        // Verify products and calculate totals / Məhsulları yoxla və cəmləri hesabla
        const orderItems = [];
        let subtotal = 0;
        
        for (const item of input.items) {
          const product = await Product.findById(item.product);
          if (!product) {
            throw new Error(`Məhsul tapılmadı / Product not found: ${item.product}`);
          }
          
          // Check stock / Stoku yoxla
          if (product.stock.trackStock && product.stock.quantity < item.quantity) {
            throw new Error(`Stok kifayət etmir / Insufficient stock for product: ${product.name.az}`);
          }
          
          const itemTotal = product.price.current * item.quantity;
          subtotal += itemTotal;
          
          orderItems.push({
            product: item.product,
            variant: item.variant,
            name: product.name,
            sku: product.sku,
            price: product.price.current,
            quantity: item.quantity,
            total: itemTotal,
            image: product.images[0],
            attributes: product.attributes,
          });
        }
        
        // Calculate totals / Cəmləri hesabla
        const shipping = input.shipping.cost;
        const tax = subtotal * 0.18; // 18% VAT / 18% ƏDV
        const discount = 0; // Can be calculated based on coupons / Kuponlara əsasən hesablana bilər
        const total = subtotal + shipping + tax - discount;
        
        // Create order / Sifariş yarat
        const order = new Order({
          customer: input.customer,
          items: orderItems,
          shipping: {
            ...input.shipping,
            trackingNumber: undefined,
            estimatedDelivery: undefined,
            deliveredAt: undefined,
          },
          billing: input.billing,
          payment: {
            method: input.payment.method,
            status: 'pending',
          },
          totals: {
            subtotal,
            shipping,
            tax,
            discount,
            total,
            currency: 'AZN',
          },
          notes: input.notes,
        });
        
        await order.save();
        
        // Update product stock / Məhsul stokunu yenilə
        for (const item of input.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { 'stock.quantity': -item.quantity },
          });
        }
        
        return {
          success: true,
          message: 'Sifariş uğurla yaradıldı / Order created successfully',
          order,
        };
      } catch (error) {
        throw new Error(`Sifariş yaradılmadı / Failed to create order: ${error}`);
      }
    }),
  
  // Update order / Sifarişi yenilə
  update: adminProcedure
    .input(updateOrderSchema)
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        
        const { _id, ...updateData } = input;
        
        // Check if order exists / Sifarişin mövcud olub-olmadığını yoxla
        const existingOrder = await Order.findById(_id);
        if (!existingOrder) {
          throw new Error('Sifariş tapılmadı / Order not found');
        }
        
        // Update order / Sifarişi yenilə
        const order = await Order.findByIdAndUpdate(
          _id,
          updateData,
          { new: true, runValidators: true }
        );
        
        return {
          success: true,
          message: 'Sifariş uğurla yeniləndi / Order updated successfully',
          order,
        };
      } catch (error) {
        throw new Error(`Sifariş yenilənmədi / Failed to update order: ${error}`);
      }
    }),
  
  // Update order status / Sifariş statusunu yenilə
  updateStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
    }))
    .mutation(async ({ input }) => {
      try {
        await connectDB();
        
        const order = await Order.findById(input.id);
        if (!order) {
          throw new Error('Sifariş tapılmadı / Order not found');
        }
        
        // Update status / Statusu yenilə
        await order.updateStatus(input.status);
        
        return {
          success: true,
          message: 'Sifariş statusu uğurla yeniləndi / Order status updated successfully',
          order,
        };
      } catch (error) {
        throw new Error(`Sifariş statusu yenilənmədi / Failed to update order status: ${error}`);
      }
    }),
  
  // Get user orders / İstifadəçi sifarişlərini əldə et
  getUserOrders: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        await connectDB();
        
        const { page, limit, status } = input;
        
        // Build filter / Filter qur
        const filter: any = {
          customer: ctx.session.user.id,
        };
        
        if (status) {
          filter.status = status;
        }
        
        // Calculate pagination / Səhifələmə hesabla
        const skip = (page - 1) * limit;
        
        // Execute query / Sorğunu icra et
        const [orders, total] = await Promise.all([
          Order.find(filter)
            .populate('items.product', 'name sku images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Order.countDocuments(filter),
        ]);
        
        return {
          orders,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        throw new Error(`İstifadəçi sifarişləri əldə edilmədi / Failed to fetch user orders: ${error}`);
      }
    }),
  
  // Get order statistics / Sifariş statistikalarını əldə et
  getStats: adminProcedure
    .input(z.object({
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ input }) => {
      try {
        await connectDB();
        
        const { dateFrom, dateTo } = input;
        
        // Build date filter / Tarix filteri qur
        const dateFilter: any = {};
        if (dateFrom || dateTo) {
          dateFilter.createdAt = {};
          if (dateFrom) {
            dateFilter.createdAt.$gte = dateFrom;
          }
          if (dateTo) {
            dateFilter.createdAt.$lte = dateTo;
          }
        }
        
        // Get order counts by status / Statusa görə sifariş saylarını əldə et
        const statusCounts = await Order.aggregate([
          { $match: dateFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        
        // Get total revenue / Ümumi gəliri əldə et
        const revenue = await Order.aggregate([
          { $match: { ...dateFilter, status: { $in: ['delivered', 'shipped'] } } },
          { $group: { _id: null, total: { $sum: '$totals.total' } } },
        ]);
        
        // Get average order value / Orta sifariş dəyərini əldə et
        const avgOrderValue = await Order.aggregate([
          { $match: { ...dateFilter, status: { $in: ['delivered', 'shipped'] } } },
          { $group: { _id: null, avg: { $avg: '$totals.total' } } },
        ]);
        
        return {
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          totalRevenue: revenue[0]?.total || 0,
          averageOrderValue: avgOrderValue[0]?.avg || 0,
        };
      } catch (error) {
        throw new Error(`Statistikalar əldə edilmədi / Failed to fetch statistics: ${error}`);
      }
    }),
});
