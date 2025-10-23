"use client";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, Briefcase, Award, Heart } from "lucide-react";

export default function CareersPage() {
  const jobOpenings = [
    {
      title: "Frontend Developer",
      department: "Engineering",
      location: "Baku, Azerbaijan",
      type: "Full-time",
      description: "We're looking for a talented Frontend Developer to join our team."
    },
    {
      title: "Backend Developer",
      department: "Engineering", 
      location: "Baku, Azerbaijan",
      type: "Full-time",
      description: "Join our backend team to build scalable and reliable systems."
    },
    {
      title: "UX Designer",
      department: "Design",
      location: "Baku, Azerbaijan", 
      type: "Full-time",
      description: "Help us create amazing user experiences for our customers."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">
                Build the future of e-commerce with us. We're always looking for talented individuals to join our growing team.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Why Work With Us */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Work With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Great Team</h3>
                  <p className="text-gray-600">
                    Work with talented and passionate people who love what they do.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Growth Opportunities</h3>
                  <p className="text-gray-600">
                    Advance your career with learning opportunities and mentorship.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Work-Life Balance</h3>
                  <p className="text-gray-600">
                    Flexible working hours and remote work options available.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Job Openings */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
            <div className="space-y-6">
              {jobOpenings.map((job, index) => (
                <Card key={index} className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.department}
                          </span>
                          <span>{job.location}</span>
                          <span>{job.type}</span>
                        </div>
                        <p className="text-gray-700">{job.description}</p>
                      </div>
                      <div className="md:ml-4">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-12">Benefits & Perks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">Competitive Salary</div>
                <div className="text-gray-600">Market-competitive compensation packages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">Health Insurance</div>
                <div className="text-gray-600">Comprehensive health coverage for you and your family</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">Learning Budget</div>
                <div className="text-gray-600">Annual budget for courses, conferences, and books</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">Flexible Hours</div>
                <div className="text-gray-600">Work when you're most productive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">Remote Work</div>
                <div className="text-gray-600">Work from anywhere in the world</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">Team Events</div>
                <div className="text-gray-600">Regular team building and social events</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold mb-8">Don't See Your Role?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
              Send Your Resume
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
