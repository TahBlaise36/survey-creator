"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { ArrowLeft, Send, CheckCircle } from "lucide-react"
import { supabase, type Survey } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function SurveyPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [responses, setResponses] = useState<{ [key: string]: any }>({})
  const [respondentEmail, setRespondentEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
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

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!survey) return

    // Validate required fields
    const missingRequired = survey.questions.filter(
      (q) => q.required && (!responses[q.id] || responses[q.id].toString().trim() === ""),
    )

    if (missingRequired.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please answer all required questions.",
        variant: "destructive",
      })
      return
    }

    if (survey.require_email && !respondentEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Email address is required for this survey.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const responseData = {
        survey_id: survey.id,
        responses,
        respondent_email: respondentEmail || null,
        ip_address: null,
        user_agent: navigator.userAgent,
      }

      const { error } = await supabase.from("survey_responses").insert([responseData])

      if (error) throw error

      setIsSubmitted(true)
      toast({
        title: "Success",
        description: "Your response has been submitted successfully!",
      })
    } catch (error) {
      console.error("Error submitting response:", error)
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: any, index: number) => {
    const questionId = question.id

    switch (question.type) {
      case "multiple-choice":
        return (
          <div key={questionId} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label className="text-base font-medium">
                Q{index + 1}. {question.question}
              </Label>
              {question.required && (
                <Badge variant="secondary" className="w-fit">
                  Required
                </Badge>
              )}
            </div>
            <RadioGroup
              value={responses[questionId] || ""}
              onValueChange={(value) => handleResponseChange(questionId, value)}
            >
              {question.options?.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${questionId}-${optIndex}`} />
                  <Label htmlFor={`${questionId}-${optIndex}`} className="text-sm sm:text-base break-words">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "text":
        return (
          <div key={questionId} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label htmlFor={questionId} className="text-base font-medium">
                Q{index + 1}. {question.question}
              </Label>
              {question.required && (
                <Badge variant="secondary" className="w-fit">
                  Required
                </Badge>
              )}
            </div>
            <Textarea
              id={questionId}
              placeholder="Enter your response..."
              value={responses[questionId] || ""}
              onChange={(e) => handleResponseChange(questionId, e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        )

      case "rating":
        return (
          <div key={questionId} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label className="text-base font-medium">
                Q{index + 1}. {question.question}
              </Label>
              {question.required && (
                <Badge variant="secondary" className="w-fit">
                  Required
                </Badge>
              )}
            </div>
            <RadioGroup
              value={responses[questionId] || ""}
              onValueChange={(value) => handleResponseChange(questionId, value)}
            >
              <div className="flex flex-wrap gap-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.toString()} id={`${questionId}-${rating}`} />
                    <Label htmlFor={`${questionId}-${rating}`}>{rating}</Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </RadioGroup>
          </div>
        )

      case "yes-no":
        return (
          <div key={questionId} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label className="text-base font-medium">
                Q{index + 1}. {question.question}
              </Label>
              {question.required && (
                <Badge variant="secondary" className="w-fit">
                  Required
                </Badge>
              )}
            </div>
            <RadioGroup
              value={responses[questionId] || ""}
              onValueChange={(value) => handleResponseChange(questionId, value)}
            >
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`${questionId}-yes`} />
                  <Label htmlFor={`${questionId}-yes`}>Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`${questionId}-no`} />
                  <Label htmlFor={`${questionId}-no`}>No</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        )

      default:
        return null
    }
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

  if (isSubmitted) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-4">Your response has been submitted successfully.</p>
              <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    )
  }

  const isFormValid =
    survey.questions.every((question) => {
      if (!question.required) return true
      const response = responses[question.id]
      return response && response.toString().trim() !== ""
    }) &&
    (!survey.require_email || respondentEmail.trim())

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">{survey.title}</CardTitle>
                {survey.description && <CardDescription className="text-base">{survey.description}</CardDescription>}
                <Badge variant="outline" className="w-fit">
                  Preview Mode
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                {survey.require_email && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      Email Address <Badge variant="secondary">Required</Badge>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={respondentEmail}
                      onChange={(e) => setRespondentEmail(e.target.value)}
                    />
                  </div>
                )}

                {survey.questions.map((question, index) => renderQuestion(question, index))}

                <div className="pt-6 border-t">
                  <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="w-full" size="lg">
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Response
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
