"use client";

import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  HelpCircle, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  RotateCcw,
  Shield,
  MessageCircle,
  Phone
} from "lucide-react";
import { useState } from "react";

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "Shopping & Orders",
      icon: ShoppingCart,
      color: "text-blue-600",
      questions: [
        {
          question: "How do I place an order?",
          answer: "To place an order, simply browse our products, add items to your cart, and proceed to checkout. You can pay with credit card, PayPal, or other available payment methods."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "You can modify or cancel your order within 30 minutes of placing it. After that, the order will be processed and cannot be changed. Contact our customer service for assistance."
        },
        {
          question: "How do I track my order?",
          answer: "Once your order is shipped, you'll receive a tracking number via email. You can use this number to track your package on our website or the carrier's website."
        }
      ]
    },
    {
      title: "Payment & Billing",
      icon: CreditCard,
      color: "text-green-600",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your credit card details on our servers."
        },
        {
          question: "Can I get a refund?",
          answer: "Yes, we offer a 30-day return policy. If you're not satisfied with your purchase, you can return it for a full refund within 30 days of delivery."
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      icon: Truck,
      color: "text-purple-600",
      questions: [
        {
          question: "How long does shipping take?",
          answer: "Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days. International shipping may take 7-14 business days."
        },
        {
          question: "Do you ship internationally?",
          answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location."
        },
        {
          question: "What if my package is damaged?",
          answer: "If your package arrives damaged, please contact us immediately with photos. We'll arrange for a replacement or refund at no cost to you."
        }
      ]
    },
    {
      title: "Returns & Exchanges",
      icon: RotateCcw,
      color: "text-orange-600",
      questions: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some items like electronics have a 14-day return window."
        },
        {
          question: "How do I return an item?",
          answer: "To return an item, log into your account, go to 'My Orders', and click 'Return Item'. Follow the instructions to print a return label and send the item back."
        },
        {
          question: "When will I receive my refund?",
          answer: "Refunds are processed within 3-5 business days after we receive your returned item. The refund will appear on your original payment method within 5-10 business days."
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ❓ Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about shopping, shipping, returns, and more. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="shadow-lg">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center text-2xl">
                  <category.icon className={`h-6 w-6 mr-3 ${category.color}`} />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {category.questions.map((item, itemIndex) => {
                  const globalIndex = categoryIndex * 100 + itemIndex;
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <div key={itemIndex} className="border-b border-gray-200 last:border-b-0">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                      >
                        <span className="font-medium text-gray-900">{item.question}</span>
                        <HelpCircle className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`} />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="text-lg mb-6">
            Our customer support team is here to help you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
              <MessageCircle className="h-4 w-4 mr-2" />
              Live Chat
            </Button>
            <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </Button>
            <Button variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
              <Shield className="h-4 w-4 mr-2" />
              Email Support
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
