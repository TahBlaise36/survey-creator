"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, BarChart3 } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/hooks/use-auth";
import { supabase, type Survey, type SurveyAnalytics } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SurveyTable } from "@/components/surveys/survey-table";
import { SurveyStats } from "@/components/surveys/survey-stats";

export default function DashboardPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  /************** Add a useState hook for storing and setting the "analytics" data(i.e It's an array of "analytics") (By Claire) **************/
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSurveys();
      /************** Call the function to analytics (By Claire) **************/
    }
  }, [user]);

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      toast({
        title: "Error",
        description: "Failed to load surveys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /************** Create an async "fetchAnalytics" arrow function for getting survey analytics (By Claire) **************/
  /*
  - Use the try and catch method and supabase endpoint for getting the survey analytics (Table name: "surveys").
  - If Cheeck if there is an error and throw the error
  - If no error, set the setAnalytics to the data if it exist or to an empty array if not and console.error the error in the catch method
  */

  /************** Create an async "deleteSurvey" arrow function to delete a survey (By Serge) **************/
  /*Task:
  - Use the try and catch method and supabase endpoint for deleting the survey (Table name: "surveys").
  - Use the toast to display success message with title: "Success" and description: "Survey deleted successfully".
  - If an error accurs, use the toast to display success message with title: "Error", description: "Failed to delete survey" and variant: "destructive".
  */

  /************** Create a "copyShareLink" arrow function to copy and share link to clipboard (By Hermine) **************/
  /*
   - The function should have a parameter "shareToken"
   - Create a variable called "shareUrl" containing the string `${window.location.origin}/s/${shareToken}`
   - Then write the shareUrl link to the clipboard using the "navigator"
   - Finally use the toast to display success message with title: "Link Copied" and description: "Share link copied to clipboard",
   */

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back
                  {user?.email ? `, ${user.email.split("@")[0]}` : ""}!
                </h1>
                <p className="text-muted-foreground">
                  Manage your surveys and analyze responses
                </p>
              </div>
              <Link href="/survey/create">
                <Button size="lg">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Survey
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <SurveyStats surveys={surveys} analytics={[]} />

            {/* Surveys Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Your Surveys
                </h2>
              </div>

              {surveys.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No surveys yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first survey to start collecting responses
                    </p>
                    <Link href="/survey/create">
                      <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Survey
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <SurveyTable
                  surveys={surveys}
                  analytics={[]}
                  /************** Pass in the "deleteSurvey" function without calling it (By Serge) **************/
                  onDelete={() => {}}
                  /************** Pass in the "copyShareLink" function without calling it (By Hermine) **************/
                  onCopyLink={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
