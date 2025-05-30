"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Eye,
  Share2,
  Edit,
  Trash2,
  Copy,
  BarChart3,
} from "lucide-react";
import type { Survey } from "@/lib/supabase";

interface SurveyActionsMenuProps {
  survey: Survey;
  onDelete: (surveyId: string) => void;
  onCopyLink: (shareToken: string) => void;
}

export function SurveyActionsMenu({
  survey,
  onDelete,
  onCopyLink,
}: SurveyActionsMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /************** Function to handle the delete action (By Serge) **************/
  const handleDelete = () => {
    onDelete(survey.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {survey.is_published && survey.share_token && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href={`/s/${survey.share_token}`}
                  target="_blank"
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Survey
                </Link>
              </DropdownMenuItem>
              {/************** Call the "onCopyLink" with the value
              "survey.share_token!" in the onClick method using a callback
              function (By Hermine) **************/}
              <DropdownMenuItem onClick={() => {}}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem asChild>
            <Link
              href={`/survey/${survey.id}/responses`}
              className="flex items-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/survey/${survey.id}/share`}
              className="flex items-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/survey/${survey.id}/edit`}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Survey
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            /************** Call the "setShowDeleteDialog" with the value
              "true" in the onClick method using a callback
              function (By Serge) **************/
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Survey
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{survey.title}"? This action
              cannot be undone and will permanently delete all responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              /************** Call the handleDelete in the onClick method (By Serge) **************/
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
