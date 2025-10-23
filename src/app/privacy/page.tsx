"use client";

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Shield, Eye, Lock, Database, Mail, Phone } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        "Personal information (name, email, phone number)",
        "Payment information (processed securely through third-party providers)",
        "Shipping and billing addresses",
        "Order history and preferences",
        "Website usage data and analytics",
        "Communication preferences"
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        "Process and fulfill your orders",
        "Provide customer support and service",
        "Send order updates and shipping notifications",
        "Improve our website and services",
        "Send marketing communications (with your consent)",
        "Comply with legal obligations"
      ]
    },
    {
      title: "Information Sharing",
      icon: Lock,
      content: [
        "We do not sell your personal information to third parties",
        "We may share information with trusted service providers (shipping, payment processing)",
        "We may share information when required by law or to protect our rights",
        "We may share aggregated, non-personal data for analytics purposes"
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔒 Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, 
            use, and protect your personal information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Shield className="h-6 w-6 mr-3 text-orange-500" />
              Our Commitment to Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              At Yusu, we are committed to protecting your privacy and ensuring the security 
              of your personal information. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you visit our website or make a purchase.
            </p>
          </CardContent>
        </Card>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <section.icon className="h-6 w-6 mr-3 text-orange-500" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Security */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Lock className="h-6 w-6 mr-3 text-orange-500" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Security Measures</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• SSL encryption for all data transmission</li>
                  <li>• Secure payment processing</li>
                  <li>• Regular security audits</li>
                  <li>• Limited access to personal data</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Your Rights</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Access your personal data</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Request data deletion</li>
                  <li>• Opt-out of marketing communications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your browsing experience, 
              analyze website traffic, and personalize content. You can control cookie 
              settings through your browser preferences.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Cookie Types</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>Essential Cookies:</strong> Required for website functionality</li>
                <li>• <strong>Analytics Cookies:</strong> Help us understand website usage</li>
                <li>• <strong>Marketing Cookies:</strong> Used for targeted advertising</li>
                <li>• <strong>Preference Cookies:</strong> Remember your settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">privacy@azliner.info</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">
            Policy Updates
          </h3>
          <p className="text-orange-800">
            We may update this Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page and updating the 
            "Last updated" date. Your continued use of our service after any changes 
            constitutes acceptance of the updated policy.
          </p>
        </div>
      </div>
    </Layout>
  );
}
