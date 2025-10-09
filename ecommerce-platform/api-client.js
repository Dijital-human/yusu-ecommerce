// API Client for E-commerce Platform / E-ticarət platforması üçün API klienti

class EcommerceAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  // Generic request method / Ümumi sorğu metodu
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products API / Məhsullar API
  async getProducts() {
    return this.request('/products');
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async searchProducts(query) {
    return this.request(`/products/search?q=${encodeURIComponent(query)}`);
  }

  // Categories API / Kateqoriyalar API
  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`);
  }

  // Cart API / Səbət API
  async addToCart(productId, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(productId) {
    return this.request('/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async getCart() {
    return this.request('/cart');
  }

  async updateCartItem(productId, quantity) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  // Orders API / Sifarişlər API
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Payment API / Ödəniş API
  async processPayment(paymentData) {
    return this.request('/payment/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentStatus(paymentId) {
    return this.request(`/payment/${paymentId}/status`);
  }

  // Admin API / Admin API
  async getDashboardData() {
    return this.request('/admin/dashboard');
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getRecentOrders() {
    return this.request('/admin/orders/recent');
  }

  async getTopProducts() {
    return this.request('/admin/products/top');
  }

  // User API / İstifadəçi API
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(userData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
}

// Export for use in browser / Brauzerdə istifadə üçün export et
if (typeof window !== 'undefined') {
  window.EcommerceAPI = EcommerceAPI;
}

// Export for Node.js / Node.js üçün export et
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EcommerceAPI;
}
