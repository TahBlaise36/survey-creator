"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Eye, TrendingUp } from "lucide-react"
import type { Survey, SurveyAnalytics } from "@/lib/supabase"

interface SurveyStatsProps {
  surveys: Survey[]
  analytics: SurveyAnalytics[]
}

export function SurveyStats({ surveys, analytics }: SurveyStatsProps) {
  const totalResponses = analytics.reduce((acc, survey) => acc + (survey.total_responses || 0), 0)
  const publishedSurveys = surveys.filter((s) => s.is_published).length
  const responsesLast7Days = analytics.reduce((acc, survey) => acc + (survey.responses_last_7_days || 0), 0)
  const avgResponsesPerSurvey = surveys.length > 0 ? Math.round(totalResponses / surveys.length) : 0

  const stats = [
    {
      title: "Total Surveys",
      value: surveys.length,
      icon: BarChart3,
      description: `${publishedSurveys} published`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Responses",
      value: totalResponses,
      icon: Users,
      description: `${responsesLast7Days} this week`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Published Surveys",
      value: publishedSurveys,
      icon: Eye,
      description: `${surveys.length - publishedSurveys} drafts`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Avg. Responses",
      value: avgResponsesPerSurvey,
      icon: TrendingUp,
      description: "per survey",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-md ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
