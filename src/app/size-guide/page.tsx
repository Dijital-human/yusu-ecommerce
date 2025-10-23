"use client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Ruler, Shirt, Shoe, User } from "lucide-react";

export default function SizeGuidePage() {
  const sizeCharts = {
    clothing: [
      { size: "XS", chest: "32-34", waist: "26-28", length: "26" },
      { size: "S", chest: "34-36", waist: "28-30", length: "27" },
      { size: "M", chest: "36-38", waist: "30-32", length: "28" },
      { size: "L", chest: "38-40", waist: "32-34", length: "29" },
      { size: "XL", chest: "40-42", waist: "34-36", length: "30" },
      { size: "XXL", chest: "42-44", waist: "36-38", length: "31" }
    ],
    shoes: [
      { size: "6", us: "6", eu: "39", uk: "5.5" },
      { size: "7", us: "7", eu: "40", uk: "6.5" },
      { size: "8", us: "8", eu: "41", uk: "7.5" },
      { size: "9", us: "9", eu: "42", uk: "8.5" },
      { size: "10", us: "10", eu: "43", uk: "9.5" },
      { size: "11", us: "11", eu: "44", uk: "10.5" }
    ]
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Size Guide</h1>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                Find the perfect fit with our comprehensive size charts and measuring guides
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* How to Measure */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">How to Measure</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ruler className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Chest</h3>
                  <p className="text-gray-600">Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Waist</h3>
                  <p className="text-gray-600">Measure around your natural waistline, usually the narrowest part of your torso.</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shoe className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Foot Length</h3>
                  <p className="text-gray-600">Measure from the back of your heel to the tip of your longest toe.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Clothing Size Chart */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Clothing Size Chart</h2>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Size</th>
                        <th className="text-left py-3 px-4 font-semibold">Chest (inches)</th>
                        <th className="text-left py-3 px-4 font-semibold">Waist (inches)</th>
                        <th className="text-left py-3 px-4 font-semibold">Length (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeCharts.clothing.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4 font-semibold">{item.size}</td>
                          <td className="py-3 px-4">{item.chest}</td>
                          <td className="py-3 px-4">{item.waist}</td>
                          <td className="py-3 px-4">{item.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shoe Size Chart */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Shoe Size Chart</h2>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">US</th>
                        <th className="text-left py-3 px-4 font-semibold">EU</th>
                        <th className="text-left py-3 px-4 font-semibold">UK</th>
                        <th className="text-left py-3 px-4 font-semibold">Foot Length (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeCharts.shoes.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4 font-semibold">{item.us}</td>
                          <td className="py-3 px-4">{item.eu}</td>
                          <td className="py-3 px-4">{item.uk}</td>
                          <td className="py-3 px-4">{item.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shirt className="h-6 w-6 text-orange-500 mr-3" />
                  Clothing Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li>• Measure yourself while wearing the type of undergarments you'll wear with the item</li>
                  <li>• For tops, measure your chest at the fullest point</li>
                  <li>• For bottoms, measure your waist at the narrowest point</li>
                  <li>• If you're between sizes, we recommend sizing up</li>
                  <li>• Check the specific product page for any size notes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Shoe className="h-6 w-6 text-orange-500 mr-3" />
                  Shoe Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li>• Measure your feet at the end of the day when they're at their largest</li>
                  <li>• Measure both feet and use the larger measurement</li>
                  <li>• Leave a little room for toe movement</li>
                  <li>• Consider the type of socks you'll wear with the shoes</li>
                  <li>• Different brands may fit differently, so check reviews</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
