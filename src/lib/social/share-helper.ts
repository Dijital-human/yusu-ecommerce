/**
 * Social Share Helper / Sosial Paylaşım Köməkçisi
 * Helper functions for social media sharing / Sosial media paylaşımı üçün köməkçi funksiyalar
 */

/**
 * Get share URL for different platforms / Müxtəlif platformalar üçün paylaşım URL-i al
 */
export function getShareUrl(
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'linkedin' | 'pinterest' | 'email',
  url: string,
  title?: string,
  description?: string,
  imageUrl?: string
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = title ? encodeURIComponent(title) : '';
  const encodedDescription = description ? encodeURIComponent(description) : '';
  const encodedImage = imageUrl ? encodeURIComponent(imageUrl) : '';

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${encodedDescription ? `&description=${encodedDescription}` : ''}`;
    
    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    
    case 'pinterest':
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}${encodedImage ? `&media=${encodedImage}` : ''}`;
    
    case 'email':
      const subject = encodedTitle || 'Check out this product';
      const body = `${encodedDescription || ''}\n\n${url}`;
      return `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
    
    default:
      return url;
  }
}

/**
 * Share to platform / Platforma paylaş
 */
export function shareToPlatform(
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'linkedin' | 'pinterest' | 'email' | 'copy',
  url: string,
  title?: string,
  description?: string,
  imageUrl?: string
): void {
  if (platform === 'copy') {
    // Copy to clipboard / Clipboard-a kopyala
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        // Success notification can be handled by component / Uğur bildirişi komponent tərəfindən idarə edilə bilər
      }).catch((error) => {
        console.error('Failed to copy to clipboard', error);
      });
    } else {
      // Fallback for older browsers / Köhnə brauzerlər üçün fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy', err);
      }
      document.body.removeChild(textArea);
    }
    return;
  }

  const shareUrl = getShareUrl(platform, url, title, description, imageUrl);
  
  // Open in new window / Yeni pəncərədə aç
  const width = 600;
  const height = 400;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  window.open(
    shareUrl,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1`
  );
}

/**
 * Track share event / Paylaşım hadisəsini izlə
 */
export async function trackShare(
  productId: string,
  platform: string,
  url: string
): Promise<void> {
  try {
    await fetch('/api/social/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        platform,
        url,
      }),
    });
  } catch (error) {
    // Silent fail - tracking is not critical / Sessiz uğursuzluq - izləmə kritik deyil
    console.error('Failed to track share', error);
  }
}

