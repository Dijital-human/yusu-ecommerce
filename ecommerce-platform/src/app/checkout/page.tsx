'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Truck, 
  Shield, 
  Check, 
  Lock, 
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

// Checkout page komponenti / Checkout page component
export default function CheckoutPage() {
  // State / Vəziyyət
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping info / Çatdırılma məlumatları
    shipping: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    // Billing info / Faktura məlumatları
    billing: {
      sameAsShipping: true,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    // Payment info / Ödəniş məlumatları
    payment: {
      method: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: '',
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Handle form input change / Form input dəyişikliyi
  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  // Handle same as shipping toggle / Eyni çatdırılma toggle
  const handleSameAsShipping = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      billing: {
        ...prev.billing,
        sameAsShipping: checked,
        ...(checked ? prev.shipping : {}),
      },
    }));
  };

  // Handle next step / Növbəti addım
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step / Əvvəlki addım
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission / Form göndərmə
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Process payment / Ödənişi emal et
      console.log('Processing payment:', formData);
      
      // Simulate API call / API çağırısını simulyasiya et
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page / Uğur səhifəsinə yönləndir
      window.location.href = '/checkout/success';
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Steps / Addımlar
  const steps = [
    { number: 1, title: 'Shipping Information', icon: <Truck size={20} /> },
    { number: 2, title: 'Payment Details', icon: <CreditCard size={20} /> },
    { number: 3, title: 'Review & Confirm', icon: <Check size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header / Başlıq */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <a
              href="/cart"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <ArrowLeft size={20} />
              <span>Back to cart</span>
            </a>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Checkout
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complete your order
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content / Əsas məzmun */}
          <div className="lg:col-span-2">
            {/* Progress steps / Tərəqqi addımları */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {currentStep > step.number ? (
                        <Check size={20} />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.number
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        currentStep > step.number
                          ? 'bg-blue-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form content / Form məzmunu */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {/* Step 1: Shipping Information / Addım 1: Çatdırılma məlumatları */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Shipping Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.shipping.firstName}
                        onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.shipping.lastName}
                        onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.shipping.email}
                      onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.shipping.phone}
                      onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shipping.address}
                      onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.shipping.city}
                        onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.shipping.state}
                        onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.shipping.zipCode}
                        onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country *
                    </label>
                    <select
                      required
                      value={formData.shipping.country}
                      onChange={(e) => handleInputChange('shipping', 'country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Details / Addım 2: Ödəniş detalları */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Payment Details
                  </h2>

                  {/* Payment method selection / Ödəniş üsulu seçimi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.payment.method === 'card'}
                          onChange={(e) => handleInputChange('payment', 'method', e.target.value)}
                          className="mr-3"
                        />
                        <CreditCard size={20} className="mr-3" />
                        <span>Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={formData.payment.method === 'paypal'}
                          onChange={(e) => handleInputChange('payment', 'method', e.target.value)}
                          className="mr-3"
                        />
                        <div className="mr-3 w-5 h-5 bg-blue-600 rounded"></div>
                        <span>PayPal</span>
                      </label>
                    </div>
                  </div>

                  {/* Card details / Kart detalları */}
                  {formData.payment.method === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="1234 5678 9012 3456"
                          value={formData.payment.cardNumber}
                          onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={formData.payment.expiryDate}
                            onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="123"
                            value={formData.payment.cvv}
                            onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.payment.cardName}
                          onChange={(e) => handleInputChange('payment', 'cardName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Billing address / Faktura ünvanı */}
                  <div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="sameAsShipping"
                        checked={formData.billing.sameAsShipping}
                        onChange={(e) => handleSameAsShipping(e.target.checked)}
                        className="mr-3"
                      />
                      <label htmlFor="sameAsShipping" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Billing address same as shipping
                      </label>
                    </div>

                    {!formData.billing.sameAsShipping && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Billing Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.billing.firstName}
                              onChange={(e) => handleInputChange('billing', 'firstName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.billing.lastName}
                              onChange={(e) => handleInputChange('billing', 'lastName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          </div>
                        </div>
                        {/* Add more billing fields as needed / Lazım olduqda daha çox faktura sahələri əlavə et */}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Review & Confirm / Addım 3: Nəzərdən keçir və təsdiq et */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Review & Confirm
                  </h2>

                  {/* Order summary / Sifariş xülasəsi */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Order Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="text-gray-900 dark:text-white">$1,399.97</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                        <span className="text-gray-900 dark:text-white">Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                        <span className="text-gray-900 dark:text-white">$112.00</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-600 pt-2">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-gray-900 dark:text-white">$1,511.97</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms and conditions / Şərtlər və qaydalar */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mr-3 mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation buttons / Naviqasiya düymələri */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Complete Order</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Order summary sidebar / Sifariş xülasəsi yan paneli */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              
              {/* Order items / Sifariş məhsulları */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <img
                    src="/placeholder-product.jpg"
                    alt="Product"
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Premium Wireless Headphones
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: 1</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    $199.99
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <img
                    src="/placeholder-product.jpg"
                    alt="Product"
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Smart Fitness Watch
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: 2</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    $599.98
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <img
                    src="/placeholder-product.jpg"
                    alt="Product"
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Professional Camera Lens
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: 1</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    $899.99
                  </span>
                </div>
              </div>

              {/* Order totals / Sifariş cəmləri */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">$1,399.97</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span className="text-gray-900 dark:text-white">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <span className="text-gray-900 dark:text-white">$112.00</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">$1,511.97</span>
                </div>
              </div>

              {/* Security features / Təhlükəsizlik xüsusiyyətləri */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Shield size={16} />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Truck size={16} />
                    <span>Free shipping on orders over $100</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <CreditCard size={16} />
                    <span>Multiple payment methods</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
