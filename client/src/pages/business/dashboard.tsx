import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileHeader, MobileBottomNav } from "@/components/dashboard/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Users, BarChart2, DollarSign } from "lucide-react";
import { SurveyList } from "@/components/surveys/survey-list";
import { Link, useLocation } from "wouter";

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch business surveys
  const { data: surveys, isLoading } = useQuery({
    queryKey: ["/api/business/surveys"],
  });

  // Calculate total responses
  const totalResponses = surveys?.reduce((total, survey) => total + survey.responseCount, 0) || 0;
  
  // Calculate active surveys
  const activeSurveys = surveys?.filter(survey => survey.status === "active").length || 0;
  
  // Average response rate
  const responseRate = surveys && surveys.length > 0 
    ? Math.round((totalResponses / surveys.reduce((total, survey) => total + (survey.maxResponses || 0), 0)) * 100) 
    : 0;

  const handleCreateSurvey = () => {
    navigate("/business/surveys");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 lg:pl-64 pb-16 lg:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
            <p className="text-gray-600">Monitor your survey performance and analytics</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Active Surveys</p>
                        <p className="text-2xl font-semibold text-gray-900">{activeSurveys}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Total Participants</p>
                        <p className="text-2xl font-semibold text-gray-900">{totalResponses}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                        <BarChart2 className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Response Rate</p>
                        <p className="text-2xl font-semibold text-gray-900">{responseRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                        <DollarSign className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Cost Per Response</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ${surveys && surveys.length > 0 && totalResponses > 0
                              ? (surveys.reduce((total, survey) => total + (survey.reward || 0), 0) / (totalResponses * 100)).toFixed(2)
                              : "0.00"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Survey List */}
              <SurveyList surveys={surveys || []} onCreateSurvey={handleCreateSurvey} />
            </>
          )}
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
}
