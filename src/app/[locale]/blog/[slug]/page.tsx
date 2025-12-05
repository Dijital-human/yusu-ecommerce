/**
 * Blog Post Detail Page / Blog Yazısı Detalları Səhifəsi
 * Displays a single blog post with full content, comments, and related posts
 * Tək blog yazısını tam məzmun, şərhlər və əlaqəli yazılarla göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { BlogPost } from "@/components/blog/BlogPost";
import { BlogComments } from "@/components/blog/BlogComments";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";

interface BlogPostData {
  post: any;
  relatedPosts: any[];
}

export default function BlogPostDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const response = await fetch(`/api/blog/${slug}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch blog post");
        }

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || "Failed to load blog post");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
              <p className="text-gray-600 mb-6">
                {error || "The blog post you're looking for doesn't exist."}
              </p>
              <a
                href="/blog"
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Back to Blog
              </a>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <BlogPost post={data.post} relatedPosts={data.relatedPosts} showFullContent />
          
          {/* Comments Section / Şərhlər Bölməsi */}
          <div className="mt-12">
            <BlogComments postSlug={slug} postId={data.post.id} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

