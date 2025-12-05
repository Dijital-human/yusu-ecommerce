/**
 * API Documentation Route / API Sənədləşmə Route-u
 * Serves OpenAPI/Swagger documentation
 * OpenAPI/Swagger sənədləşməsini təqdim edir
 */

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * GET /api/docs
 * Get OpenAPI specification / OpenAPI spesifikasiyasını al
 */
export async function GET() {
  try {
    // Read OpenAPI spec from file system / Fayl sistemindən OpenAPI spec-i oxu
    const filePath = join(process.cwd(), 'docs', 'openapi.json');
    const fileContents = readFileSync(filePath, 'utf-8');
    const openApiSpec = JSON.parse(fileContents);
    
    // Update server URLs based on environment / Mühitə görə server URL-lərini yenilə
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://ulustore.com';
    openApiSpec.servers = [
      {
        url: `${baseUrl}/api`,
        description: 'Production server / Production server'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Development server / Development server'
      }
    ];
    
    return NextResponse.json(openApiSpec);
  } catch (error) {
    console.error('❌ [API Docs] Failed to load OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Failed to load API documentation / API sənədləşməsini yükləmək mümkün olmadı' },
      { status: 500 }
    );
  }
}

