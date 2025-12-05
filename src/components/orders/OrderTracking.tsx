/**
 * Order Tracking Component / Sifariş İzləmə Komponenti
 * Real-time order tracking with timeline and map / Zaman xətti və xəritə ilə real-time sifariş izləmə
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck,
  Phone,
  Navigation
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface OrderTrackingUpdate {
  orderId: string;
  status: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  estimatedDelivery?: Date;
  courier?: {
    name: string;
    phone?: string;
  };
  timestamp: Date;
  description?: string;
}

interface OrderTrackingProps {
  orderId: string;
  initialTimeline?: OrderTrackingUpdate[];
  enableRealtime?: boolean;
  showMap?: boolean;
}

export function OrderTracking({
  orderId,
  initialTimeline = [],
  enableRealtime = true,
  showMap = false,
}: OrderTrackingProps) {
  const t = useTranslations('orders');
  const [timeline, setTimeline] = useState<OrderTrackingUpdate[]>(initialTimeline);
  const [currentUpdate, setCurrentUpdate] = useState<OrderTrackingUpdate | null>(
    initialTimeline.length > 0 ? initialTimeline[initialTimeline.length - 1] : null
  );
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enableRealtime || !orderId) return;

    // Connect to SSE stream / SSE axınına qoşul
    const eventSource = new EventSource(`/api/orders/${orderId}/tracking?stream=true`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'timeline') {
          setTimeline(data.data);
          if (data.data.length > 0) {
            setCurrentUpdate(data.data[data.data.length - 1]);
          }
        } else if (data.type === 'update') {
          setTimeline((prev) => [...prev, data.data]);
          setCurrentUpdate(data.data);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Fallback to polling if SSE fails / SSE uğursuz olarsa polling-ə keç
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [orderId, enableRealtime]);

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      IN_TRANSIT: 'bg-cyan-100 text-cyan-800',
      OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'OUT_FOR_DELIVERY':
      case 'IN_TRANSIT':
        return <Truck className="h-5 w-5 text-orange-600" />;
      case 'SHIPPED':
        return <Package className="h-5 w-5 text-indigo-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">{t('noTrackingInfo') || 'No tracking information available'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status / Cari Status */}
      {currentUpdate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('currentStatus') || 'Current Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(currentUpdate.status)}
                <div>
                  <Badge className={getStatusColor(currentUpdate.status)}>
                    {currentUpdate.status.replace(/_/g, ' ')}
                  </Badge>
                  {currentUpdate.description && (
                    <p className="text-sm text-gray-600 mt-1">{currentUpdate.description}</p>
                  )}
                </div>
              </div>
              {currentUpdate.estimatedDelivery && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">{t('estimatedDelivery') || 'Estimated Delivery'}</p>
                  <p className="font-semibold">
                    {new Date(currentUpdate.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Courier Info / Kuryer Məlumatı */}
            {currentUpdate.courier && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t('courier') || 'Courier'}</p>
                    <p className="text-sm text-gray-600">{currentUpdate.courier.name}</p>
                  </div>
                  {currentUpdate.courier.phone && (
                    <a
                      href={`tel:${currentUpdate.courier.phone}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Phone className="h-4 w-4" />
                      {currentUpdate.courier.phone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Map / Xəritə */}
            {showMap && currentUpdate.location && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                  <iframe
                    src={`https://www.google.com/maps?q=${currentUpdate.location.latitude},${currentUpdate.location.longitude}&output=embed`}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                  />
                  {currentUpdate.location.address && (
                    <div className="absolute bottom-2 left-2 bg-white px-3 py-2 rounded shadow-lg text-sm">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {currentUpdate.location.address}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline / Zaman Xətti */}
      <Card>
        <CardHeader>
          <CardTitle>{t('trackingTimeline') || 'Tracking Timeline'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {timeline.map((update, index) => (
              <div
                key={index}
                className={`relative pb-8 ${index === timeline.length - 1 ? '' : 'border-l-2 border-gray-200'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 ${index === timeline.length - 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {getStatusIcon(update.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(update.status)}>
                        {update.status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(update.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {update.description && (
                      <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                    )}
                    {update.location?.address && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {update.location.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

