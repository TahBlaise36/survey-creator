"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import type { Survey, SurveyResponse } from "@/lib/supabase"

interface SurveyChartsProps {
  survey: Survey
  responses: SurveyResponse[]
}

export function SurveyCharts({ survey, responses }: SurveyChartsProps) {
  const getQuestionAnalysis = (question: any) => {
    if (!responses.length) return null

    const questionResponses = responses
      .map((r) => r.responses[question.id])
      .filter((r) => r !== undefined && r !== null && r !== "")

    if (questionResponses.length === 0) return null

    switch (question.type) {
      case "multiple-choice":
        const counts = questionResponses.reduce(
          (acc, response) => {
            acc[response] = (acc[response] || 0) + 1
            return acc
          },
          {} as { [key: string]: number },
        )

        return {
          type: "multiple-choice",
          total: questionResponses.length,
          data: Object.entries(counts).map(([option, count]) => ({
            option,
            count,
            percentage: Math.round((count / questionResponses.length) * 100),
          })),
        }

      case "rating":
        const ratings = questionResponses.map((r) => Number.parseInt(r)).filter((r) => !isNaN(r))
        const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        const ratingCounts = ratings.reduce(
          (acc, rating) => {
            acc[rating] = (acc[rating] || 0) + 1
            return acc
          },
          {} as { [key: number]: number },
        )

        return {
          type: "rating",
          total: ratings.length,
          average: Math.round(average * 10) / 10,
          data: [1, 2, 3, 4, 5].map((rating) => ({
            rating: `${rating} Star`,
            value: rating,
            count: ratingCounts[rating] || 0,
            percentage: Math.round(((ratingCounts[rating] || 0) / ratings.length) * 100),
          })),
        }

      case "yes-no":
        const yesCount = questionResponses.filter((r) => r.toLowerCase() === "yes").length
        const noCount = questionResponses.filter((r) => r.toLowerCase() === "no").length

        return {
          type: "yes-no",
          total: questionResponses.length,
          data: [
            { option: "Yes", count: yesCount, percentage: Math.round((yesCount / questionResponses.length) * 100) },
            { option: "No", count: noCount, percentage: Math.round((noCount / questionResponses.length) * 100) },
          ],
        }

      default:
        return null
    }
  }

  const getResponsesOverTime = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split("T")[0],
        responses: 0,
      }
    })

    responses.forEach((response) => {
      const responseDate = new Date(response.submitted_at).toISOString().split("T")[0]
      const dayData = last30Days.find((day) => day.date === responseDate)
      if (dayData) {
        dayData.responses++
      }
    })

    return last30Days.map((day) => ({
      ...day,
      date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
  }

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="space-y-6">
      {/* Response Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Response Timeline</CardTitle>
          <CardDescription>Responses over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              responses: {
                label: "Responses",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[200px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getResponsesOverTime()}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="responses"
                  stroke="var(--color-responses)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-responses)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Question Analysis */}
      {survey.questions.map((question, index) => {
        const analysis = getQuestionAnalysis(question)
        if (!analysis) return null

        return (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-base">
                Q{index + 1}. {question.question}
              </CardTitle>
              <CardDescription>
                {analysis.total} response{analysis.total !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.type === "multiple-choice" && (
                <div className="space-y-4">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Responses",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.data} layout="horizontal">
                        <XAxis type="number" />
                        <YAxis dataKey="option" type="category" width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}

              {analysis.type === "rating" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{analysis.average}</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Responses",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[200px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.data}>
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}

              {analysis.type === "yes-no" && (
                <div className="space-y-4">
                  <ChartContainer
                    config={{
                      yes: {
                        label: "Yes",
                        color: "hsl(var(--chart-3))",
                      },
                      no: {
                        label: "No",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analysis.data}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ option, percentage }) => `${option}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analysis.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
