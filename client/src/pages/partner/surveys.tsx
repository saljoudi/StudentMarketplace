import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileHeader, MobileBottomNav } from "@/components/dashboard/mobile-nav";
import { SurveyCard } from "@/components/survey/survey-card";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PartnerSurveys() {
  // Fetch available surveys
  const { data: surveys, isLoading } = useQuery({
    queryKey: ["/api/partner/surveys"],
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 lg:pl-64 pb-16 lg:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Available Surveys</h1>
            <p className="text-gray-600">Browse and complete surveys to earn rewards</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {surveys && surveys.length > 0 ? (
                surveys.map((survey) => (
                  <SurveyCard
                    key={survey.id}
                    id={survey.id}
                    title={survey.title}
                    description={survey.description}
                    estimatedTime={survey.estimatedTime}
                    reward={survey.reward}
                    expiresAt={survey.expiresAt}
                    questionCount={survey.questionCount}
                  />
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys available</h3>
                    <p className="text-gray-500">Check back later for new survey opportunities</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
}
