/**
 * API Documentation Page / API Sənədləşmə Səhifəsi
 * Interactive API documentation using Swagger UI
 * Swagger UI istifadə edərək interaktiv API sənədləşməsi
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Swagger UI (client-side only) / Swagger UI-ni dinamik yüklə (yalnız client-side)
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Swagger UI... / Swagger UI yüklənir...</p>
      </div>
    </div>
  )
}) as any;

// Import Swagger UI CSS
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load OpenAPI spec / OpenAPI spec-i yüklə
    fetch('/api/docs')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load API documentation');
        }
        return res.json();
      })
      .then((data) => setSpec(data))
      .catch((error) => {
        console.error('❌ [API Docs] Failed to load spec:', error);
        setError('Failed to load API documentation / API sənədləşməsini yükləmək mümkün olmadı');
      });
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error / Xəta</h2>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading API documentation... / API sənədləşməsi yüklənir...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          API Documentation / API Sənədləşməsi
        </h1>
        <p className="text-gray-600">
          Interactive API documentation for Ulustore E-commerce Platform / Ulustore E-ticarət Platforması üçün interaktiv API sənədləşməsi
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <SwaggerUI
          spec={spec}
          docExpansion="list"
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={1}
          persistAuthorization={true}
          deepLinking={true}
        />
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Getting Started / Başlanğıc
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>
            Most endpoints require authentication / Əksər endpoint-lər autentifikasiya tələb edir
          </li>
          <li>
            Use the "Authorize" button to authenticate / Autentifikasiya etmək üçün "Authorize" düyməsini istifadə edin
          </li>
          <li>
            Session-based authentication is used / Sessiya əsaslı autentifikasiya istifadə olunur
          </li>
          <li>
            Make requests to the endpoints below / Aşağıdakı endpoint-lərə sorğular göndərin
          </li>
        </ol>
      </div>
    </div>
  );
}

