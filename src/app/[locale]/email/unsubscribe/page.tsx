/**
 * Email Unsubscribe Page / Email Abunəlikdən Çıxma Səhifəsi
 * Allows customers to unsubscribe from email campaigns
 * Müştərilərin email kampaniyalarından abunəlikdən çıxmasına imkan verir
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmailUnsubscribePage() {
  const searchParams = useSearchParams();
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    newsletter: true,
    promotions: true,
  });

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    if (emailParam && tokenParam) {
      setEmail(emailParam);
      setToken(tokenParam);
      loadPreferences(emailParam);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const loadPreferences = async (emailAddress: string) => {
    try {
      const res = await fetch(`/api/email/subscriptions?email=${encodeURIComponent(emailAddress)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.subscription) {
          setPreferences({
            newsletter: data.subscription.newsletter || false,
            promotions: data.subscription.promotions || false,
          });
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (unsubscribeAll: boolean = false) => {
    if (!email || !token) {
      toast.error("Email və ya token tapılmadı");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          unsubscribeAll,
          preferences: unsubscribeAll ? { newsletter: false, promotions: false } : preferences,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("Abunəlikdən uğurla çıxdınız");
      } else {
        const error = await res.json();
        toast.error(error.error || "Xəta baş verdi");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Xəta baş verdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!email || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Keçərsiz Link</h2>
            <p className="text-gray-600">
              Bu abunəlikdən çıxma linki keçərsizdir və ya istifadə olunub.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Abunəlikdən Çıxdınız</h2>
            <p className="text-gray-600 mb-4">
              Artıq bizdən email almayacaqsınız. Əgər fikrinizi dəyişsəniz, istənilən vaxt yenidən abunə ola bilərsiniz.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Ana Səhifəyə Qayıt
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-center">Email Abunəliyini İdarə Et</CardTitle>
          <CardDescription className="text-center">
            {email} üçün email abunəliyi parametrlərini dəyişdirin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={preferences.newsletter}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, newsletter: checked as boolean })
                }
              />
              <Label htmlFor="newsletter" className="cursor-pointer">
                Xəbər Bülleteni
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="promotions"
                checked={preferences.promotions}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, promotions: checked as boolean })
                }
              />
              <Label htmlFor="promotions" className="cursor-pointer">
                Promosiyalar və Təkliflər
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleUnsubscribe(false)}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yüklənir...
                </>
              ) : (
                "Dəyişiklikləri Saxla"
              )}
            </Button>

            <Button
              onClick={() => handleUnsubscribe(true)}
              disabled={submitting}
              variant="destructive"
              className="w-full"
            >
              Bütün Emaillərdən Abunəlikdən Çıx
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Dəyişiklikləri saxladıqdan sonra seçdiyiniz email növlərindən artıq məlumat almayacaqsınız.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

