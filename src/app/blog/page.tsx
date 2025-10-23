"use client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const blogPosts = [
    {
      title: "The Future of E-commerce: Trends to Watch in 2024",
      excerpt: "Discover the latest trends shaping the e-commerce landscape and how they'll impact your business.",
      author: "Yusu Team",
      date: "January 15, 2024",
      readTime: "5 min read",
      image: "/api/placeholder/400/250"
    },
    {
      title: "How to Build a Successful Online Store",
      excerpt: "Learn the essential steps to create and grow a profitable online business from scratch.",
      author: "Sarah Johnson",
      date: "January 10, 2024", 
      readTime: "8 min read",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Customer Service Best Practices for E-commerce",
      excerpt: "Improve your customer service with these proven strategies that increase satisfaction and loyalty.",
      author: "Mike Chen",
      date: "January 5, 2024",
      readTime: "6 min read", 
      image: "/api/placeholder/400/250"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Yusu Blog</h1>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                Insights, tips, and stories from the world of e-commerce
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Featured Post */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Featured Article</h2>
            <Card className="shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-64 lg:h-auto bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">Y</span>
                    </div>
                    <p className="text-orange-600 font-semibold">Featured Article</p>
                  </div>
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">The Complete Guide to E-commerce Success</h3>
                  <p className="text-gray-600 mb-6">
                    Everything you need to know to build and grow a successful online business, 
                    from choosing the right platform to marketing your products effectively.
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <User className="h-4 w-4 mr-2" />
                    <span className="mr-4">Yusu Team</span>
                    <Calendar className="h-4 w-4 mr-2 ml-4" />
                    <span>January 20, 2024</span>
                  </div>
                  <Link href="#" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Blog Posts */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">Y</span>
                      </div>
                      <p className="text-gray-600 text-sm">Blog Post</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <User className="h-4 w-4 mr-2" />
                      <span className="mr-4">{post.author}</span>
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                      <Link href="#" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold text-sm">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest e-commerce insights, tips, and updates delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
