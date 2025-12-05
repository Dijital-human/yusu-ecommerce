/**
 * Product Validation Helpers / Məhsul Validasiya Köməkçiləri
 * Reusable validation functions for products
 * Məhsullar üçün təkrar istifadə olunan validasiya funksiyaları
 */

/**
 * Validate product ID / Məhsul ID-sini yoxla
 * @param productId - Product ID to validate / Yoxlanılacaq məhsul ID-si
 * @returns true if valid, false otherwise / Əgər düzgündürsə true, əks halda false
 */
export function validateProductId(productId: string | undefined | null): boolean {
  if (!productId) {
    return false;
  }
  
  // Check if productId is a non-empty string / productId-nin boş olmayan string olduğunu yoxla
  if (typeof productId !== 'string' || productId.trim().length === 0) {
    return false;
  }
  
  // UUID format check (optional, can be adjusted based on your ID format) / UUID format yoxlaması (istəyə bağlı, ID formatına görə dəyişdirilə bilər)
  // Basic check: non-empty string / Əsas yoxlama: boş olmayan string
  return productId.length > 0;
}

/**
 * Validate quantity / Miqdarı yoxla
 * @param quantity - Quantity to validate / Yoxlanılacaq miqdar
 * @param min - Minimum quantity (default: 1) / Minimum miqdar (default: 1)
 * @param max - Maximum quantity (default: 1000) / Maksimum miqdar (default: 1000)
 * @returns true if valid, false otherwise / Əgər düzgündürsə true, əks halda false
 */
export function validateQuantity(
  quantity: number | string | undefined | null,
  min: number = 1,
  max: number = 1000
): boolean {
  if (quantity === undefined || quantity === null) {
    return false;
  }
  
  // Convert to number if string / Əgər stringdirsə rəqəmə çevir
  const numQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  
  // Check if it's a valid number / Düzgün rəqəm olub-olmadığını yoxla
  if (isNaN(numQuantity) || !isFinite(numQuantity)) {
    return false;
  }
  
  // Check if it's an integer / Tam ədəd olub-olmadığını yoxla
  if (!Number.isInteger(numQuantity)) {
    return false;
  }
  
  // Check range / Aralığı yoxla
  return numQuantity >= min && numQuantity <= max;
}

/**
 * Validate price / Qiyməti yoxla
 * @param price - Price to validate / Yoxlanılacaq qiymət
 * @param min - Minimum price (default: 0) / Minimum qiymət (default: 0)
 * @returns true if valid, false otherwise / Əgər düzgündürsə true, əks halda false
 */
export function validatePrice(
  price: number | string | undefined | null,
  min: number = 0
): boolean {
  if (price === undefined || price === null) {
    return false;
  }
  
  // Convert to number if string / Əgər stringdirsə rəqəmə çevir
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if it's a valid number / Düzgün rəqəm olub-olmadığını yoxla
  if (isNaN(numPrice) || !isFinite(numPrice)) {
    return false;
  }
  
  // Check if it's positive / Müsbət olub-olmadığını yoxla
  return numPrice >= min;
}

/**
 * Validate required fields / Tələb olunan sahələri yoxla
 * @param data - Object to validate / Yoxlanılacaq obyekt
 * @param requiredFields - Array of required field names / Tələb olunan sahə adlarının massivi
 * @returns Object with isValid flag and missingFields array / isValid flag-i və missingFields massivi olan obyekt
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Validate email / Email-i yoxla
 * @param email - Email to validate / Yoxlanılacaq email
 * @returns true if valid, false otherwise / Əgər düzgündürsə true, əks halda false
 */
export function validateEmail(email: string | undefined | null): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Basic email regex / Əsas email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate product name / Məhsul adını yoxla
 * @param name - Product name to validate / Yoxlanılacaq məhsul adı
 * @param minLength - Minimum length (default: 3) / Minimum uzunluq (default: 3)
 * @param maxLength - Maximum length (default: 200) / Maksimum uzunluq (default: 200)
 * @returns true if valid, false otherwise / Əgər düzgündürsə true, əks halda false
 */
export function validateProductName(
  name: string | undefined | null,
  minLength: number = 3,
  maxLength: number = 200
): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmedName = name.trim();
  return trimmedName.length >= minLength && trimmedName.length <= maxLength;
}

/**
 * Validate product description / Məhsul təsvirini yoxla
 * @param description - Product description to validate / Yoxlanılacaq məhsul təsviri
 * @param minLength - Minimum length (default: 10) / Minimum uzunluq (default: 10)
 * @param maxLength - Maximum length (default: 5000) / Maksimum uzunluq (default: 5000)
 * @returns true if valid, false otherwise / Əgər düzgündürsə true, əks halda false
 */
export function validateProductDescription(
  description: string | undefined | null,
  minLength: number = 10,
  maxLength: number = 5000
): boolean {
  if (!description || typeof description !== 'string') {
    return false;
  }
  
  const trimmedDescription = description.trim();
  return trimmedDescription.length >= minLength && trimmedDescription.length <= maxLength;
}

