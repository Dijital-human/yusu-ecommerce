/**
 * Offline Page / Offline Səhifəsi
 * Displayed when user is offline
 * İstifadəçi offline olduqda göstərilir
 */

"use client";

import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check online status / Onlayn statusu yoxla
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      router.refresh();
    } else {
      router.push("/");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-2xl">
              You're Offline / Siz Offline-siniz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              It looks like you're not connected to the internet. Please check your connection and try again.
              <br />
              <br />
              Görünür ki, internetə qoşulmamısınız. Zəhmət olmasa bağlantınızı yoxlayın və yenidən cəhd edin.
            </p>

            {isOnline && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Connection restored! / Bağlantı bərpa olundu!
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={handleRetry} variant="default" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                {isOnline ? "Retry / Yenidən Cəhd Et" : "Go to Homepage / Ana Səhifəyə Get"}
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home / Ana Səhifəyə Get
              </Button>
            </div>

            <div className="pt-4 text-sm text-gray-500">
              <p>
                Some features may be limited while offline / Offline olduqda bəzi xüsusiyyətlər məhdud ola bilər
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

