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
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { splitCartBySeller, calculateShipping, validateShippingAddress, validatePaymentMethod, formatOrderSummary, type OrderSplit } from "@/lib/checkout/checkout-utils";

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
  const t = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const tAddresses = useTranslations("addresses");
  
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
  
  // Guest checkout / Qonaq ödənişi
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [orderSplits, setOrderSplits] = useState<OrderSplit[]>([]);

  // Promotion states / Promosiya vəziyyətləri
  const [couponCode, setCouponCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState<any>(null);
  const [promotionError, setPromotionError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Calculate subtotal for promotions / Promosiyalar üçün ümumi məbləği hesabla
  const subtotal = cartState.items.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + (price * item.quantity);
  }, 0);

  // Calculate total shipping / Ümumi çatdırılma məbləğini hesabla
  const totalShipping = orderSplits.reduce((sum, split) => sum + (split.shipping || 0), 0);

  // Calculate final total with discount / Endirim ilə ümumi məbləği hesabla
  const totalAmountAfterDiscount = Math.max(0, subtotal - discountAmount);
  const finalTotal = totalAmountAfterDiscount + totalShipping;

  // Cart items for promotion engine / Promosiya mühərriki üçün səbət elementləri
  const promotionItems = cartState.items.map(item => ({
    productId: item.productId,
    categoryId: item.product?.categoryId || null,
    sellerId: item.product?.sellerId || "",
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    quantity: item.quantity,
  }));

  // Handle coupon validation / Kupon yoxlamasını idarə et
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setPromotionError(t("promotions.enterCouponCode") || "Enter coupon code / Kupon kodu daxil edin");
      return;
    }

    setIsValidatingCoupon(true);
    setPromotionError("");

    try {
      const response = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          subtotal,
          items: promotionItems,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedPromotion(data.promotion);
        setDiscountAmount(data.discount || 0);
        toast.success(t("promotions.couponApplied") || "Coupon applied successfully / Kupon uğurla tətbiq edildi");
      } else {
        setPromotionError(data.reason || t("promotions.invalidCoupon") || "Invalid coupon / Yanlış kupon");
        setAppliedPromotion(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error("Error validating coupon / Kupon yoxlamaqda xəta:", error);
      setPromotionError(t("promotions.validationError") || "Failed to validate coupon / Kuponu yoxlamaq uğursuz oldu");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Handle remove coupon / Kuponu silməni idarə et
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedPromotion(null);
    setDiscountAmount(0);
    setPromotionError("");
    toast.success(t("promotions.couponRemoved") || "Coupon removed / Kupon silindi");
  };
  
  // Addresses and payment methods
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return;
    
    if (cartState.items.length === 0) {
      router.push("/cart");
      return;
    }

    // Calculate order splits by seller / Satıcıya görə sifariş bölgülərini hesabla
    const splits = splitCartBySeller(cartState.items);
    setOrderSplits(splits);
    
    // Calculate shipping for each split / Hər bölgü üçün çatdırılma hesabla
    splits.forEach(split => {
      split.shipping = calculateShipping(split.items, shippingAddress);
      split.total = split.subtotal + (split.shipping || 0);
    });
    setOrderSplits([...splits]);
    
    if (!session) {
      // Allow guest checkout / Qonaq ödənişinə icazə ver
      setIsGuest(true);
      return;
    }
    
    fetchAddresses();
    fetchPaymentMethods();
  }, [session, status, cartState.items.length, router, shippingAddress]);

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
    if (step === "shipping") {
      // Validate shipping address / Çatdırılma ünvanını yoxla
      const addressValidation = validateShippingAddress(shippingAddress);
      if (!addressValidation.valid) {
        setError(addressValidation.errors.join(', '));
        return;
      }

      // For guest checkout, validate email / Qonaq ödənişi üçün email-i yoxla
      if (isGuest && !guestEmail) {
        setError(t("emailRequiredForGuest") || "Email is required for guest checkout / Qonaq ödənişi üçün email tələb olunur");
        return;
      }

      if (isGuest && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        setError(t("invalidEmail") || "Invalid email address / Yanlış email ünvanı");
        return;
      }

      setError(null);
      setStep("payment");
    } else if (step === "payment") {
      // Validate payment method / Ödəniş metodunu yoxla
      const paymentValidation = validatePaymentMethod(paymentMethod);
      if (!paymentValidation.valid) {
        setError(paymentValidation.errors.join(', '));
        return;
      }

      setError(null);
      setStep("review");
    }
  };

  const handlePlaceOrder = async () => {
    if (!agreedToTerms) {
      setError(t("agreeToTerms"));
      return;
    }

    // Final validations / Son yoxlamalar
    const addressValidation = validateShippingAddress(shippingAddress);
    if (!addressValidation.valid) {
      setError(addressValidation.errors.join(', '));
      return;
    }

    const paymentValidation = validatePaymentMethod(paymentMethod);
    if (!paymentValidation.valid) {
      setError(paymentValidation.errors.join(', '));
      return;
    }

    if (isGuest && !guestEmail) {
      setError(t("emailRequiredForGuest") || "Email is required for guest checkout / Qonaq ödənişi üçün email tələb olunur");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: cartState.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod.type,
        notes: orderNotes,
        guestEmail: isGuest ? guestEmail : undefined,
        couponCode: appliedPromotion ? couponCode : undefined,
        promotionId: appliedPromotion?.id,
        discountAmount: discountAmount,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        // Fix: data array-dir, ilk sifarişin ID-sini istifadə et
        const firstOrderId = result.data?.[0]?.id;
        if (firstOrderId) {
          clearCart();
          setStep("success");
          // Redirect to order confirmation page
          setTimeout(() => {
            router.push(`/orders/${firstOrderId}`);
          }, 3000);
        } else {
          setError(t("orderCreatedButRedirectFailed"));
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || t("failedToPlaceOrder"));
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError(t("failedToPlaceOrder"));
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

  // Guest checkout is allowed / Qonaq ödənişinə icazə verilir
  // if (!session) {
  //   return null; // Will redirect
  // }

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
              {t("orderPlacedSuccess")}
            </h1>
            <p className="text-gray-600 mb-8">
              {t("orderPlacedDescFull")}
            </p>
            <Button onClick={() => router.push("/orders")}>
              {t("viewOrders")}
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
            {t("back")}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        </div>

        {/* Progress Steps / Tərəqqi Addımları */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { key: "shipping", label: t("shippingStep"), icon: Truck },
              { key: "payment", label: t("paymentStep"), icon: CreditCard },
              { key: "review", label: t("reviewStep"), icon: CheckCircle },
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
                    <span>{t("shippingAddress")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Guest Checkout Email / Qonaq Ödənişi Email */}
                  {isGuest && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("email") || "Email"} *
                      </label>
                      <Input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder={t("emailPlaceholder") || "your@email.com"}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t("guestCheckoutNote") || "We'll send order updates to this email / Sifariş yeniləmələrini bu email-ə göndərəcəyik"}
                      </p>
                    </div>
                  )}
                  
                  {/* Saved Addresses / Saxlanılmış Ünvanlar */}
                  {addresses.length > 0 && !isGuest && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{tAddresses("selectSaved")}</label>
                      <select
                        value={selectedAddress}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">{tAddresses("useNew")}</option>
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
                        {tAddresses("street")} *
                      </label>
                      <Input
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                        placeholder={tAddresses("street")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {tAddresses("city")} *
                      </label>
                      <Input
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder={tAddresses("city")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {tAddresses("state")} *
                      </label>
                      <Input
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder={tAddresses("state")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {tAddresses("zipCode")} *
                      </label>
                      <Input
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder={tAddresses("zipCode")}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {tAddresses("country")} *
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
                    {t("continueToPayment")}
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
                    <span>{t("paymentMethod")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Type Selection / Ödəniş Növü Seçimi */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("paymentType")}</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: "card", label: t("creditCard"), icon: CreditCard },
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
                          {t("nameOnCard")} *
                        </label>
                        <Input
                          value={paymentMethod.nameOnCard}
                          onChange={(e) => handlePaymentMethodChange("nameOnCard", e.target.value)}
                          placeholder={t("nameOnCard")}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("cardNumber")} *
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
                            {t("expiryDate")} *
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
                    {t("reviewOrder")}
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
                    <span>{t("reviewYourOrder")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Shipping Address Review / Çatdırılma Ünvanı Nəzərdən Keçirməsi */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t("shippingAddress")}</h4>
                    <div className="text-sm text-gray-600">
                      <p>{shippingAddress.street}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Payment Method Review / Ödəniş Metodu Nəzərdən Keçirməsi */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{t("paymentMethod")}</h4>
                    <div className="text-sm text-gray-600">
                      <p className="capitalize">{paymentMethod.type.replace("_", " ")}</p>
                      {paymentMethod.type === "card" && (
                        <p>**** **** **** {paymentMethod.cardNumber.slice(-4)}</p>
                      )}
                    </div>
                  </div>

                  {/* Coupon Code / Kupon Kodu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("promotions.couponCode") || "Coupon Code / Kupon Kodu"}
                    </label>
                    {!appliedPromotion ? (
                      <div className="flex gap-2">
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder={t("promotions.enterCouponCode") || "Enter coupon code / Kupon kodu daxil edin"}
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleValidateCoupon();
                            }
                          }}
                        />
                        <Button
                          onClick={handleValidateCoupon}
                          disabled={!couponCode.trim() || isValidatingCoupon}
                          variant="outline"
                        >
                          {isValidatingCoupon ? t("validating") || "Validating..." : t("apply") || "Apply / Tətbiq et"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              {appliedPromotion.name} - {formatCurrency(discountAmount)} {t("promotions.discount") || "discount"}
                            </p>
                            <p className="text-xs text-green-700">{couponCode}</p>
                          </div>
                        </div>
                        <Button
                          onClick={handleRemoveCoupon}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          {t("remove") || "Remove / Sil"}
                        </Button>
                      </div>
                    )}
                    {promotionError && (
                      <p className="mt-1 text-sm text-red-600">{promotionError}</p>
                    )}
                  </div>

                  {/* Order Notes / Sifariş Qeydləri */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("orderNotes")}
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder={t("orderNotesPlaceholder")}
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
                      {t("agreeToTermsLabel")}
                    </label>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={!agreedToTerms || loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? t("processing") : t("placeOrder")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary / Sifariş Xülasəsi */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("orderSummary")}</CardTitle>
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
                          {tCommon("quantity")}: {item.quantity} × {formatCurrency(item.product.price)}
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
                    <span className="text-gray-600">{t("subtotal")}</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t("promotions.discount") || "Discount / Endirim"}</span>
                      <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("shipping")}</span>
                    <span className="font-medium">
                      {totalShipping > 0 ? formatCurrency(totalShipping) : <span className="text-green-600">{t("free") || "Free"}</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t("tax")}</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t("total")}</span>
                      <span>{formatCurrency(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Badge / Təhlükəsizlik Nişanı */}
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("secureCheckout")}</span>
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