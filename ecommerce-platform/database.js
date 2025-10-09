// Database integration for E-commerce Platform / E-ticarət platforması üçün verilənlər bazası inteqrasiyası

class Database {
  constructor() {
    this.data = {
      products: [
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
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2025-01-09'),
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
          createdAt: new Date('2024-02-10'),
          updatedAt: new Date('2025-01-08'),
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
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2025-01-07'),
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
          createdAt: new Date('2024-04-12'),
          updatedAt: new Date('2025-01-06'),
        },
      ],
      categories: [
        {
          id: '1',
          name: 'Electronics',
          slug: 'electronics',
          description: 'Electronic devices and accessories',
          imageUrl: '/placeholder-category.jpg',
          productCount: 25,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2025-01-09'),
        },
        {
          id: '2',
          name: 'Wearables',
          slug: 'wearables',
          description: 'Smart watches and fitness trackers',
          imageUrl: '/placeholder-category.jpg',
          productCount: 15,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2025-01-08'),
        },
        {
          id: '3',
          name: 'Photography',
          slug: 'photography',
          description: 'Cameras, lenses and photography equipment',
          imageUrl: '/placeholder-category.jpg',
          productCount: 8,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2025-01-07'),
        },
        {
          id: '4',
          name: 'Furniture',
          slug: 'furniture',
          description: 'Office and home furniture',
          imageUrl: '/placeholder-category.jpg',
          productCount: 12,
          createdAt: new Date('2024-01-04'),
          updatedAt: new Date('2025-01-06'),
        },
      ],
      orders: [
        {
          id: 'ORD-001',
          customer: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1-555-0123',
          },
          items: [
            {
              productId: '1',
              name: 'Premium Wireless Headphones',
              price: 199.99,
              quantity: 1,
              image: '/placeholder-product.jpg',
            },
          ],
          shipping: {
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'US',
          },
          payment: {
            method: 'card',
            status: 'completed',
            transactionId: 'TXN-123456789',
          },
          totals: {
            subtotal: 199.99,
            shipping: 0,
            tax: 16.00,
            total: 215.99,
          },
          status: 'completed',
          createdAt: new Date('2025-01-09T10:30:00Z'),
          updatedAt: new Date('2025-01-09T10:35:00Z'),
        },
        {
          id: 'ORD-002',
          customer: {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1-555-0456',
          },
          items: [
            {
              productId: '2',
              name: 'Smart Fitness Watch',
              price: 299.99,
              quantity: 2,
              image: '/placeholder-product.jpg',
            },
          ],
          shipping: {
            address: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'US',
          },
          payment: {
            method: 'paypal',
            status: 'pending',
            transactionId: null,
          },
          totals: {
            subtotal: 599.98,
            shipping: 0,
            tax: 48.00,
            total: 647.98,
          },
          status: 'pending',
          createdAt: new Date('2025-01-09T14:20:00Z'),
          updatedAt: new Date('2025-01-09T14:20:00Z'),
        },
      ],
      users: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          createdAt: new Date('2024-06-15'),
          lastLogin: new Date('2025-01-09T10:30:00Z'),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'customer',
          createdAt: new Date('2024-07-20'),
          lastLogin: new Date('2025-01-09T14:20:00Z'),
        },
        {
          id: '3',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date('2024-01-01'),
          lastLogin: new Date('2025-01-09T09:00:00Z'),
        },
      ],
      cart: {},
    };
  }

  // Products methods / Məhsullar metodları
  getProducts(filters = {}) {
    let products = [...this.data.products];

    // Apply filters / Filterləri tətbiq et
    if (filters.category) {
      products = products.filter(p => p.category.slug === filters.category);
    }

    if (filters.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }

    if (filters.featured) {
      products = products.filter(p => p.featured === true);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.brand?.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.priceMin !== undefined) {
      products = products.filter(p => p.price.current >= filters.priceMin);
    }

    if (filters.priceMax !== undefined) {
      products = products.filter(p => p.price.current <= filters.priceMax);
    }

    // Apply sorting / Sıralamayı tətbiq et
    if (filters.sortBy) {
      products.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return a.price.current - b.price.current;
          case 'rating':
            return b.rating.average - a.rating.average;
          case 'createdAt':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
    }

    return products;
  }

  getProduct(id) {
    return this.data.products.find(p => p.id === id);
  }

  getProductBySlug(slug) {
    return this.data.products.find(p => p.slug === slug);
  }

  // Categories methods / Kateqoriyalar metodları
  getCategories() {
    return [...this.data.categories];
  }

  getCategory(id) {
    return this.data.categories.find(c => c.id === id);
  }

  getCategoryBySlug(slug) {
    return this.data.categories.find(c => c.slug === slug);
  }

  // Orders methods / Sifarişlər metodları
  getOrders() {
    return [...this.data.orders];
  }

  getOrder(id) {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(orderData) {
    const order = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.data.orders.push(order);
    return order;
  }

  updateOrderStatus(id, status) {
    const order = this.data.orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      return order;
    }
    return null;
  }

  // Users methods / İstifadəçilər metodları
  getUsers() {
    return [...this.data.users];
  }

  getUser(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email === email);
  }

  createUser(userData) {
    const user = {
      id: `USER-${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    
    this.data.users.push(user);
    return user;
  }

  updateUser(id, userData) {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, userData);
      user.updatedAt = new Date();
      return user;
    }
    return null;
  }

  // Cart methods / Səbət metodları
  getCart(userId) {
    return this.data.cart[userId] || [];
  }

  addToCart(userId, productId, quantity = 1) {
    if (!this.data.cart[userId]) {
      this.data.cart[userId] = [];
    }

    const existingItem = this.data.cart[userId].find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const product = this.getProduct(productId);
      if (product) {
        this.data.cart[userId].push({
          productId,
          name: product.name,
          price: product.price.current,
          image: product.images[0],
          quantity,
        });
      }
    }

    return this.getCart(userId);
  }

  removeFromCart(userId, productId) {
    if (this.data.cart[userId]) {
      this.data.cart[userId] = this.data.cart[userId].filter(item => item.productId !== productId);
    }
    return this.getCart(userId);
  }

  updateCartItem(userId, productId, quantity) {
    if (this.data.cart[userId]) {
      const item = this.data.cart[userId].find(item => item.productId === productId);
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(userId, productId);
        } else {
          item.quantity = quantity;
        }
      }
    }
    return this.getCart(userId);
  }

  clearCart(userId) {
    this.data.cart[userId] = [];
    return [];
  }

  // Analytics methods / Analitika metodları
  getDashboardStats() {
    const totalProducts = this.data.products.length;
    const totalOrders = this.data.orders.length;
    const totalUsers = this.data.users.length;
    const totalRevenue = this.data.orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totals.total, 0);

    return {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
    };
  }

  getRecentOrders(limit = 10) {
    return this.data.orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  getTopProducts(limit = 10) {
    const productSales = {};
    
    this.data.orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.name,
            sales: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].sales += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }
}

// Export for use / İstifadə üçün export et
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Database;
}

// Export for browser / Brauzer üçün export et
if (typeof window !== 'undefined') {
  window.Database = Database;
}
