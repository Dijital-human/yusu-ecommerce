/**
 * Web Vitals API Route / Web Vitals API Route-u
 * Handles Core Web Vitals tracking from client
 * Client-dən Core Web Vitals izləməsini idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { trackCoreWebVitals, trackPageLoadTime } from "@/lib/monitoring/performance";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import type { CoreWebVitals } from "@/lib/monitoring/performance";

/**
 * POST /api/monitoring/web-vitals - Track Core Web Vitals / Core Web Vitals izlə
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, vitals, loadTime } = body;

    if (!page) {
      return badRequestResponse("Page path is required / Səhifə yolu tələb olunur");
    }

    // Track page load time if provided / Əgər təmin edilibsə səhifə yükləmə vaxtını izlə
    if (loadTime !== undefined) {
      trackPageLoadTime(page, loadTime, {
        url: body.url,
        userAgent: request.headers.get('user-agent') || undefined,
      });
    }

    // Track Core Web Vitals if provided / Əgər təmin edilibsə Core Web Vitals izlə
    if (vitals) {
      const coreWebVitals: CoreWebVitals = {
        lcp: vitals.lcp,
        fid: vitals.fid,
        cls: vitals.cls,
        fcp: vitals.fcp,
        ttfb: vitals.ttfb,
        inp: vitals.inp,
      };

      trackCoreWebVitals(page, coreWebVitals, {
        url: body.url,
        userAgent: request.headers.get('user-agent') || undefined,
      });
    }

    return successResponse({ success: true }, "Web vitals tracked successfully / Web vitals uğurla izləndi");
  } catch (error) {
    return handleApiError(error, "track web vitals");
  }
}

