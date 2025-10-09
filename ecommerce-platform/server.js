// Advanced E-commerce Platform Server / Qabaqcıl E-ticarət Platforması Serveri
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware / Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files / Static faylları serve et
app.use(express.static('.'));

// Mock data / Mock məlumatlar
const products = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    price: {
      current: 199.99,
      original: 249.99,
      currency: 'USD',
    },
    images: ['/placeholder-product.jpg'],
    category: {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
    },
    brand: 'TechBrand',
    tags: ['wireless', 'premium', 'audio'],
    stock: {
      quantity: 50,
      trackStock: true,
    },
    rating: {
      average: 4.5,
      count: 128,
    },
    views: 1250,
    sales: 89,
    featured: true,
    isActive: true,
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    price: {
      current: 299.99,
      currency: 'USD',
    },
    images: ['/placeholder-product.jpg'],
    category: {
      id: '2',
      name: 'Wearables',
      slug: 'wearables',
    },
    brand: 'FitTech',
    tags: ['fitness', 'smart', 'watch'],
    stock: {
      quantity: 25,
      trackStock: true,
    },
    rating: {
      average: 4.2,
      count: 95,
    },
    views: 980,
    sales: 67,
    featured: false,
    isActive: true,
  },
  {
    id: '3',
    name: 'Professional Camera Lens',
    slug: 'professional-camera-lens',
    price: {
      current: 899.99,
      original: 1099.99,
      currency: 'USD',
    },
    images: ['/placeholder-product.jpg'],
    category: {
      id: '3',
      name: 'Photography',
      slug: 'photography',
    },
    brand: 'PhotoPro',
    tags: ['camera', 'lens', 'professional'],
    stock: {
      quantity: 12,
      trackStock: true,
    },
    rating: {
      average: 4.8,
      count: 45,
    },
    views: 756,
    sales: 23,
    featured: true,
    isActive: true,
  },
  {
    id: '4',
    name: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    price: {
      current: 399.99,
      currency: 'USD',
    },
    images: ['/placeholder-product.jpg'],
    category: {
      id: '4',
      name: 'Furniture',
      slug: 'furniture',
    },
    brand: 'ComfortPlus',
    tags: ['office', 'ergonomic', 'chair'],
    stock: {
      quantity: 8,
      trackStock: true,
    },
    rating: {
      average: 4.3,
      count: 156,
    },
    views: 1120,
    sales: 34,
    featured: false,
    isActive: true,
  },
];

const categories = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and accessories',
    imageUrl: '/placeholder-category.jpg',
    productCount: 25,
  },
  {
    id: '2',
    name: 'Wearables',
    slug: 'wearables',
    description: 'Smart watches and fitness trackers',
    imageUrl: '/placeholder-category.jpg',
    productCount: 15,
  },
  {
    id: '3',
    name: 'Photography',
    slug: 'photography',
    description: 'Cameras, lenses and photography equipment',
    imageUrl: '/placeholder-category.jpg',
    productCount: 8,
  },
  {
    id: '4',
    name: 'Furniture',
    slug: 'furniture',
    description: 'Office and home furniture',
    imageUrl: '/placeholder-category.jpg',
    productCount: 12,
  },
];

// API routes / API route-ları

// Products API / Məhsullar API
app.get('/api/products', (req, res) => {
  try {
    let filteredProducts = [...products];
    
    // Apply filters / Filterləri tətbiq et
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(p => p.category.slug === req.query.category);
    }
    
    if (req.query.brand) {
      filteredProducts = filteredProducts.filter(p => p.brand === req.query.brand);
    }
    
    if (req.query.featured === 'true') {
      filteredProducts = filteredProducts.filter(p => p.featured === true);
    }
    
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.brand?.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (req.query.priceMin) {
      const minPrice = parseFloat(req.query.priceMin);
      filteredProducts = filteredProducts.filter(p => p.price.current >= minPrice);
    }
    
    if (req.query.priceMax) {
      const maxPrice = parseFloat(req.query.priceMax);
      filteredProducts = filteredProducts.filter(p => p.price.current <= maxPrice);
    }
    
    // Apply sorting / Sıralamayı tətbiq et
    if (req.query.sortBy) {
      filteredProducts.sort((a, b) => {
        switch (req.query.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return a.price.current - b.price.current;
          case 'rating':
            return b.rating.average - a.rating.average;
          default:
            return 0;
        }
      });
    }
    
    res.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
    
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Categories API / Kateqoriyalar API
app.get('/api/categories', (req, res) => {
  try {
    res.json({
      success: true,
      data: categories,
      total: categories.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/api/categories/:id', (req, res) => {
  try {
    const category = categories.find(c => c.id === req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
    
    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Cart API / Səbət API
app.post('/api/cart/add', (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    console.log(`Adding product ${productId} with quantity ${quantity} to cart`);
    
    res.json({
      success: true,
      message: 'Product added to cart successfully',
      data: {
        productId,
        quantity,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/api/cart/remove', (req, res) => {
  try {
    const { productId } = req.body;
    
    console.log(`Removing product ${productId} from cart`);
    
    res.json({
      success: true,
      message: 'Product removed from cart successfully',
      data: {
        productId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Orders API / Sifarişlər API
app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    
    // Simulate order creation / Sifariş yaratma simulyasiyası
    const order = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    };
    
    console.log('Order created:', order);
    
    res.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Payment API / Ödəniş API
app.post('/api/payment/process', (req, res) => {
  try {
    const { amount, currency, paymentMethod, orderId } = req.body;
    
    // Simulate payment processing / Ödəniş emalını simulyasiya et
    console.log(`Processing payment: ${amount} ${currency} for order ${orderId}`);
    
    // Simulate payment success / Ödəniş uğurunu simulyasiya et
    const paymentResult = {
      id: `PAY-${Date.now()}`,
      status: 'completed',
      amount,
      currency,
      orderId,
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
      processedAt: new Date().toISOString(),
    };
    
    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: paymentResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/api/payment/methods', (req, res) => {
  try {
    const methods = [
      { id: 'card', name: 'Credit/Debit Card', icon: '💳', fees: 0.029 },
      { id: 'paypal', name: 'PayPal', icon: '🅿️', fees: 0.034 },
      { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', fees: 0.015 },
      { id: 'google_pay', name: 'Google Pay', icon: '🔵', fees: 0.015 },
    ];
    
    res.json({
      success: true,
      data: methods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Admin API / Admin API
app.get('/api/admin/dashboard', (req, res) => {
  try {
    const dashboardData = {
      stats: {
        totalProducts: products.length,
        totalOrders: 89,
        totalRevenue: 125430.50,
        totalCustomers: 234,
      },
      recentOrders: [
        {
          id: 'ORD-001',
          customer: 'John Doe',
          total: 299.99,
          status: 'completed',
          date: '2025-01-09',
        },
        {
          id: 'ORD-002',
          customer: 'Jane Smith',
          total: 199.99,
          status: 'pending',
          date: '2025-01-09',
        },
      ],
      topProducts: [
        {
          name: 'Premium Wireless Headphones',
          sales: 45,
          revenue: 8995.55,
        },
        {
          name: 'Smart Fitness Watch',
          sales: 32,
          revenue: 9599.68,
        },
      ],
    };
    
    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Serve main page / Ana səhifəni serve et
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server / Serveri başlat
app.listen(PORT, () => {
  console.log(`🚀 E-commerce Platform Server running on http://localhost:${PORT}`);
  console.log(`📱 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`🛍️ Products: http://localhost:${PORT}/products`);
  console.log(`🛒 Cart: http://localhost:${PORT}/cart`);
  console.log(`💳 Checkout: http://localhost:${PORT}/checkout`);
  console.log(`\n✨ Features:`);
  console.log(`   • API endpoints for products, cart, orders`);
  console.log(`   • Payment processing simulation`);
  console.log(`   • Admin dashboard data`);
  console.log(`   • Responsive design`);
  console.log(`   • Dark mode support`);
  console.log(`\n🔗 API Endpoints:`);
  console.log(`   • GET  /api/products`);
  console.log(`   • GET  /api/categories`);
  console.log(`   • POST /api/cart/add`);
  console.log(`   • POST /api/orders`);
  console.log(`   • POST /api/payment/process`);
  console.log(`   • GET  /api/admin/dashboard`);
});

module.exports = app;