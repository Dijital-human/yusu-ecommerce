/**
 * Checkout Page / Ödəniş Səhifəsi
 * This page handles the checkout process with payment integration
 * Bu səhifə ödəniş inteqrasiyası ilə checkout prosesini idarə edir
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { Layout } from "@/components/layout/Layout";
import { LocationPicker } from "@/components/location/LocationPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  CreditCard, 
  MapPin, 
  User, 
  Phone,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { state: cartState, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { getCurrentLocation, isWithinDeliveryArea } = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Form states / Form vəziyyətləri
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Azerbaijan',
  });

  // Redirect if not authenticated / Autentifikasiya olunmayıbsa yönləndir
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/checkout');
    }
  }, [isAuthenticated, router]);

  // Redirect if cart is empty / Səbət boşdursa yönləndir
  useEffect(() => {
    if (isAuthenticated && cartState.items.length === 0) {
      router.push('/products');
    }
  }, [isAuthenticated, cartState.items.length, router]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof ShippingAddress)[] = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode'
    ];

    for (const field of requiredFields) {
      if (!shippingAddress[field].trim()) {
        setError(`Please fill in ${field} / ${field} sahəsini doldurun`);
        return false;
      }
    }

    // Email validation / Email yoxlaması
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      setError('Please enter a valid email address / Etibarlı email ünvanı daxil edin');
      return false;
    }

    return true;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setStep(2);
      setError(null);
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      // Create order / Sifariş yarat
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartState.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress,
          paymentMethod: 'stripe',
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order / Sifariş yaratmaq uğursuz');
      }

      // Create payment intent / Ödəniş niyyəti yarat
      const paymentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.data[0].id,
          amount: cartState.totalPrice,
          currency: 'usd',
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success) {
        throw new Error(paymentData.error || 'Failed to create payment / Ödəniş yaratmaq uğursuz');
      }

      // Redirect to payment success / Ödəniş uğuruna yönləndir
      router.push(`/payment/success?orderId=${orderData.data[0].id}`);
      
      // Clear cart / Səbəti təmizlə
      await clearCart();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred / Xəta baş verdi');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || cartState.items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading... / Yüklənir...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header / Başlıq */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Checkout / Ödəniş
            </h1>
            <p className="text-gray-600">
              Complete your order / Sifarişinizi tamamlayın
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content / Əsas Məzmun */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Shipping Information / Addım 1: Çatdırılma Məlumatı */}
              {step === 1 && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <span>Shipping Information / Çatdırılma Məlumatı</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name / Ad</Label>
                        <Input
                          id="firstName"
                          value={shippingAddress.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Enter your first name / Adınızı daxil edin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name / Soyad</Label>
                        <Input
                          id="lastName"
                          value={shippingAddress.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Enter your last name / Soyadınızı daxil edin"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email / Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingAddress.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email / Emailinizi daxil edin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone / Telefon</Label>
                        <Input
                          id="phone"
                          value={shippingAddress.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter your phone / Telefonunuzu daxil edin"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Address / Ünvan</Label>
                      <LocationPicker
                        onLocationSelect={(location) => {
                          setSelectedLocation(location);
                          setShippingAddress(prev => ({
                            ...prev,
                            address: location.address,
                            city: location.city,
                            country: location.country,
                          }));
                        }}
                        initialLocation={selectedLocation}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City / Şəhər</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Enter city / Şəhəri daxil edin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State / Rayon</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="Enter state / Rayonu daxil edin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code / Poçt Kodu</Label>
                        <Input
                          id="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          placeholder="Enter ZIP / Poçt kodunu daxil edin"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="country">Country / Ölkə</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Enter country / Ölkəni daxil edin"
                      />
                    </div>

                    <Button
                      onClick={handleProceedToPayment}
                      className="w-full"
                      size="lg"
                    >
                      Proceed to Payment / Ödənişə Keç
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment / Addım 2: Ödəniş */}
              {step === 2 && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span>Payment / Ödəniş</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <Lock className="h-4 w-4" />
                        <span className="font-medium">Secure Payment / Təhlükəsiz Ödəniş</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        Your payment information is encrypted and secure / Ödəniş məlumatlarınız şifrələnir və təhlükəsizdir
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium">Credit/Debit Card / Kredit/Debet Kart</p>
                            <p className="text-sm text-gray-500">Visa, Mastercard, American Express</p>
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Back / Geri
                      </Button>
                      <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="flex-1"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing... / Emal edilir...
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Pay {formatCurrency(cartState.totalPrice)} / {formatCurrency(cartState.totalPrice)} Ödə
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary / Sifariş Xülasəsi */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary / Sifariş Xülasəsi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items / Elementlər */}
                  <div className="space-y-3">
                    {cartState.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.product.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals / Cəmlər */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal / Alt Cəm</span>
                      <span className="font-medium">{formatCurrency(cartState.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping / Çatdırılma</span>
                      <span className="font-medium text-green-600">Free / Pulsuz</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax / Vergi</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total / Cəmi</span>
                        <span className="text-blue-600">{formatCurrency(cartState.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info / Təhlükəsizlik Məlumatı */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-medium">Secure Checkout / Təhlükəsiz Ödəniş</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your payment information is protected by 256-bit SSL encryption / 
                    Ödəniş məlumatlarınız 256-bit SSL şifrələmə ilə qorunur
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Display / Xəta Göstəricisi */}
          {error && (
            <div className="mt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
