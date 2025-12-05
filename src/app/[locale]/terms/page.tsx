/**
 * Terms of Service Page / Xidmət Şərtləri Səhifəsi
 * This page displays the terms and conditions for using the website
 * Bu səhifə veb-saytından istifadə üçün şərtləri və qaydaları göstərir
 */

"use client";

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileText, Scale, Users, CreditCard, Truck, Shield } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: FileText,
      content: [
        "By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service.",
        "These terms may be updated from time to time without notice."
      ]
    },
    {
      title: "Use License",
      icon: Scale,
      content: [
        "Permission is granted to temporarily download one copy of the materials on Yusu's website for personal, non-commercial transitory viewing only.",
        "This is the grant of a license, not a transfer of title, and under this license you may not:",
        "• Modify or copy the materials",
        "• Use the materials for any commercial purpose or for any public display",
        "• Attempt to reverse engineer any software contained on the website",
        "• Remove any copyright or other proprietary notations from the materials"
      ]
    },
    {
      title: "User Accounts",
      icon: Users,
      content: [
        "You are responsible for maintaining the confidentiality of your account and password.",
        "You agree to accept responsibility for all activities that occur under your account or password.",
        "You must provide accurate, current, and complete information during registration.",
        "You must notify us immediately of any unauthorized use of your account."
      ]
    },
    {
      title: "Payment Terms",
      icon: CreditCard,
      content: [
        "All prices are subject to change without notice.",
        "Payment is due at the time of purchase unless otherwise specified.",
        "We accept major credit cards, PayPal, and other approved payment methods.",
        "Refunds are processed according to our return policy.",
        "You are responsible for any applicable taxes and fees."
      ]
    },
    {
      title: "Shipping and Delivery",
      icon: Truck,
      content: [
        "Shipping costs and delivery times vary by location and shipping method.",
        "We are not responsible for delays caused by shipping carriers.",
        "Risk of loss and title for products purchased pass to you upon delivery.",
        "You are responsible for providing accurate shipping information.",
        "We reserve the right to refuse or cancel orders at our discretion."
      ]
    },
    {
      title: "Limitation of Liability",
      icon: Shield,
      content: [
        "In no event shall Yusu or its suppliers be liable for any damages arising out of the use or inability to use the materials on this website.",
        "This includes, but is not limited to, damages for loss of data or profit, or due to business interruption.",
        "Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you."
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📋 Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms and conditions carefully before using our service. 
            By using our website, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <FileText className="h-6 w-6 mr-3 text-orange-500" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service ("Terms") govern your use of our website located at 
              azliner.info (the "Service") operated by Yusu ("us", "we", or "our"). 
              By accessing or using our Service, you agree to be bound by these Terms.
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
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Prohibited Uses */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Prohibited Uses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              You may not use our Service for any unlawful purpose or to solicit others to perform unlawful acts. 
              You may not use our Service in any manner that could damage, disable, overburden, or impair our servers or networks.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Prohibited Activities Include:</h4>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• Violating any applicable laws or regulations</li>
                <li>• Transmitting or procuring the sending of unsolicited advertising</li>
                <li>• Impersonating another person or entity</li>
                <li>• Attempting to gain unauthorized access to our systems</li>
                <li>• Interfering with the proper working of the Service</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              The Service and its original content, features, and functionality are and will remain 
              the exclusive property of Yusu and its licensors. The Service is protected by copyright, 
              trademark, and other laws. Our trademarks and trade dress may not be used in connection 
              with any product or service without our prior written consent.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account and bar access to the Service immediately, 
              without prior notice or liability, under our sole discretion, for any reason whatsoever 
              and without limitation, including but not limited to a breach of the Terms.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which 
              Yusu operates, without regard to its conflict of law provisions. Our failure to enforce 
              any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                <p className="text-gray-600">legal@azliner.info</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                <p className="text-gray-600">
                  Yusu Legal Department<br />
                  123 Business Street<br />
                  City, State 12345
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">
            Changes to Terms
          </h3>
          <p className="text-orange-800">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
            If a revision is material, we will provide at least 30 days notice prior to any new terms 
            taking effect. Your continued use of the Service after any such changes constitutes your 
            acceptance of the new Terms.
          </p>
        </div>
      </div>
    </Layout>
  );
}
