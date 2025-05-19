import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { SurveyForm } from "@/components/survey/survey-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TakeSurvey() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  
  // Fetch survey details with questions
  const { data: surveyData, isLoading, error } = useQuery({
    queryKey: [`/api/surveys/${id}`],
  });
  
  // Mutation for submitting survey responses
  const submitMutation = useMutation({
    mutationFn: async (answers: { questionId: number; value: string }[]) => {
      const res = await apiRequest("POST", `/api/partner/surveys/${id}/responses`, {
        answers,
      });
      return await res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/partner/surveys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/surveys/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partner/rewards"] });
      
      toast({
        title: "Survey completed",
        description: "Thank you for completing this survey!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (answers: { questionId: number; value: string }[]) => {
    submitMutation.mutate(answers);
  };
  
  const handleBackToDashboard = () => {
    navigate("/partner/dashboard");
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !surveyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Survey</h1>
            <p className="text-gray-600 mb-6">
              {error instanceof Error ? error.message : "Unable to load the survey. It may have been removed or you don't have access."}
            </p>
            <Button onClick={() => navigate("/partner/surveys")}>
              Return to Surveys
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Completed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your participation. Your reward has been added to your wallet.
            </p>
            <Button onClick={handleBackToDashboard}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SurveyForm
        surveyId={parseInt(id)}
        surveyTitle={surveyData.survey.title}
        surveyDescription={surveyData.survey.description || ""}
        questions={surveyData.questions}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
