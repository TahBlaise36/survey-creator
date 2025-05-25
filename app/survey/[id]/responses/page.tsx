"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { ArrowLeft, Download, Users, Share2 } from "lucide-react"
import { supabase, type Survey, type SurveyResponse } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { SurveyCharts } from "@/components/surveys/survey-charts"

export default function SurveyResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (params.id) {
      fetchSurveyAndResponses(params.id as string)
    }
  }, [params.id])

  const fetchSurveyAndResponses = async (surveyId: string) => {
    try {
      // Fetch survey
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", surveyId)
        .single()

      if (surveyError) throw surveyError

      // Fetch responses
      const { data: responsesData, error: responsesError } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("survey_id", surveyId)
        .order("submitted_at", { ascending: false })

      if (responsesError) throw responsesError

      setSurvey(surveyData)
      setResponses(responsesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load survey data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    if (!survey || !responses.length) return

    const csvContent = [
      ["Response ID", "Submitted At", "Email", ...survey.questions.map((q) => q.question)],
      ...responses.map((response) => [
        response.id,
        new Date(response.submitted_at).toLocaleString(),
        response.respondent_email || "Anonymous",
        ...survey.questions.map((q) => response.responses[q.id] || ""),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${survey.title.replace(/[^a-z0-9]/gi, "_")}_responses.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!survey) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Survey not found</h1>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex flex-col sm:flex-row gap-2">
                {responses.length > 0 && (
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                )}
                <Button asChild>
                  <Link href={`/survey/${survey.id}/share`}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Survey
                  </Link>
                </Button>
              </div>
            </div>

            {/* Survey Info */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{survey.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline">
                  <Users className="h-4 w-4 mr-1" />
                  {responses.length} responses
                </Badge>
                <Badge variant={survey.is_published ? "default" : "secondary"}>
                  {survey.is_published ? "Published" : "Draft"}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  Created {new Date(survey.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {responses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                  <p className="text-muted-foreground mb-4">Share your survey to start collecting responses</p>
                  <Button asChild>
                    <Link href={`/survey/${survey.id}/share`}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Survey
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="analytics" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="responses">Individual Responses</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="space-y-6">
                  <SurveyCharts survey={survey} responses={responses} />
                </TabsContent>

                <TabsContent value="responses" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Responses</CardTitle>
                      <CardDescription>Individual survey submissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {responses.map((response, index) => (
                          <div key={response.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Response #{index + 1}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {response.respondent_email || "Anonymous"}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(response.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="space-y-3">
                              {survey.questions.map((question, qIndex) => (
                                <div key={question.id} className="text-sm">
                                  <p className="font-medium mb-1">
                                    Q{qIndex + 1}. {question.question}
                                  </p>
                                  <p className="text-muted-foreground pl-4">
                                    {response.responses[question.id] || "No response"}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
