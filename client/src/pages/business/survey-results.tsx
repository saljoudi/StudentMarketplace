import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileHeader, MobileBottomNav } from "@/components/dashboard/mobile-nav";
import { ResponseChart } from "@/components/surveys/response-chart";
import { DemographicsChart } from "@/components/surveys/demographics-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SurveyResults() {
  const { id } = useParams();
  const { toast } = useToast();

  // Fetch survey details
  const { data: survey, isLoading: isLoadingSurvey } = useQuery({
    queryKey: [`/api/business/surveys/${id}`],
  });

  // Fetch response counts for chart
  const { data: responseCounts, isLoading: isLoadingCounts } = useQuery({
    queryKey: [`/api/business/surveys/${id}/results/counts`],
  });

  // Fetch demographics data
  const { data: demographics, isLoading: isLoadingDemographics } = useQuery({
    queryKey: [`/api/business/surveys/${id}/results/demographics`],
  });

  const isLoading = isLoadingSurvey || isLoadingCounts || isLoadingDemographics;

  // Handle export CSV
  const handleExportCSV = () => {
    window.location.href = `/api/business/surveys/${id}/results/export`;
    
    toast({
      title: "Export started",
      description: "Your survey results are being downloaded as a CSV file",
    });
  };

  // Handle share results
  const handleShareResults = () => {
    toast({
      title: "Share feature",
      description: "Result sharing functionality will be available in a future update",
    });
  };

  // Process demographics data for charts
  const processAgeData = () => {
    if (!demographics || !demographics.age) return [];
    
    return demographics.age.map((item: any) => ({
      name: item.age_group,
      value: parseInt(item.count),
    }));
  };

  const processGenderData = () => {
    if (!demographics || !demographics.gender) return [];
    
    return demographics.gender.map((item: any) => ({
      name: item.gender,
      value: parseInt(item.count),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 lg:pl-64 pb-16 lg:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{survey?.title}</h1>
                  <p className="text-sm text-gray-500">Results from your survey</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                  <Button 
                    className="inline-flex items-center" 
                    onClick={handleExportCSV}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    className="inline-flex items-center" 
                    onClick={handleShareResults}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Share Results
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Responses Over Time Chart */}
                {responseCounts && (
                  <ResponseChart 
                    data={responseCounts} 
                    surveyStats={{
                      totalResponses: survey?.responseCount || 0,
                      completionRate: 92,
                    }}
                  />
                )}
                
                {/* Demographics Chart */}
                {demographics && (
                  <DemographicsChart 
                    ageData={processAgeData()}
                    genderData={processGenderData()}
                  />
                )}
              </div>
              
              {/* Question Summary */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Question Summary</h2>
                  
                  <div className="overflow-hidden overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Question
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Responses
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {survey?.questions?.map((question: any) => (
                          <tr key={question.id}>
                            <td className="px-6 py-4 whitespace-normal">
                              <div className="text-sm font-medium text-gray-900">{question.text}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {question.type === 'multiple_choice' 
                                  ? 'Multiple Choice' 
                                  : question.type === 'text' 
                                    ? 'Text' 
                                    : 'Rating'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{survey.responseCount}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Survey Information */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Survey Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Survey Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Created</span>
                          <span className="text-sm font-medium">{new Date(survey?.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Status</span>
                          <span className="text-sm font-medium capitalize">{survey?.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Questions</span>
                          <span className="text-sm font-medium">{survey?.questions?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Reward Amount</span>
                          <span className="text-sm font-medium">${((survey?.reward || 0) / 100).toFixed(2)}</span>
                        </div>
                        {survey?.expiresAt && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Expiration</span>
                            <span className="text-sm font-medium">{new Date(survey.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Response Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Responses</span>
                          <span className="text-sm font-medium">{survey?.responseCount || 0}</span>
                        </div>
                        {survey?.maxResponses && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Target Responses</span>
                            <span className="text-sm font-medium">{survey.maxResponses}</span>
                          </div>
                        )}
                        {survey?.responseCount > 0 && survey?.maxResponses && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Completion</span>
                            <span className="text-sm font-medium">
                              {Math.round((survey.responseCount / survey.maxResponses) * 100)}%
                            </span>
                          </div>
                        )}
                        {survey?.estimatedTime && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Estimated Time</span>
                            <span className="text-sm font-medium">{survey.estimatedTime} minutes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
}
