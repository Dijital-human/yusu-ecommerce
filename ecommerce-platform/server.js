// Advanced E-commerce Platform Server / Qabaqcıl E-ticarət Platforması Serveri
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import our modules / Modullarımızı import et
const Database = require('./database');
const PaymentProcessor = require('./payment');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database and payment processor / Verilənlər bazası və ödəniş prosessorunu başlat
const db = new Database();
const paymentProcessor = new PaymentProcessor();

// Middleware / Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files / Static faylları serve et
app.use(express.static('.'));

// API routes / API route-ları
app.use('/api', express.json());

// Products API / Məhsullar API
app.get('/api/products', (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      brand: req.query.brand,
      featured: req.query.featured === 'true',
      search: req.query.search,
      priceMin: req.query.priceMin ? parseFloat(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? parseFloat(req.query.priceMax) : undefined,
      sortBy: req.query.sortBy || 'createdAt',
    };

    const products = db.getProducts(filters);
    
    res.json({
      success: true,
      data: products,
      total: products.length,
      filters: filters,
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
    const product = db.getProduct(req.params.id);
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

  res.json({
    success: true,
    data: categories,
    total: categories.length,
  });
});

// Cart API / Səbət API
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  // Simulate adding to cart / Səbətə əlavə etməni simulyasiya et
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
});

app.post('/api/cart/remove', (req, res) => {
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
});

// Orders API / Sifarişlər API
app.post('/api/orders', (req, res) => {
  const orderData = req.body;
  
  // Simulate order creation / Sifariş yaratma simulyasiyası
  const order = {
    id: `ORD-${Date.now()}`,
    ...orderData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0,
  };
  
  console.log('Order created:', order);
  
  res.json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

// Payment API / Ödəniş API
app.post('/api/payment/process', async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Process payment using PaymentProcessor / PaymentProcessor istifadə edərək ödənişi emal et
    const result = await paymentProcessor.processPayment(paymentData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        data: result,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/api/payment/methods', (req, res) => {
  try {
    const methods = paymentProcessor.getSupportedPaymentMethods();
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

app.get('/api/payment/currencies', (req, res) => {
  try {
    const currencies = paymentProcessor.getSupportedCurrencies();
    res.json({
      success: true,
      data: currencies,
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
  const dashboardData = {
    stats: {
      totalProducts: 156,
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
});

module.exports = app;
