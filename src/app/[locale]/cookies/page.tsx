/**
 * Cookie Policy Page / Cookie Siyasəti Səhifəsi
 * This page displays cookie policy and allows users to manage cookie preferences
 * Bu səhifə cookie siyasətini göstərir və istifadəçilərə cookie tərcihlərini idarə etməyə imkan verir
 */

"use client";

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  Cookie, 
  Shield, 
  Target, 
  CheckCircle,
  XCircle
} from "lucide-react";
import { CookiePreferencesComponent } from "@/components/cookies/CookiePreferences";

export default function CookiesPage() {
  const cookieTypes = [
    {
      id: "essential",
      name: "Essential Cookies",
      description: "These cookies are necessary for the website to function and cannot be switched off in our systems.",
      required: true,
      examples: [
        "User authentication",
        "Shopping cart functionality",
        "Security features",
        "Basic website navigation"
      ]
    },
    {
      id: "analytics",
      name: "Analytics Cookies",
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      required: false,
      examples: [
        "Page views and traffic sources",
        "User behavior patterns",
        "Website performance metrics",
        "Error tracking and debugging"
      ]
    },
    {
      id: "marketing",
      name: "Marketing Cookies",
      description: "These cookies are used to track visitors across websites to display relevant and engaging advertisements.",
      required: false,
      examples: [
        "Targeted advertising",
        "Social media integration",
        "Email marketing campaigns",
        "Retargeting pixels"
      ]
    },
    {
      id: "functional",
      name: "Functional Cookies",
      description: "These cookies remember your choices and preferences to provide a more personalized experience.",
      required: false,
      examples: [
        "Language and region settings",
        "Theme preferences",
        "Customized content",
        "User interface preferences"
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍪 Cookie Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about how we use cookies and similar technologies to enhance your 
            browsing experience and improve our services.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 15, 2024
          </p>
        </div>

        {/* What are Cookies */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Cookie className="h-6 w-6 mr-3 text-orange-500" />
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">How Cookies Work</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Cookies are stored in your browser's memory or on your device</li>
                <li>• They contain information about your visit to the website</li>
                <li>• They help websites remember your preferences and settings</li>
                <li>• They can be temporary (session cookies) or permanent (persistent cookies)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Types */}
        <div className="space-y-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Types of Cookies We Use
          </h2>
          
          {cookieTypes.map((cookieType) => (
            <Card key={cookieType.id} className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-orange-500" />
                    {cookieType.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {cookieType.required ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Required
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Optional
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{cookieType.description}</p>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Examples:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {cookieType.examples.map((example, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {!cookieType.required && (
                  <div className="text-sm text-gray-600 italic">
                    You can manage this cookie type in the preferences section below.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cookie Management */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              Manage Your Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">
              You can control and manage cookies in various ways. Please note that removing or blocking 
              cookies can impact your user experience and parts of our website may no longer be fully accessible.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Browser Settings</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Chrome: Settings → Privacy and Security → Cookies</li>
                  <li>• Firefox: Options → Privacy & Security → Cookies</li>
                  <li>• Safari: Preferences → Privacy → Cookies</li>
                  <li>• Edge: Settings → Cookies and Site Permissions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Cookie Controls</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Accept all cookies</li>
                  <li>• Reject non-essential cookies</li>
                  <li>• Customize cookie preferences</li>
                  <li>• Clear existing cookies</li>
                </ul>
              </div>
            </div>

            {/* Cookie Preferences Component */}
            <div className="mt-8">
              <CookiePreferencesComponent />
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Target className="h-6 w-6 mr-3 text-orange-500" />
              Third-Party Cookies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              We may use third-party services that set their own cookies. These services help us 
              provide better functionality and analyze our website performance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Analytics Services</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Google Analytics</li>
                  <li>• Facebook Pixel</li>
                  <li>• Hotjar</li>
                  <li>• Mixpanel</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Marketing Services</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Google Ads</li>
                  <li>• Facebook Ads</li>
                  <li>• LinkedIn Ads</li>
                  <li>• Twitter Ads</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Questions About Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, 
              please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                <p className="text-gray-600">privacy@azliner.info</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Phone</h4>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
