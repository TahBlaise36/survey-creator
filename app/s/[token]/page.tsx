"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle, AlertCircle } from "lucide-react"
import { supabase, type Survey } from "@/lib/supabase"

export default function PublicSurveyPage() {
  const params = useParams()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [responses, setResponses] = useState<{ [key: string]: any }>({})
  const [respondentEmail, setRespondentEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.token) {
      fetchSurvey(params.token as string)
    }
  }, [params.token])

  const fetchSurvey = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("share_token", token)
        .eq("is_published", true)
        .single()

      if (error) throw error

      // Check if survey has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This survey has expired and is no longer accepting responses.")
        return
      }

      // Check if max responses reached
      if (data.max_responses) {
        const { count } = await supabase
          .from("survey_responses")
          .select("*", { count: "exact", head: true })
          .eq("survey_id", data.id)

        if (count && count >= data.max_responses) {
          setError("This survey has reached its maximum number of responses.")
          return
        }
      }

      setSurvey(data)
    } catch (error) {
      console.error("Error fetching survey:", error)
      setError("Survey not found or no longer available.")
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
      setError("Please answer all required questions.")
      return
    }

    if (survey.require_email && !respondentEmail.trim()) {
      setError("Email address is required for this survey.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const responseData = {
        survey_id: survey.id,
        responses,
        respondent_email: respondentEmail || null,
        ip_address: null, // Would need server-side implementation for real IP
        user_agent: navigator.userAgent,
      }

      const { error } = await supabase.from("survey_responses").insert([responseData])

      if (error) throw error

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting response:", error)
      setError("Failed to submit response. Please try again.")
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
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">
                Q{index + 1}. {question.question}
              </Label>
              {question.required && <Badge variant="secondary">Required</Badge>}
            </div>
            <RadioGroup
              value={responses[questionId] || ""}
              onValueChange={(value) => handleResponseChange(questionId, value)}
            >
              {question.options?.map((option: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${questionId}-${optIndex}`} />
                  <Label htmlFor={`${questionId}-${optIndex}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "text":
        return (
          <div key={questionId} className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor={questionId} className="text-base font-medium">
                Q{index + 1}. {question.question}
              </Label>
              {question.required && <Badge variant="secondary">Required</Badge>}
            </div>
            <Textarea
              id={questionId}
              placeholder="Enter your response..."
              value={responses[questionId] || ""}
              onChange={(e) => handleResponseChange(questionId, e.target.value)}
            />
          </div>
        )

      case "rating":
        return (
          <div key={questionId} className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">
                Q{index + 1}. {question.question}
              </Label>
              {question.required && <Badge variant="secondary">Required</Badge>}
            </div>
            <RadioGroup
              value={responses[questionId] || ""}
              onValueChange={(value) => handleResponseChange(questionId, value)}
            >
              <div className="flex gap-4">
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
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">
                Q{index + 1}. {question.question}
              </Label>
              {question.required && <Badge variant="secondary">Required</Badge>}
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Survey Unavailable</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your response has been submitted successfully.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Survey Not Found</h3>
            <p className="text-gray-600">The survey you're looking for doesn't exist or is no longer available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{survey.title}</CardTitle>
              {survey.description && <CardDescription className="text-base">{survey.description}</CardDescription>}
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

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="pt-6 border-t">
                <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
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
  )
}
