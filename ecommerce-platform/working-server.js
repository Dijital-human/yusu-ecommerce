// Working E-commerce Platform Server / İşləyən E-ticarət Platforması Serveri
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
    price: { current: 199.99, original: 249.99, currency: 'USD' },
    images: ['/placeholder-product.jpg'],
    category: { name: 'Electronics' },
    brand: 'TechBrand',
    stock: { quantity: 50 },
    rating: { average: 4.5, count: 128 },
    featured: true
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: { current: 299.99, currency: 'USD' },
    images: ['/placeholder-product.jpg'],
    category: { name: 'Wearables' },
    brand: 'FitTech',
    stock: { quantity: 25 },
    rating: { average: 4.2, count: 95 },
    featured: false
  },
  {
    id: '3',
    name: 'Professional Camera Lens',
    price: { current: 899.99, original: 1099.99, currency: 'USD' },
    images: ['/placeholder-product.jpg'],
    category: { name: 'Photography' },
    brand: 'PhotoPro',
    stock: { quantity: 12 },
    rating: { average: 4.8, count: 45 },
    featured: true
  }
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
  '.svg': 'image/svg+xml'
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
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: products,
        total: products.length
      }));
      return;
    }

    // Categories API / Kateqoriyalar API
    if (pathname === '/api/categories' && method === 'GET') {
      const categories = [
        { id: '1', name: 'Electronics', productCount: 25 },
        { id: '2', name: 'Wearables', productCount: 15 },
        { id: '3', name: 'Photography', productCount: 8 }
      ];
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: categories,
        total: categories.length
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
        console.log(`Adding product ${data.productId} to cart`);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Product added to cart successfully',
          data: {
            productId: data.productId,
            quantity: data.quantity,
            timestamp: new Date().toISOString()
          }
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
          createdAt: new Date().toISOString()
        };
        
        console.log('Order created:', order);
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Order created successfully',
          data: order
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
        console.log(`Processing payment: ${paymentData.amount} ${paymentData.currency}`);
        
        const paymentResult = {
          id: `PAY-${Date.now()}`,
          status: 'completed',
          amount: paymentData.amount,
          currency: paymentData.currency,
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9)}`,
          processedAt: new Date().toISOString()
        };
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Payment processed successfully',
          data: paymentResult
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
          totalCustomers: 234
        },
        recentOrders: [
          { id: 'ORD-001', customer: 'John Doe', total: 299.99, status: 'completed' },
          { id: 'ORD-002', customer: 'Jane Smith', total: 199.99, status: 'pending' }
        ],
        topProducts: [
          { name: 'Premium Wireless Headphones', sales: 45, revenue: 8995.55 },
          { name: 'Smart Fitness Watch', sales: 32, revenue: 9599.68 }
        ]
      };
      
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: dashboardData
      }));
      return;
    }

    // 404 for API / API üçün 404
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      error: 'API endpoint not found'
    }));

  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      error: error.message
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

// Handle server errors / Server xətalarını idarə et
server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = server;
