/**
 * Categories API Route / Kateqoriyalar API Route-u
 * Backward compatibility: Redirects/Proxies to v1 API
 * Geri uyğunluq: v1 API-yə yönləndirir/proxy edir
 */

import { NextRequest } from "next/server";
import { redirectToVersion, proxyToVersion } from "@/lib/api/version-middleware";

// GET /api/categories - Redirect to v1 / v1-ə yönləndir
export async function GET(request: NextRequest) {
  return redirectToVersion(request, 'v1');
}

// POST /api/categories - Proxy to v1 / v1-ə proxy et
export async function POST(request: NextRequest) {
  return proxyToVersion(request, 'v1');
}
