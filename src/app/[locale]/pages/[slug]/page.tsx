/**
 * CMS Page Route / CMS Səhifə Route-u
 * Dynamic page rendering for CMS pages
 * CMS səhifələri üçün dinamik səhifə render etmə
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { CMSPageContent } from "@/components/pages/CMSPageContent";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/pages/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        title: "Page Not Found",
      };
    }

    const data = await response.json();
    const page = data.data || data;

    return {
      title: page.metaTitle || page.title,
      description: page.metaDescription,
    };
  } catch (error) {
    return {
      title: "Page",
    };
  }
}

export default async function CMSPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/pages/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      notFound();
    }

    const data = await response.json();
    const page = data.data || data;

    if (!page.isPublished) {
      notFound();
    }

    return (
      <Layout>
        <CMSPageContent page={page} />
      </Layout>
    );
  } catch (error) {
    notFound();
  }
}

