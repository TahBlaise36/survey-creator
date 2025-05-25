"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { SurveyActionsMenu } from "@/components/survey-actions-menu"
import type { Survey, SurveyAnalytics } from "@/lib/supabase"

interface SurveyWithAnalytics extends Survey {
  analytics?: SurveyAnalytics
}

interface SurveyTableProps {
  surveys: Survey[]
  analytics: SurveyAnalytics[]
  onDelete: (surveyId: string) => void
  onCopyLink: (shareToken: string) => void
}

export function SurveyTable({ surveys, analytics, onDelete, onCopyLink }: SurveyTableProps) {
  const surveysWithAnalytics: SurveyWithAnalytics[] = surveys.map((survey) => ({
    ...survey,
    analytics: analytics.find((a) => a.id === survey.id),
  }))

  const columns: ColumnDef<SurveyWithAnalytics>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Survey
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const survey = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium text-foreground">{survey.title}</div>
            {survey.description && (
              <div className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">{survey.description}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "is_published",
      header: "Status",
      cell: ({ row }) => {
        const isPublished = row.getValue("is_published") as boolean
        return <Badge variant={isPublished ? "default" : "secondary"}>{isPublished ? "Published" : "Draft"}</Badge>
      },
    },
    {
      accessorKey: "questions",
      header: "Questions",
      cell: ({ row }) => {
        const questions = row.getValue("questions") as any[]
        return (
          <div className="text-center">
            <span className="font-medium">{questions?.length || 0}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "analytics",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Responses
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const analytics = row.original.analytics
        return (
          <div className="text-center">
            <span className="font-medium">{analytics?.total_responses || 0}</span>
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        const aResponses = rowA.original.analytics?.total_responses || 0
        const bResponses = rowB.original.analytics?.total_responses || 0
        return aResponses - bResponses
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-medium"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const survey = row.original
        return <SurveyActionsMenu survey={survey} onDelete={onDelete} onCopyLink={onCopyLink} />
      },
    },
  ]

  return (
    <DataTable columns={columns} data={surveysWithAnalytics} searchKey="title" searchPlaceholder="Search surveys..." />
  )
}
