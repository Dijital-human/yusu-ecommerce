/**
 * One-Click Checkout Button Component / Bir Klik Ödəniş Düyməsi Komponenti
 * Button for one-click checkout functionality
 * Bir klik ödəniş funksionallığı üçün düymə
 */

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OneClickCheckoutButtonProps {
  productId: string;
  quantity?: number;
  disabled?: boolean;
}

export function OneClickCheckoutButton({
  productId,
  quantity = 1,
  disabled = false,
}: OneClickCheckoutButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("checkout");
  const [loading, setLoading] = useState(false);

  const handleOneClickCheckout = async () => {
    if (!session?.user) {
      toast.error(t("loginRequired") || "Please login to use one-click checkout / Bir klik ödəniş üçün daxil olun");
      router.push("/auth/signin");
      return;
    }

    setLoading(true);

    try {
      // Check eligibility first / Əvvəlcə uyğunluğu yoxla
      const eligibilityResponse = await fetch("/api/checkout/one-click/eligibility");
      const eligibilityData = await eligibilityResponse.json();

      if (!eligibilityData.success || !eligibilityData.data.eligible) {
        toast.error(
          eligibilityData.data.reasons?.join(", ") ||
            "Not eligible for one-click checkout / Bir klik ödəniş üçün uyğun deyil"
        );
        // Redirect to regular checkout / Adi ödənişə yönləndir
        router.push(`/checkout`);
        return;
      }

      // Create one-click checkout order / Bir klik ödəniş sifarişi yarat
      const response = await fetch("/api/checkout/one-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t("orderPlacedSuccess") || "Order placed successfully / Sifariş uğurla verildi");
        router.push(`/orders/${data.data.id}`);
      } else {
        toast.error(data.error || "Failed to place order / Sifariş vermək uğursuz oldu");
      }
    } catch (error) {
      console.error("One-click checkout error:", error);
      toast.error("An error occurred / Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null; // Don't show button if not logged in / Daxil olunmayıbsa düyməni göstərmə
  }

  return (
    <Button
      onClick={handleOneClickCheckout}
      disabled={disabled || loading}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {t("processing") || "Processing... / İşlənir..."}
        </>
      ) : (
        <>
          <Zap className="h-4 w-4 mr-2" />
          {t("oneClickCheckout") || "Buy Now / İndi Al"}
        </>
      )}
    </Button>
  );
}

