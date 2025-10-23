"use client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, HelpCircle, MessageCircle, Phone, Mail, ChevronRight } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Simply browse our products, add items to your cart, and proceed to checkout. Follow the steps to complete your purchase."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and other secure payment methods."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery."
    },
    {
      question: "Can I return or exchange items?",
      answer: "Yes, we offer a 30-day return policy for most items. Check our returns page for more details."
    }
  ];

  const helpCategories = [
    {
      title: "Getting Started",
      description: "New to Yusu? Learn the basics",
      icon: <HelpCircle className="h-8 w-8 text-orange-600" />,
      topics: ["Account Setup", "First Order", "Profile Settings"]
    },
    {
      title: "Orders & Shipping", 
      description: "Everything about your orders",
      icon: <MessageCircle className="h-8 w-8 text-orange-600" />,
      topics: ["Track Order", "Shipping Info", "Delivery Issues"]
    },
    {
      title: "Account & Security",
      description: "Manage your account safely",
      icon: <Phone className="h-8 w-8 text-orange-600" />,
      topics: ["Password Reset", "Two-Factor Auth", "Privacy Settings"]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Help Center</h1>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                Find answers to your questions and get the support you need
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Search */}
          <div className="mb-16">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for help articles, FAQs, and more..."
                  className="pl-10 pr-4 py-3 text-lg"
                />
                <Button className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600 text-white">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Help Categories */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">How can we help you?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {helpCategories.map((category, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="space-y-2">
                      {category.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center text-sm text-gray-600">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          {topic}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <MessageCircle className="h-6 w-6 text-orange-500 mr-3" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Chat with our support team in real-time. Available 24/7 for your convenience.
                </p>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Mail className="h-6 w-6 text-orange-500 mr-3" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
