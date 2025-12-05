/**
 * Social Share Button Component / Sosial Paylaşım Düyməsi Komponenti
 * Button for sharing to social media platforms / Sosial media platformalarına paylaşmaq üçün düymə
 */

'use client';

import { Facebook, Twitter, MessageCircle, Send, Linkedin, Pinterest, Mail, Link2 } from 'lucide-react';
import { shareToPlatform, trackShare } from '@/lib/social/share-helper';
import { useTranslations } from 'next-intl';

interface SocialShareButtonProps {
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'linkedin' | 'pinterest' | 'email' | 'copy';
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  productId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  whatsapp: MessageCircle,
  telegram: Send,
  linkedin: Linkedin,
  pinterest: Pinterest,
  email: Mail,
  copy: Link2,
};

const platformColors = {
  facebook: 'bg-blue-600 hover:bg-blue-700 text-white',
  twitter: 'bg-sky-500 hover:bg-sky-600 text-white',
  whatsapp: 'bg-green-500 hover:bg-green-600 text-white',
  telegram: 'bg-blue-400 hover:bg-blue-500 text-white',
  linkedin: 'bg-blue-700 hover:bg-blue-800 text-white',
  pinterest: 'bg-red-600 hover:bg-red-700 text-white',
  email: 'bg-gray-600 hover:bg-gray-700 text-white',
  copy: 'bg-gray-500 hover:bg-gray-600 text-white',
};

export function SocialShareButton({
  platform,
  url,
  title,
  description,
  imageUrl,
  productId,
  className = '',
  size = 'md',
  variant = 'default',
}: SocialShareButtonProps) {
  const t = useTranslations('social');

  const Icon = platformIcons[platform];
  const colorClass = variant === 'default' ? platformColors[platform] : '';
  
  const sizeClasses = {
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-3',
  };

  const handleClick = async () => {
    shareToPlatform(platform, url, title, description, imageUrl);
    
    // Track share if productId provided / productId verilərsə paylaşımı izlə
    if (productId) {
      await trackShare(productId, platform, url);
    }
  };

  const buttonClass = variant === 'outline'
    ? `border border-gray-300 hover:bg-gray-50 text-gray-700 ${sizeClasses[size]}`
    : variant === 'ghost'
    ? `hover:bg-gray-100 text-gray-700 ${sizeClasses[size]}`
    : `${colorClass} ${sizeClasses[size]}`;

  return (
    <button
      onClick={handleClick}
      className={`rounded-full transition-colors flex items-center justify-center ${buttonClass} ${className}`}
      aria-label={t(`shareTo.${platform}`) || `Share to ${platform}`}
      title={t(`shareTo.${platform}`) || `Share to ${platform}`}
    >
      <Icon className={size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'} />
    </button>
  );
}

