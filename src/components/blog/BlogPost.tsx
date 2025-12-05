/**
 * Blog Post Component / Blog Yazısı Komponenti
 * Enhanced blog post display with categories, tags, author info, reading time, related posts, social sharing, and comments
 * Kateqoriyalar, tag-lər, müəllif məlumatı, oxuma vaxtı, əlaqəli yazılar, sosial paylaşım və şərhlərlə təkmilləşdirilmiş blog yazısı göstəricisi
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  User,
  Clock,
  Tag,
  Share2,
  Eye,
  MessageCircle,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { SocialShareButton } from "@/components/social/SocialShareButton";
import { format } from "date-fns";

interface BlogPostProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    author: {
      id: string;
      name: string;
      image?: string;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
    };
    tags: Array<{
      tag: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
    publishedAt?: string;
    readingTime?: number;
    viewCount: number;
    shareCount: number;
    _count?: {
      comments: number;
      views: number;
    };
  };
  relatedPosts?: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: string;
    author: {
      id: string;
      name: string;
      image?: string;
    };
    category?: {
      id: string;
      name: string;
      slug: string;
    };
    publishedAt?: string;
    readingTime?: number;
  }>;
  showFullContent?: boolean;
}

export function BlogPost({ post, relatedPosts = [], showFullContent = false }: BlogPostProps) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [shareCount, setShareCount] = useState(post.shareCount);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleShare = async (platform: string) => {
    try {
      const response = await fetch(`/api/blog/${post.slug}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform }),
      });

      if (response.ok) {
        setShareCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error tracking share:", error);
    }
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header / Başlıq */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        {/* Category / Kateqoriya */}
        {post.category && (
          <Link href={`/blog?category=${post.category.slug}`}>
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200">
              {post.category.name}
            </Badge>
          </Link>
        )}

        {/* Title / Başlıq */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Meta Information / Meta Məlumat */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center">
            {post.author.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full mr-2"
              />
            ) : (
              <User className="h-4 w-4 mr-2" />
            )}
            <span>{post.author.name}</span>
          </div>

          {post.publishedAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <time dateTime={post.publishedAt}>
                {format(new Date(post.publishedAt), "MMMM d, yyyy")}
              </time>
            </div>
          )}

          {post.readingTime && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{post.readingTime} min read</span>
            </div>
          )}

          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            <span>{post.viewCount} views</span>
          </div>

          {post._count?.comments !== undefined && (
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>{post._count.comments} comments</span>
            </div>
          )}
        </div>

        {/* Featured Image / Əsas Şəkil */}
        {post.featuredImage && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt / Xülasə */}
        {post.excerpt && !showFullContent && (
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
        )}
      </div>

      {/* Content / Məzmun */}
      {showFullContent && (
        <div
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      )}

      {/* Tags / Tag-lər */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Tag className="h-4 w-4 text-gray-500 mt-1" />
          {post.tags.map(({ tag }) => (
            <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
              <Badge variant="outline" className="hover:bg-orange-50">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Social Sharing / Sosial Paylaşım */}
      <div className="border-t border-b py-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Share this post:</span>
          </div>
          <div className="flex items-center gap-2">
            <SocialShareButton
              platform="facebook"
              url={currentUrl}
              title={post.title}
              description={post.excerpt}
              imageUrl={post.featuredImage}
            />
            <SocialShareButton
              platform="twitter"
              url={currentUrl}
              title={post.title}
              description={post.excerpt}
            />
            <SocialShareButton
              platform="whatsapp"
              url={currentUrl}
              title={post.title}
            />
            <SocialShareButton
              platform="telegram"
              url={currentUrl}
              title={post.title}
            />
            <SocialShareButton
              platform="email"
              url={currentUrl}
              title={post.title}
              description={post.excerpt}
            />
            <SocialShareButton platform="copy" url={currentUrl} />
          </div>
        </div>
        {shareCount > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Shared {shareCount} {shareCount === 1 ? "time" : "times"}
          </p>
        )}
      </div>

      {/* Related Posts / Əlaqəli Yazılar */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                {relatedPost.featuredImage && (
                  <div className="relative w-full h-48">
                    <Image
                      src={relatedPost.featuredImage}
                      alt={relatedPost.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="hover:text-orange-600"
                    >
                      {relatedPost.title}
                    </Link>
                  </h3>
                  {relatedPost.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {relatedPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{relatedPost.author.name}</span>
                    {relatedPost.readingTime && (
                      <span>{relatedPost.readingTime} min</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

