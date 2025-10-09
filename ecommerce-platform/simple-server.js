// Simple HTTP Server for E-commerce Platform / E-ticarət platforması üçün sadə HTTP server
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

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

// MIME types / MIME tipləri
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Get MIME type / MIME tipini əldə et
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

// Create server / Server yarat
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers / CORS başlıqlarını təyin et
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests / Preflight sorğularını idarə et
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API routes / API route-ları
  if (pathname.startsWith('/api/')) {
    handleAPI(req, res, pathname, method, parsedUrl.query);
    return;
  }

  // Serve static files / Static faylları serve et
  serveStaticFile(req, res, pathname);
});

// Handle API requests / API sorğularını idarə et
function handleAPI(req, res, pathname, method, query) {
  res.setHeader('Content-Type', 'application/json');

  try {
    // Products API / Məhsullar API
    if (pathname === '/api/products' && method === 'GET') {
      let filteredProducts = [...products];
      
      // Apply filters / Filterləri tətbiq et
      if (query.category) {
        filteredProducts = filteredProducts.filter(p => p.category.slug === query.category);
      }
      
      if (query.brand) {
        filteredProducts = filteredProducts.filter(p => p.brand === query.brand);
      }
      
      if (query.featured === 'true') {
        filteredProducts = filteredProducts.filter(p => p.featured === true);
      }
      
      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.brand?.toLowerCase().includes(searchTerm) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      if (query.priceMin) {
        const minPrice = parseFloat(query.priceMin);
        filteredProducts = filteredProducts.filter(p => p.price.current >= minPrice);
      }
      
      if (query.priceMax) {
        const maxPrice = parseFloat(query.priceMax);
        filteredProducts = filteredProducts.filter(p => p.price.current <= maxPrice);
      }
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: filteredProducts,
        total: filteredProducts.length,
      }));
      return;
    }

    // Categories API / Kateqoriyalar API
    if (pathname === '/api/categories' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: categories,
        total: categories.length,
      }));
      return;
    }

    // Cart API / Səbət API
    if (pathname === '/api/cart/add' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const data = JSON.parse(body);
        console.log(`Adding product ${data.productId} with quantity ${data.quantity} to cart`);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Product added to cart successfully',
          data: {
            productId: data.productId,
            quantity: data.quantity,
            timestamp: new Date().toISOString(),
          },
        }));
      });
      return;
    }

    // Orders API / Sifarişlər API
    if (pathname === '/api/orders' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const orderData = JSON.parse(body);
        const order = {
          id: `ORD-${Date.now()}`,
          ...orderData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          total: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
        
        console.log('Order created:', order);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Order created successfully',
          data: order,
        }));
      });
      return;
    }

    // Payment API / Ödəniş API
    if (pathname === '/api/payment/process' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const paymentData = JSON.parse(body);
        console.log(`Processing payment: ${paymentData.amount} ${paymentData.currency} for order ${paymentData.orderId}`);
        
        const paymentResult = {
          id: `PAY-${Date.now()}`,
          status: 'completed',
          amount: paymentData.amount,
          currency: paymentData.currency,
          orderId: paymentData.orderId,
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
          processedAt: new Date().toISOString(),
        };
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Payment processed successfully',
          data: paymentResult,
        }));
      });
      return;
    }

    // Admin API / Admin API
    if (pathname === '/api/admin/dashboard' && method === 'GET') {
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
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: dashboardData,
      }));
      return;
    }

    // 404 for API / API üçün 404
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      error: 'API endpoint not found',
    }));

  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      error: error.message,
    }));
  }
}

// Serve static files / Static faylları serve et
function serveStaticFile(req, res, pathname) {
  // Default to index.html for root / Kök üçün index.html-ə yönləndir
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath);

  // Check if file exists / Faylın mövcudluğunu yoxla
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found, serve index.html / Fayl tapılmadı, index.html serve et
      const indexPath = path.join(__dirname, 'index.html');
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('File not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }

    // Read and serve file / Faylı oxu və serve et
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }

      res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
      res.end(data);
    });
  });
}

// Start server / Serveri başlat
server.listen(PORT, () => {
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

module.exports = server;
