/**
 * Checkout Page / Ödəniş Səhifəsi
 * This component handles the checkout process
 * Bu komponent ödəniş prosesini idarə edir
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/store/CartContext";
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "apple_pay" | "google_pay";
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { state: cartState, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"shipping" | "payment" | "review" | "success">("shipping");
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Azerbaijan",
  });
  
  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Azerbaijan",
  });
  
  const [paymentMethod, setPaymentMethod] = useState({
    type: "card" as "card" | "paypal" | "apple_pay" | "google_pay",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
  });
  
  const [orderNotes, setOrderNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Addresses and payment methods
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin?callbackUrl=/checkout");
      return;
    }
    
    if (cartState.items.length === 0) {
      router.push("/cart");
      return;
    }
    
    fetchAddresses();
    fetchPaymentMethods();
  }, [session, status, cartState.items.length, router]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        const defaultAddress = data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
          setShippingAddress({
            street: defaultAddress.street,
            city: defaultAddress.city,
            state: defaultAddress.state,
            zipCode: defaultAddress.zipCode,
            country: defaultAddress.country,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment-methods");
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
        const defaultMethod = data.find((method: PaymentMethod) => method.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
        }
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const handleAddressChange = (addressId: string) => {
    setSelectedAddress(addressId);
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setShippingAddress({
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      });
    }
  };

  const handleBillingAddressChange = (field: string, value: any) => {
    setBillingAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentMethodChange = (field: string, value: any) => {
    setPaymentMethod(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateShipping = () => {
    const required = ["street", "city", "state", "zipCode"];
    return required.every(field => shippingAddress[field as keyof typeof shippingAddress].trim() !== "");
  };

  const validatePayment = () => {
    if (paymentMethod.type === "card") {
      return paymentMethod.cardNumber.trim() !== "" && 
             paymentMethod.expiryDate.trim() !== "" && 
             paymentMethod.cvv.trim() !== "" && 
             paymentMethod.nameOnCard.trim() !== "";
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === "shipping" && validateShipping()) {
      setStep("payment");
    } else if (step === "payment" && validatePayment()) {
      setStep("review");
    }
  };

  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions / Zəhmət olmasa şərtlər və qaydalarla razılaşın");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: cartState.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: shippingAddress,
        billingAddress: billingAddress.sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod: paymentMethod,
        notes: orderNotes,
        totalAmount: cartState.totalPrice,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        setStep("success");
        // Redirect to order confirmation page
        setTimeout(() => {
          router.push(`/orders/${order.id}`);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to place order / Sifariş verilə bilmədi");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order / Sifariş verilə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  if (cartState.items.length === 0) {
    return null; // Will redirect
  }

  if (step === "success") {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <div className="max-w-md mx-auto">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Order Placed Successfully! / Sifariş Uğurla Verildi!
            </h1>
            <p className="text-gray-600 mb-8">
              Thank you for your order. You will receive a confirmation email shortly.
              / Sifarişiniz üçün təşəkkür edirik. Tezliklə təsdiq e-poçtu alacaqsınız.
            </p>
            <Button onClick={() => router.push("/orders")}>
              View Orders / Sifarişləri Gör
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Header / Başlıq */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back / Geri
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout / Ödəniş</h1>
        </div>

        {/* Progress Steps / Tərəqqi Addımları */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { key: "shipping", label: "Shipping / Çatdırılma", icon: Truck },
              { key: "payment", label: "Payment / Ödəniş", icon: CreditCard },
              { key: "review", label: "Review / Nəzərdən Keçir", icon: CheckCircle },
            ].map((stepItem, index) => {
              const isActive = step === stepItem.key;
              const isCompleted = ["shipping", "payment", "review"].indexOf(step) > index;
              const Icon = stepItem.icon;
              
              return (
                <div key={stepItem.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isActive ? "bg-blue-600 text-white" : 
                    isCompleted ? "bg-green-600 text-white" : 
                    "bg-gray-200 text-gray-600"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? "text-blue-600" : 
                    isCompleted ? "text-green-600" : 
                    "text-gray-500"
                  }`}>
                    {stepItem.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Form / Əsas Form */}
          <div className="space-y-6">
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address / Çatdırılma Ünvanı */}
            {step === "shipping" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Shipping Address / Çatdırılma Ünvanı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Saved Addresses / Saxlanılmış Ünvanlar */}
                  {addresses.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select saved address / Saxlanılmış ünvanı seçin</label>
                      <select
                        value={selectedAddress}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Use new address / Yeni ünvan istifadə et</option>
                        {addresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.street}, {address.city}, {address.state} {address.zipCode}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Address Form / Ünvan Formu */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address / Küçə Ünvanı *
                      </label>
                      <Input
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="Enter street address / Küçə ünvanını daxil edin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City / Şəhər *
                      </label>
                      <Input
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter city / Şəhəri daxil edin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State / Rayon *
                      </label>
                      <Input
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Enter state / Rayonu daxil edin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code / Poçt Kodu *
                      </label>
                      <Input
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="Enter ZIP code / Poçt kodunu daxil edin"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country / Ölkə *
                      </label>
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="Azerbaijan">Azerbaijan / Azərbaycan</option>
                        <option value="Turkey">Turkey / Türkiyə</option>
                        <option value="USA">United States / Amerika Birləşmiş Ştatları</option>
                        <option value="UK">United Kingdom / Böyük Britaniya</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={handleNextStep}
                    disabled={!validateShipping()}
                    className="w-full"
                  >
                    Continue to Payment / Ödənişə Davam Et
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment Method / Ödəniş Metodu */}
            {step === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Method / Ödəniş Metodu</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Type Selection / Ödəniş Növü Seçimi */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Type / Ödəniş Növü</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: "card", label: "Credit Card / Kredit Kartı", icon: CreditCard },
                        { value: "paypal", label: "PayPal", icon: CreditCard },
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handlePaymentMethodChange("type", option.value)}
                            className={`p-4 border rounded-lg text-left ${
                              paymentMethod.type === option.value
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <Icon className="h-6 w-6 mb-2" />
                            <div className="text-sm font-medium">{option.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Details / Kart Təfərrüatları */}
                  {paymentMethod.type === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name on Card / Kartdakı Ad *
                        </label>
                        <Input
                          value={paymentMethod.nameOnCard}
                          onChange={(e) => handlePaymentMethodChange("nameOnCard", e.target.value)}
                          placeholder="Enter name on card / Kartdakı adı daxil edin"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number / Kart Nömrəsi *
                        </label>
                        <Input
                          value={paymentMethod.cardNumber}
                          onChange={(e) => handlePaymentMethodChange("cardNumber", e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date / Bitmə Tarixi *
                          </label>
                          <Input
                            value={paymentMethod.expiryDate}
                            onChange={(e) => handlePaymentMethodChange("expiryDate", e.target.value)}
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV *
                          </label>
                          <Input
                            value={paymentMethod.cvv}
                            onChange={(e) => handlePaymentMethodChange("cvv", e.target.value)}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleNextStep}
                    disabled={!validatePayment()}
                    className="w-full"
                  >
                    Review Order / Sifarişi Nəzərdən Keçir
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Order Review / Sifariş Nəzərdən Keçirməsi */}
            {step === "review" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Review Your Order / Sifarişinizi Nəzərdən Keçirin</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Shipping Address Review / Çatdırılma Ünvanı Nəzərdən Keçirməsi */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address / Çatdırılma Ünvanı</h4>
                    <div className="text-sm text-gray-600">
                      <p>{shippingAddress.street}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Payment Method Review / Ödəniş Metodu Nəzərdən Keçirməsi */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Payment Method / Ödəniş Metodu</h4>
                    <div className="text-sm text-gray-600">
                      <p className="capitalize">{paymentMethod.type.replace("_", " ")}</p>
                      {paymentMethod.type === "card" && (
                        <p>**** **** **** {paymentMethod.cardNumber.slice(-4)}</p>
                      )}
                    </div>
                  </div>

                  {/* Order Notes / Sifariş Qeydləri */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes / Sifariş Qeydləri
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any special instructions? / Xüsusi təlimatlarınız varmı?"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      rows={3}
                    />
                  </div>

                  {/* Terms and Conditions / Şərtlər və Qaydalar */}
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the terms and conditions and privacy policy / 
                      Şərtlər və qaydalar və məxfilik siyasəti ilə razıyam
                    </label>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={!agreedToTerms || loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Placing Order..." : "Place Order / Sifariş Ver"}
                  </Button>
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
                {/* Cart Items / Səbət Elementləri */}
                <div className="space-y-3">
                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                        <img
                          src={item.product.images?.[0] || "/placeholder-product.jpg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × {formatCurrency(item.product.price)}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals / Sifariş Cəmləri */}
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
                      <span>{formatCurrency(cartState.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge / Təhlükəsizlik Nişanı */}
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-medium">Secure checkout / Təhlükəsiz ödəniş</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}