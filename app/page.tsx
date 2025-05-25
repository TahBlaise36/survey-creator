import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, BarChart3, Users, FileText, Share2, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Simple Survey Creator</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, share, and analyze surveys with ease. Build engaging questionnaires and gather valuable insights
            from your audience with powerful sharing and analytics features.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/sign-in">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <PlusCircle className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Easy Survey Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create surveys with multiple question types including multiple-choice, text responses, and rating
                scales.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Share2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Powerful Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate shareable links and distribute your surveys across social media platforms with built-in
                analytics.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analyze responses with real-time charts, completion rates, and detailed insights to understand your
                data.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-red-600 mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is protected with enterprise-grade security, encrypted storage, and privacy controls.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Response Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Collect unlimited responses with email collection, anonymous options, and export capabilities.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to start creating surveys?</h2>
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              <FileText className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
