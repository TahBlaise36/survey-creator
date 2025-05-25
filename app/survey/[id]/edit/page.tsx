"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Plus, Trash2, Save, ArrowLeft, Eye } from "lucide-react"
import { supabase, type Question, type Survey } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function EditSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [currentType, setCurrentType] = useState<Question["type"]>("multiple-choice")
  const [currentOptions, setCurrentOptions] = useState<string[]>([""])
  const [isRequired, setIsRequired] = useState(false)
  const [allowAnonymous, setAllowAnonymous] = useState(true)
  const [requireEmail, setRequireEmail] = useState(false)
  const [maxResponses, setMaxResponses] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
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
      setTitle(data.title)
      setDescription(data.description || "")
      setQuestions(data.questions || [])
      setAllowAnonymous(data.allow_anonymous_responses ?? true)
      setRequireEmail(data.require_email ?? false)
      setMaxResponses(data.max_responses ? data.max_responses.toString() : "")
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

  const addOption = () => {
    setCurrentOptions([...currentOptions, ""])
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...currentOptions]
    newOptions[index] = value
    setCurrentOptions(newOptions)
  }

  const removeOption = (index: number) => {
    setCurrentOptions(currentOptions.filter((_, i) => i !== index))
  }

  const addQuestion = () => {
    if (!currentQuestion.trim()) return

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: currentType,
      question: currentQuestion,
      required: isRequired,
      ...(currentType === "multiple-choice" && {
        options: currentOptions.filter((opt) => opt.trim()),
      }),
    }

    setQuestions([...questions, newQuestion])
    setCurrentQuestion("")
    setCurrentOptions([""])
    setIsRequired(false)
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const updateSurvey = async (publish?: boolean) => {
    if (!title.trim() || questions.length === 0 || !user || !survey) return

    setIsLoading(true)

    try {
      const surveyData = {
        title,
        description,
        questions,
        settings: {
          allow_anonymous_responses: allowAnonymous,
          require_email: requireEmail,
          max_responses: maxResponses ? Number.parseInt(maxResponses) : null,
        },
        allow_anonymous_responses: allowAnonymous,
        require_email: requireEmail,
        max_responses: maxResponses ? Number.parseInt(maxResponses) : null,
        ...(publish !== undefined && { is_published: publish }),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("surveys").update(surveyData).eq("id", survey.id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Survey ${publish !== undefined ? (publish ? "published" : "unpublished") : "updated"} successfully`,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating survey:", error)
      toast({
        title: "Error",
        description: "Failed to update survey",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant={survey.is_published ? "default" : "secondary"}>
                  {survey.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Survey</h1>
              <p className="text-muted-foreground">Update your survey questions and settings</p>
            </div>

            {/* Survey Details */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Details</CardTitle>
                <CardDescription>Basic information about your survey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Survey Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter survey title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this survey is about"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Survey Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Settings</CardTitle>
                <CardDescription>Configure how responses are collected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Anonymous Responses</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow people to respond without providing their email
                    </p>
                  </div>
                  <Switch checked={allowAnonymous} onCheckedChange={setAllowAnonymous} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Address</Label>
                    <p className="text-sm text-muted-foreground">Require respondents to provide their email address</p>
                  </div>
                  <Switch checked={requireEmail} onCheckedChange={setRequireEmail} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxResponses">Maximum Responses (Optional)</Label>
                  <Input
                    id="maxResponses"
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={maxResponses}
                    onChange={(e) => setMaxResponses(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Add Question */}
            <Card>
              <CardHeader>
                <CardTitle>Add Question</CardTitle>
                <CardDescription>Create a new question for your survey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    placeholder="Enter your question"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Question Type</Label>
                  <Select value={currentType} onValueChange={(value: Question["type"]) => setCurrentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="text">Text Response</SelectItem>
                      <SelectItem value="rating">Rating Scale (1-5)</SelectItem>
                      <SelectItem value="yes-no">Yes/No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentType === "multiple-choice" && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="space-y-2">
                      {currentOptions.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                          />
                          {currentOptions.length > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addOption}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch checked={isRequired} onCheckedChange={setIsRequired} />
                  <Label>Required question</Label>
                </div>

                <Button onClick={addQuestion} disabled={!currentQuestion.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>

            {/* Questions List */}
            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Survey Questions ({questions.length})</CardTitle>
                  <CardDescription>Review and manage your questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">Q{index + 1}.</span>
                              <Badge variant="outline">{question.type}</Badge>
                              {question.required && <Badge variant="secondary">Required</Badge>}
                            </div>
                            <p className="mb-2">{question.question}</p>
                            {question.options && (
                              <ul className="text-sm text-muted-foreground ml-4">
                                {question.options.map((option, optIndex) => (
                                  <li key={optIndex}>• {option}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(question.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => updateSurvey()}
                variant="outline"
                disabled={!title.trim() || questions.length === 0 || isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              {!survey.is_published ? (
                <Button
                  onClick={() => updateSurvey(true)}
                  disabled={!title.trim() || questions.length === 0 || isLoading}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isLoading ? "Publishing..." : "Publish Survey"}
                </Button>
              ) : (
                <Button onClick={() => updateSurvey(false)} variant="outline" disabled={isLoading}>
                  {isLoading ? "Unpublishing..." : "Unpublish Survey"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
