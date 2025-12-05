/**
 * Shipping Provider Abstraction / Çatdırılma Provayder Abstraksiyası
 * Provides abstraction for multiple shipping carriers
 * Çoxlu çatdırılma daşıyıcıları üçün abstraksiya təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Shipping method types / Çatdırılma metodu tipləri
 */
export type ShippingMethod = "standard" | "express" | "overnight" | "same_day" | "pickup";

/**
 * Shipping carrier types / Çatdırılma daşıyıcı tipləri
 */
export type ShippingCarrier = "dhl" | "fedex" | "ups" | "usps" | "local" | "custom";

/**
 * Shipping address interface / Çatdırılma ünvanı interfeysi
 */
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Shipping rate interface / Çatdırılma tarifi interfeysi
 */
export interface ShippingRate {
  carrier: ShippingCarrier;
  method: ShippingMethod;
  rate: number;
  currency: string;
  estimatedDays: number;
  estimatedDeliveryDate?: Date;
  trackingAvailable: boolean;
}

/**
 * Shipping quote request / Çatdırılma təklifi sorğusu
 */
export interface ShippingQuoteRequest {
  from: ShippingAddress;
  to: ShippingAddress;
  weight: number; // in kg / kq ilə
  dimensions?: {
    length: number; // in cm / sm ilə
    width: number;
    height: number;
  };
  value: number; // order value / sifariş dəyəri
  items: Array<{
    quantity: number;
    weight?: number;
  }>;
}

/**
 * Shipping tracking info / Çatdırılma izləmə məlumatı
 */
export interface ShippingTrackingInfo {
  trackingNumber: string;
  carrier: ShippingCarrier;
  status: string;
  currentLocation?: string;
  estimatedDeliveryDate?: Date;
  events: Array<{
    timestamp: Date;
    location?: string;
    description: string;
  }>;
}

/**
 * Shipping provider interface / Çatdırılma provayder interfeysi
 */
export interface ShippingProvider {
  name: ShippingCarrier;
  isConfigured(): boolean;
  getRates(request: ShippingQuoteRequest): Promise<ShippingRate[]>;
  createShipment(request: ShippingQuoteRequest, rate: ShippingRate): Promise<{ trackingNumber: string; label?: string }>;
  trackShipment(trackingNumber: string): Promise<ShippingTrackingInfo>;
  cancelShipment(trackingNumber: string): Promise<boolean>;
}

/**
 * Local Shipping Provider / Lokal Çatdırılma Provayderi
 * Simple provider for local deliveries / Lokal çatdırılmalar üçün sadə provayder
 */
class LocalShippingProvider implements ShippingProvider {
  name: ShippingCarrier = "local";

  isConfigured(): boolean {
    return true; // Always available / Həmişə mövcuddur
  }

  async getRates(request: ShippingQuoteRequest): Promise<ShippingRate[]> {
    const { weight, value, to } = request;

    // Simple rate calculation based on weight and distance / Çəki və məsafəyə əsasən sadə tarif hesablaması
    const baseRate = 5; // Base shipping cost / Əsas çatdırılma xərci
    const weightRate = weight * 0.5; // 0.5 per kg / kq başına 0.5
    const distanceMultiplier = this.getDistanceMultiplier(to);
    
    const standardRate = (baseRate + weightRate) * distanceMultiplier;
    const expressRate = standardRate * 1.5;
    const overnightRate = standardRate * 2;

    // Free shipping for orders over 50 / 50-dən yuxarı sifarişlər üçün pulsuz çatdırılma
    const freeShippingThreshold = 50;
    const isFreeShipping = value >= freeShippingThreshold;

    return [
      {
        carrier: "local",
        method: "standard",
        rate: isFreeShipping ? 0 : standardRate,
        currency: "USD",
        estimatedDays: 3,
        trackingAvailable: true,
      },
      {
        carrier: "local",
        method: "express",
        rate: expressRate,
        currency: "USD",
        estimatedDays: 1,
        trackingAvailable: true,
      },
      {
        carrier: "local",
        method: "overnight",
        rate: overnightRate,
        currency: "USD",
        estimatedDays: 1,
        trackingAvailable: true,
      },
    ];
  }

  async createShipment(request: ShippingQuoteRequest, rate: ShippingRate): Promise<{ trackingNumber: string; label?: string }> {
    // Generate tracking number / İzləmə nömrəsi yarat
    const trackingNumber = `LOCAL${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    logger.info('Local shipment created / Lokal göndərmə yaradıldı', { trackingNumber, rate });

    return {
      trackingNumber,
      label: undefined, // Local provider doesn't generate labels / Lokal provayder etiket yaratmır
    };
  }

  async trackShipment(trackingNumber: string): Promise<ShippingTrackingInfo> {
    // Mock tracking info / Mock izləmə məlumatı
    return {
      trackingNumber,
      carrier: "local",
      status: "in_transit",
      estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow / Sabah
      events: [
        {
          timestamp: new Date(),
          location: "Warehouse",
          description: "Package picked up / Paket götürüldü",
        },
      ],
    };
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    logger.info('Local shipment cancellation requested / Lokal göndərmə ləğv sorğusu', { trackingNumber });
    // In a real implementation, update database / Real tətbiqdə veritabanını yenilə
    return true;
  }

  private getDistanceMultiplier(address: ShippingAddress): number {
    // Simple distance multiplier based on country / Ölkəyə əsasən sadə məsafə multiplikatoru
    const multipliers: Record<string, number> = {
      "Azerbaijan": 1.0,
      "Turkey": 1.2,
      "USA": 1.5,
      "UK": 1.3,
    };

    return multipliers[address.country] || 1.0;
  }
}

/**
 * DHL Shipping Provider (Placeholder) / DHL Çatdırılma Provayderi (Placeholder)
 */
class DHLShippingProvider implements ShippingProvider {
  name: ShippingCarrier = "dhl";
  private apiKey?: string;
  private apiSecret?: string;

  constructor() {
    // TODO: Load from environment variables / Environment dəyişənlərindən yüklə
    this.apiKey = process.env.DHL_API_KEY;
    this.apiSecret = process.env.DHL_API_SECRET;
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  /**
   * Get DHL access token / DHL access token al
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.apiKey || !this.apiSecret) {
      return null;
    }

    const isSandbox = process.env.DHL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api-sandbox.dhl.com'
      : 'https://api.dhl.com';

    try {
      const response = await fetch(`${baseUrl}/v1/auth/accesstoken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.apiKey,
          clientSecret: this.apiSecret,
        }),
      });

      if (!response.ok) {
        logger.error('Failed to get DHL access token / DHL access token almaq uğursuz oldu', new Error(`HTTP ${response.status}`));
        return null;
      }

      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      logger.error('Failed to get DHL access token / DHL access token almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  async getRates(request: ShippingQuoteRequest): Promise<ShippingRate[]> {
    if (!this.isConfigured()) {
      logger.warn('DHL provider not configured / DHL provayderi konfiqurasiya edilməyib');
      return [];
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      logger.warn('DHL authentication failed. Returning empty rates / DHL autentifikasiya uğursuz oldu. Boş tariflər qaytarılır');
      return [];
    }

    const isSandbox = process.env.DHL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api-sandbox.dhl.com'
      : 'https://api.dhl.com';

    try {
      // DHL Rate Request / DHL Tarif Sorğusu
      const rateRequest = {
        shipperDetails: {
          postalCode: request.from.zipCode,
          countryCode: request.from.country,
        },
        receiverDetails: {
          postalCode: request.to.zipCode,
          countryCode: request.to.country,
        },
        accounts: [
          {
            typeCode: 'shipper',
            number: this.apiKey,
          },
        ],
        plannedShippingDateAndTime: new Date().toISOString(),
        unitOfMeasurement: 'metric',
        isCustomsDeclarable: false,
        packages: request.items.map(item => ({
          weight: item.weight || 1,
          dimensions: {
            length: item.length || 10,
            width: item.width || 10,
            height: item.height || 10,
          },
        })),
      };

      const response = await fetch(`${baseUrl}/v1/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(rateRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('DHL rate request failed / DHL tarif sorğusu uğursuz oldu', new Error(JSON.stringify(errorData)), { request });
        return [];
      }

      const rateData = await response.json();
      const rates: ShippingRate[] = [];

      // Parse DHL response / DHL cavabını parse et
      if (rateData.products && Array.isArray(rateData.products)) {
        for (const product of rateData.products) {
          rates.push({
            carrier: 'dhl',
            method: 'express' as ShippingMethod,
            rate: parseFloat(product.totalPrice?.[0]?.price || '0'),
            currency: product.totalPrice?.[0]?.currencyCode || 'USD',
            estimatedDays: product.deliveryCapabilities?.estimatedDeliveryDate
              ? Math.ceil((new Date(product.deliveryCapabilities.estimatedDeliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : 3,
            estimatedDeliveryDate: product.deliveryCapabilities?.estimatedDeliveryDate
              ? new Date(product.deliveryCapabilities.estimatedDeliveryDate)
              : undefined,
            trackingAvailable: true,
          });
        }
      }

      return rates;
    } catch (error) {
      logger.error('DHL rate request failed / DHL tarif sorğusu uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { request });
      return [];
    }
  }

  async createShipment(request: ShippingQuoteRequest, rate: ShippingRate): Promise<{ trackingNumber: string; label?: string }> {
    if (!this.isConfigured()) {
      throw new Error('DHL provider not configured / DHL provayderi konfiqurasiya edilməyib');
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('DHL authentication failed / DHL autentifikasiya uğursuz oldu');
    }

    const isSandbox = process.env.DHL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api-sandbox.dhl.com'
      : 'https://api.dhl.com';

    try {
      // DHL Shipment Request / DHL Göndərmə Sorğusu
      const shipmentRequest = {
        shipperDetails: {
          postalCode: request.from.zipCode,
          countryCode: request.from.country,
          addressLine1: request.from.street,
          cityName: request.from.city,
        },
        receiverDetails: {
          postalCode: request.to.zipCode,
          countryCode: request.to.country,
          addressLine1: request.to.street,
          cityName: request.to.city,
        },
        accounts: [
          {
            typeCode: 'shipper',
            number: this.apiKey,
          },
        ],
        plannedShippingDateAndTime: new Date().toISOString(),
        unitOfMeasurement: 'metric',
        packages: request.items.map(item => ({
          weight: item.weight || 1,
          dimensions: {
            length: item.length || 10,
            width: item.width || 10,
            height: item.height || 10,
          },
        })),
      };

      const response = await fetch(`${baseUrl}/v1/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(shipmentRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('DHL shipment creation failed / DHL göndərmə yaratma uğursuz oldu', new Error(JSON.stringify(errorData)));
        throw new Error(`DHL shipment creation failed: ${response.status} / DHL göndərmə yaratma uğursuz oldu: ${response.status}`);
      }

      const shipmentData = await response.json();
      const trackingNumber = shipmentData.shipmentTrackingNumber || shipmentData.trackingNumber;
      const label = shipmentData.label?.url || shipmentData.document?.url;

      if (!trackingNumber) {
        throw new Error('DHL tracking number not found / DHL izləmə nömrəsi tapılmadı');
      }

      return {
        trackingNumber,
        label,
      };
    } catch (error) {
      logger.error('DHL shipment creation failed / DHL göndərmə yaratma uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async trackShipment(trackingNumber: string): Promise<ShippingTrackingInfo> {
    if (!this.isConfigured()) {
      throw new Error('DHL provider not configured / DHL provayderi konfiqurasiya edilməyib');
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('DHL authentication failed / DHL autentifikasiya uğursuz oldu');
    }

    const isSandbox = process.env.DHL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api-sandbox.dhl.com'
      : 'https://api.dhl.com';

    try {
      const response = await fetch(`${baseUrl}/v1/tracking/${trackingNumber}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('DHL tracking failed / DHL izləmə uğursuz oldu', new Error(JSON.stringify(errorData)), { trackingNumber });
        throw new Error(`DHL tracking failed: ${response.status} / DHL izləmə uğursuz oldu: ${response.status}`);
      }

      const trackingData = await response.json();
      const events = trackingData.events || trackingData.shipments?.[0]?.events || [];

      return {
        trackingNumber,
        status: trackingData.status || 'in_transit',
        carrier: 'dhl',
        events: events.map((event: any) => ({
          timestamp: new Date(event.timestamp || event.date),
          location: event.location?.address?.addressLocality || event.location || '',
          description: event.description || event.eventDescription || '',
        })),
        estimatedDelivery: trackingData.estimatedDeliveryDate
          ? new Date(trackingData.estimatedDeliveryDate)
          : undefined,
      };
    } catch (error) {
      logger.error('DHL tracking failed / DHL izləmə uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { trackingNumber });
      throw error;
    }
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('DHL provider not configured / DHL provayderi konfiqurasiya edilməyib');
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('DHL authentication failed / DHL autentifikasiya uğursuz oldu');
    }

    const isSandbox = process.env.DHL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api-sandbox.dhl.com'
      : 'https://api.dhl.com';

    try {
      const response = await fetch(`${baseUrl}/v1/shipments/${trackingNumber}/cancel`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('DHL cancellation failed / DHL ləğv uğursuz oldu', new Error(JSON.stringify(errorData)), { trackingNumber });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('DHL cancellation failed / DHL ləğv uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { trackingNumber });
      return false;
    }
  }
}

/**
 * FedEx Shipping Provider (Placeholder) / FedEx Çatdırılma Provayderi (Placeholder)
 */
class FedExShippingProvider implements ShippingProvider {
  name: ShippingCarrier = "fedex";
  private apiKey?: string;
  private apiSecret?: string;

  constructor() {
    this.apiKey = process.env.FEDEX_API_KEY;
    this.apiSecret = process.env.FEDEX_API_SECRET;
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  /**
   * Get FedEx access token / FedEx access token al
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.apiKey || !this.apiSecret) {
      return null;
    }

    const isSandbox = process.env.FEDEX_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://apis-sandbox.fedex.com'
      : 'https://apis.fedex.com';

    try {
      const response = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        }).toString(),
      });

      if (!response.ok) {
        logger.error('Failed to get FedEx access token / FedEx access token almaq uğursuz oldu', new Error(`HTTP ${response.status}`));
        return null;
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Failed to get FedEx access token / FedEx access token almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  async getRates(request: ShippingQuoteRequest): Promise<ShippingRate[]> {
    if (!this.isConfigured()) {
      logger.warn('FedEx provider not configured / FedEx provayderi konfiqurasiya edilməyib');
      return [];
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      logger.warn('FedEx authentication failed. Returning empty rates / FedEx autentifikasiya uğursuz oldu. Boş tariflər qaytarılır');
      return [];
    }

    const isSandbox = process.env.FEDEX_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://apis-sandbox.fedex.com'
      : 'https://apis.fedex.com';

    try {
      // FedEx Rate Request / FedEx Tarif Sorğusu
      const rateRequest = {
        accountNumber: {
          value: this.apiKey,
        },
        requestedShipment: {
          shipper: {
            address: {
              postalCode: request.from.zipCode,
              countryCode: request.from.country,
            },
          },
          recipients: [
            {
              address: {
                postalCode: request.to.zipCode,
                countryCode: request.to.country,
              },
            },
          ],
          rateRequestType: ['ACCOUNT', 'LIST'],
          requestedPackageLineItems: request.items.map(item => ({
            weight: {
              value: item.weight || 1,
              units: 'KG',
            },
            dimensions: {
              length: item.length || 10,
              width: item.width || 10,
              height: item.height || 10,
              units: 'CM',
            },
          })),
        },
      };

      const response = await fetch(`${baseUrl}/rate/v1/rates/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(rateRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('FedEx rate request failed / FedEx tarif sorğusu uğursuz oldu', new Error(JSON.stringify(errorData)), { request });
        return [];
      }

      const rateData = await response.json();
      const rates: ShippingRate[] = [];

      // Parse FedEx response / FedEx cavabını parse et
      if (rateData.output?.rateReplyDetails && Array.isArray(rateData.output.rateReplyDetails)) {
        for (const detail of rateData.output.rateReplyDetails) {
          const rateAmount = detail.ratedShipmentDetails?.[0]?.totalNetCharge?.amount || '0';
          rates.push({
            carrier: 'fedex',
            service: detail.serviceName || 'FedEx Express',
            rate: parseFloat(rateAmount),
            currency: detail.ratedShipmentDetails?.[0]?.totalNetCharge?.currency || 'USD',
            estimatedDays: detail.commit?.transitTime
              ? parseInt(detail.commit.transitTime) || undefined
              : undefined,
          });
        }
      }

      return rates;
    } catch (error) {
      logger.error('FedEx rate request failed / FedEx tarif sorğusu uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { request });
      return [];
    }
  }

  async createShipment(request: ShippingQuoteRequest, rate: ShippingRate): Promise<{ trackingNumber: string; label?: string }> {
    if (!this.isConfigured()) {
      throw new Error('FedEx provider not configured / FedEx provayderi konfiqurasiya edilməyib');
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('FedEx authentication failed / FedEx autentifikasiya uğursuz oldu');
    }

    const isSandbox = process.env.FEDEX_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://apis-sandbox.fedex.com'
      : 'https://apis.fedex.com';

    try {
      // FedEx Shipment Request / FedEx Göndərmə Sorğusu
      const shipmentRequest = {
        labelResponseOptions: 'URL_ONLY',
        requestedShipment: {
          shipper: {
            address: {
              postalCode: request.from.zipCode,
              countryCode: request.from.country,
              streetLines: [request.from.street],
              city: request.from.city,
            },
          },
          recipients: [
            {
              address: {
                postalCode: request.to.zipCode,
                countryCode: request.to.country,
                streetLines: [request.to.street],
                city: request.to.city,
              },
            },
          ],
          shipDatestamp: new Date().toISOString().split('T')[0],
          serviceType: rate.method.toUpperCase(),
          packagingType: 'YOUR_PACKAGING',
          pickupType: 'USE_SCHEDULED_PICKUP',
          requestedPackageLineItems: request.items.map(item => ({
            weight: {
              value: item.weight || 1,
              units: 'KG',
            },
            dimensions: {
              length: item.length || 10,
              width: item.width || 10,
              height: item.height || 10,
              units: 'CM',
            },
          })),
        },
      };

      const response = await fetch(`${baseUrl}/ship/v1/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(shipmentRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('FedEx shipment creation failed / FedEx göndərmə yaratma uğursuz oldu', new Error(JSON.stringify(errorData)));
        throw new Error(`FedEx shipment creation failed: ${response.status} / FedEx göndərmə yaratma uğursuz oldu: ${response.status}`);
      }

      const shipmentData = await response.json();
      const trackingNumber = shipmentData.output?.transactionShipments?.[0]?.masterTrackingNumber;
      const label = shipmentData.output?.transactionShipments?.[0]?.pieceResponses?.[0]?.packageDocuments?.[0]?.url;

      if (!trackingNumber) {
        throw new Error('FedEx tracking number not found / FedEx izləmə nömrəsi tapılmadı');
      }

      return {
        trackingNumber,
        label,
      };
    } catch (error) {
      logger.error('FedEx shipment creation failed / FedEx göndərmə yaratma uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async trackShipment(trackingNumber: string): Promise<ShippingTrackingInfo> {
    if (!this.isConfigured()) {
      throw new Error('FedEx provider not configured / FedEx provayderi konfiqurasiya edilməyib');
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('FedEx authentication failed / FedEx autentifikasiya uğursuz oldu');
    }

    const isSandbox = process.env.FEDEX_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://apis-sandbox.fedex.com'
      : 'https://apis.fedex.com';

    try {
      const trackingRequest = {
        trackingInfo: [
          {
            trackingNumberInfo: {
              trackingNumber,
            },
          },
        ],
      };

      const response = await fetch(`${baseUrl}/track/v1/trackingnumbers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(trackingRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('FedEx tracking failed / FedEx izləmə uğursuz oldu', new Error(JSON.stringify(errorData)), { trackingNumber });
        throw new Error(`FedEx tracking failed: ${response.status} / FedEx izləmə uğursuz oldu: ${response.status}`);
      }

      const trackingData = await response.json();
      const shipment = trackingData.output?.completeTrackResults?.[0]?.trackResults?.[0];
      const events = shipment?.scanEvents || [];

      return {
        trackingNumber,
        status: shipment?.latestStatusDetail?.code || 'in_transit',
        carrier: 'fedex',
        events: events.map((event: any) => ({
          timestamp: new Date(event.date || event.scanTimestamp),
          location: event.scanLocation?.city || event.scanLocation?.stateOrProvinceCode || '',
          description: event.eventDescription || event.eventType || '',
        })),
        estimatedDelivery: shipment?.estimatedDeliveryTimestamp
          ? new Date(shipment.estimatedDeliveryTimestamp)
          : undefined,
      };
    } catch (error) {
      logger.error('FedEx tracking failed / FedEx izləmə uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { trackingNumber });
      throw error;
    }
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('FedEx provider not configured / FedEx provayderi konfiqurasiya edilməyib');
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('FedEx authentication failed / FedEx autentifikasiya uğursuz oldu');
    }

    const isSandbox = process.env.FEDEX_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://apis-sandbox.fedex.com'
      : 'https://apis.fedex.com';

    try {
      const response = await fetch(`${baseUrl}/ship/v1/shipments/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          trackingNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('FedEx cancellation failed / FedEx ləğv uğursuz oldu', new Error(JSON.stringify(errorData)), { trackingNumber });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('FedEx cancellation failed / FedEx ləğv uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { trackingNumber });
      return false;
    }
  }
}

/**
 * Shipping Provider Manager / Çatdırılma Provayder Meneceri
 */
class ShippingProviderManager {
  private providers: Map<ShippingCarrier, ShippingProvider> = new Map();

  constructor() {
    this.registerProvider(new LocalShippingProvider());
    this.registerProvider(new DHLShippingProvider());
    this.registerProvider(new FedExShippingProvider());
  }

  registerProvider(provider: ShippingProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(carrier: ShippingCarrier): ShippingProvider | null {
    return this.providers.get(carrier) || null;
  }

  getAvailableProviders(): ShippingCarrier[] {
    return Array.from(this.providers.values())
      .filter(provider => provider.isConfigured())
      .map(provider => provider.name);
  }

  /**
   * Get rates from all available providers / Bütün mövcud provayderlərdən tarifləri al
   */
  async getAllRates(request: ShippingQuoteRequest): Promise<ShippingRate[]> {
    const allRates: ShippingRate[] = [];

    for (const provider of this.providers.values()) {
      if (provider.isConfigured()) {
        try {
          const rates = await provider.getRates(request);
          allRates.push(...rates);
        } catch (error) {
          logger.error(`Failed to get rates from ${provider.name}`, error, { request });
        }
      }
    }

    // Sort by rate (lowest first) / Tarifə görə sırala (ən aşağıdan başlayaraq)
    return allRates.sort((a, b) => a.rate - b.rate);
  }
}

// Export singleton instance / Singleton instance export et
export const shippingProviderManager = new ShippingProviderManager();

/**
 * Get shipping rates / Çatdırılma tariflərini al
 */
export async function getShippingRates(request: ShippingQuoteRequest): Promise<ShippingRate[]> {
  return shippingProviderManager.getAllRates(request);
}

/**
 * Create shipment / Göndərmə yarat
 */
export async function createShipment(
  carrier: ShippingCarrier,
  request: ShippingQuoteRequest,
  rate: ShippingRate
): Promise<{ trackingNumber: string; label?: string }> {
  const provider = shippingProviderManager.getProvider(carrier);
  if (!provider) {
    throw new Error(`Shipping provider ${carrier} not found / Çatdırılma provayderi ${carrier} tapılmadı`);
  }

  return provider.createShipment(request, rate);
}

/**
 * Track shipment / Göndərməni izlə
 */
export async function trackShipment(
  carrier: ShippingCarrier,
  trackingNumber: string
): Promise<ShippingTrackingInfo> {
  const provider = shippingProviderManager.getProvider(carrier);
  if (!provider) {
    throw new Error(`Shipping provider ${carrier} not found / Çatdırılma provayderi ${carrier} tapılmadı`);
  }

  return provider.trackShipment(trackingNumber);
}

