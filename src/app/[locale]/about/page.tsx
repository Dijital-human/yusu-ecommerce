"use client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Target, Award, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">About Ulustore</h1>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                Your trusted e-commerce platform for quality products and reliable delivery
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Target className="h-6 w-6 text-orange-500 mr-3" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  To provide a seamless, secure, and enjoyable online shopping experience for our customers, 
                  connecting them with quality products from trusted sellers while ensuring fast and reliable delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Award className="h-6 w-6 text-orange-500 mr-3" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  To become the leading e-commerce platform in our region, known for innovation, 
                  customer satisfaction, and supporting local businesses and entrepreneurs.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Customer First</h3>
                  <p className="text-gray-600">
                    Every decision we make is guided by what's best for our customers.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Community</h3>
                  <p className="text-gray-600">
                    We believe in building strong relationships with our community of users and sellers.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Excellence</h3>
                  <p className="text-gray-600">
                    We strive for excellence in everything we do, from product quality to customer service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">By the Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">10,000+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
                <div className="text-gray-600">Trusted Sellers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">50,000+</div>
                <div className="text-gray-600">Products Sold</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">99%</div>
                <div className="text-gray-600">Customer Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Have questions about Yusu? We'd love to hear from you. 
              Send us a message and we'll respond as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="/careers" 
                className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Join Our Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
