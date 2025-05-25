"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { ArrowLeft, Copy, Facebook, Twitter, Linkedin, Mail, ExternalLink } from "lucide-react"
import { supabase, type Survey } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function ShareSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (params.id) {
      fetchSurvey(params.id as string)
    }
  }, [params.id])

  const fetchSurvey = async (surveyId: string) => {
    try {
      const { data, error } = await supabase.from("surveys").select("*").eq("id", surveyId).single()

      if (error) throw error
      setSurvey(data)
    } catch (error) {
      console.error("Error fetching survey:", error)
      toast({
        title: "Error",
        description: "Failed to load survey",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSurveySettings = async (updates: Partial<Survey>) => {
    if (!survey) return

    setUpdating(true)
    try {
      const { data, error } = await supabase.from("surveys").update(updates).eq("id", survey.id).select().single()

      if (error) throw error

      setSurvey(data)
      toast({
        title: "Success",
        description: "Survey settings updated",
      })
    } catch (error) {
      console.error("Error updating survey:", error)
      toast({
        title: "Error",
        description: "Failed to update survey settings",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    })
  }

  const shareUrl = survey?.share_token ? `${window.location.origin}/s/${survey.share_token}` : ""

  const socialShareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this survey: ${survey?.title || "Survey"}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(`Survey: ${survey?.title || "Survey"}`)}&body=${encodeURIComponent(`Please take a moment to complete this survey: ${shareUrl}`)}`,
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!survey) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Survey not found</h1>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Survey</h1>
              <p className="text-gray-600">Configure sharing settings and distribute your survey</p>
            </div>

            {/* Survey Status */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {survey.title}
                  <Badge variant={survey.is_published ? "default" : "secondary"}>
                    {survey.is_published ? "Published" : "Draft"}
                  </Badge>
                </CardTitle>
                <CardDescription>{survey.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {!survey.is_published && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      This survey is currently a draft. You need to publish it before it can be shared.
                    </p>
                    <Button
                      className="mt-2"
                      onClick={() => updateSurveySettings({ is_published: true })}
                      disabled={updating}
                    >
                      Publish Survey
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {survey.is_published && (
              <>
                {/* Share Link */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Share Link</CardTitle>
                    <CardDescription>Copy this link to share your survey</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input value={shareUrl} readOnly className="flex-1" />
                      <Button onClick={() => copyToClipboard(shareUrl)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Preview
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Sharing */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Social Media Sharing</CardTitle>
                    <CardDescription>Share your survey on social media platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" asChild>
                        <a href={socialShareUrls.facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={socialShareUrls.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={socialShareUrls.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={socialShareUrls.email}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Survey Settings */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Response Settings</CardTitle>
                    <CardDescription>Configure how responses are collected</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Allow Anonymous Responses</Label>
                        <p className="text-sm text-gray-600">Allow people to respond without providing their email</p>
                      </div>
                      <Switch
                        checked={survey.allow_anonymous_responses}
                        onCheckedChange={(checked) => updateSurveySettings({ allow_anonymous_responses: checked })}
                        disabled={updating}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require Email Address</Label>
                        <p className="text-sm text-gray-600">Require respondents to provide their email address</p>
                      </div>
                      <Switch
                        checked={survey.require_email}
                        onCheckedChange={(checked) => updateSurveySettings({ require_email: checked })}
                        disabled={updating}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxResponses">Maximum Responses</Label>
                      <div className="flex gap-2">
                        <Input
                          id="maxResponses"
                          type="number"
                          placeholder="Leave empty for unlimited"
                          value={survey.max_responses || ""}
                          onChange={(e) => {
                            const value = e.target.value
                            updateSurveySettings({
                              max_responses: value ? Number.parseInt(value) : null,
                            })
                          }}
                          disabled={updating}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Set a limit on the number of responses this survey can receive
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
