"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  Package,
  Truck,
  User,
  ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Redirect based on user role
    switch (session.user?.role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "SELLER":
        router.push("/seller");
        break;
      case "COURIER":
        router.push("/courier");
        break;
      default:
        router.push("/");
        break;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Redirecting to your dashboard... / Dashboard-ınıza yönləndirilirsiniz...
          </h1>
          <p className="text-gray-600 mb-8">
            Please wait while we redirect you to the appropriate dashboard based on your role.
            Lütfən rolunuz əsasında uyğun dashboard-a yönləndirilənə qədər gözləyin.
          </p>
          
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
