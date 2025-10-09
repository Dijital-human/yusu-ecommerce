// Payment processing for E-commerce Platform / E-ticarət platforması üçün ödəniş emalı

class PaymentProcessor {
  constructor() {
    this.paymentMethods = {
      card: {
        name: 'Credit/Debit Card',
        icon: '💳',
        supported: true,
        fees: 0.029, // 2.9% fee
      },
      paypal: {
        name: 'PayPal',
        icon: '🅿️',
        supported: true,
        fees: 0.034, // 3.4% fee
      },
      stripe: {
        name: 'Stripe',
        icon: '💳',
        supported: true,
        fees: 0.029, // 2.9% fee
      },
      apple_pay: {
        name: 'Apple Pay',
        icon: '🍎',
        supported: true,
        fees: 0.015, // 1.5% fee
      },
      google_pay: {
        name: 'Google Pay',
        icon: '🔵',
        supported: true,
        fees: 0.015, // 1.5% fee
      },
    };

    this.currencies = {
      USD: { symbol: '$', name: 'US Dollar' },
      EUR: { symbol: '€', name: 'Euro' },
      GBP: { symbol: '£', name: 'British Pound' },
      CAD: { symbol: 'C$', name: 'Canadian Dollar' },
      AUD: { symbol: 'A$', name: 'Australian Dollar' },
    };
  }

  // Validate payment data / Ödəniş məlumatlarını yoxla
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid amount');
    }

    if (!paymentData.currency || !this.currencies[paymentData.currency]) {
      errors.push('Invalid currency');
    }

    if (!paymentData.paymentMethod || !this.paymentMethods[paymentData.paymentMethod]) {
      errors.push('Invalid payment method');
    }

    if (paymentData.paymentMethod === 'card') {
      if (!paymentData.cardNumber || !this.validateCardNumber(paymentData.cardNumber)) {
        errors.push('Invalid card number');
      }
      if (!paymentData.expiryDate || !this.validateExpiryDate(paymentData.expiryDate)) {
        errors.push('Invalid expiry date');
      }
      if (!paymentData.cvv || !this.validateCVV(paymentData.cvv)) {
        errors.push('Invalid CVV');
      }
      if (!paymentData.cardName) {
        errors.push('Cardholder name is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate card number / Kart nömrəsini yoxla
  validateCardNumber(cardNumber) {
    // Remove spaces and non-digits / Boşluqları və rəqəm olmayan simvolları sil
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Check length / Uzunluğu yoxla
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn algorithm / Luhn alqoritmi
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Validate expiry date / Son istifadə tarixini yoxla
  validateExpiryDate(expiryDate) {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    const match = expiryDate.match(regex);
    
    if (!match) return false;

    const month = parseInt(match[1]);
    const year = parseInt('20' + match[2]);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  }

  // Validate CVV / CVV yoxla
  validateCVV(cvv) {
    const regex = /^[0-9]{3,4}$/;
    return regex.test(cvv);
  }

  // Process payment / Ödənişi emal et
  async processPayment(paymentData) {
    try {
      // Validate payment data / Ödəniş məlumatlarını yoxla
      const validation = this.validatePaymentData(paymentData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Calculate fees / Komissiyaları hesabla
      const feeRate = this.paymentMethods[paymentData.paymentMethod].fees;
      const fee = paymentData.amount * feeRate;
      const netAmount = paymentData.amount - fee;

      // Simulate payment processing / Ödəniş emalını simulyasiya et
      const processingResult = await this.simulatePaymentProcessing(paymentData);

      if (processingResult.success) {
        return {
          success: true,
          transactionId: processingResult.transactionId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          fee: fee,
          netAmount: netAmount,
          paymentMethod: paymentData.paymentMethod,
          status: 'completed',
          processedAt: new Date().toISOString(),
          receipt: {
            transactionId: processingResult.transactionId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            fee: fee,
            netAmount: netAmount,
            paymentMethod: paymentData.paymentMethod,
            processedAt: new Date().toISOString(),
          },
        };
      } else {
        throw new Error(processingResult.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed',
        processedAt: new Date().toISOString(),
      };
    }
  }

  // Simulate payment processing / Ödəniş emalını simulyasiya et
  async simulatePaymentProcessing(paymentData) {
    // Simulate network delay / Şəbəkə gecikməsini simulyasiya et
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate success/failure / Uğur/uğursuzluğu simulyasiya et
    const successRate = 0.95; // 95% success rate / 95% uğur nisbəti
    const isSuccess = Math.random() < successRate;

    if (isSuccess) {
      return {
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        authorizationCode: `AUTH-${Math.random().toString(36).substr(2, 8)}`,
      };
    } else {
      return {
        success: false,
        error: 'Payment declined by bank',
      };
    }
  }

  // Get supported payment methods / Dəstəklənən ödəniş üsullarını əldə et
  getSupportedPaymentMethods() {
    return Object.entries(this.paymentMethods)
      .filter(([key, method]) => method.supported)
      .map(([key, method]) => ({
        id: key,
        name: method.name,
        icon: method.icon,
        fees: method.fees,
      }));
  }

  // Get supported currencies / Dəstəklənən valyutaları əldə et
  getSupportedCurrencies() {
    return Object.entries(this.currencies).map(([code, info]) => ({
      code,
      symbol: info.symbol,
      name: info.name,
    }));
  }

  // Calculate fees / Komissiyaları hesabla
  calculateFees(amount, paymentMethod, currency = 'USD') {
    const method = this.paymentMethods[paymentMethod];
    if (!method) {
      throw new Error('Unsupported payment method');
    }

    const feeRate = method.fees;
    const fee = amount * feeRate;
    const netAmount = amount - fee;

    return {
      amount,
      fee,
      netAmount,
      feeRate,
      currency,
    };
  }

  // Format amount / Məbləği formatla
  formatAmount(amount, currency = 'USD') {
    const currencyInfo = this.currencies[currency];
    if (!currencyInfo) {
      throw new Error('Unsupported currency');
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Get payment status / Ödəniş statusunu əldə et
  getPaymentStatus(transactionId) {
    // Simulate checking payment status / Ödəniş statusunu yoxlama simulyasiyası
    const statuses = ['pending', 'completed', 'failed', 'refunded'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      transactionId,
      status: randomStatus,
      checkedAt: new Date().toISOString(),
    };
  }

  // Refund payment / Ödənişi geri qaytar
  async refundPayment(transactionId, amount, reason = 'Customer request') {
    try {
      // Simulate refund processing / Geri qaytarma emalını simulyasiya et
      await new Promise(resolve => setTimeout(resolve, 1000));

      const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        refundId,
        transactionId,
        amount,
        reason,
        processedAt: new Date().toISOString(),
        status: 'completed',
      };
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed',
      };
    }
  }
}

// Export for use / İstifadə üçün export et
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaymentProcessor;
}

// Export for browser / Brauzer üçün export et
if (typeof window !== 'undefined') {
  window.PaymentProcessor = PaymentProcessor;
}
