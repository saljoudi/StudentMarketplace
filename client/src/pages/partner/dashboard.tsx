import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileHeader, MobileBottomNav } from "@/components/dashboard/mobile-nav";
import { SurveyCard } from "@/components/survey/survey-card";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileText, CheckCircle, Wallet, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function PartnerDashboard() {
  const { user } = useAuth();

  // Fetch available surveys
  const { data: availableSurveys, isLoading: isLoadingSurveys } = useQuery({
    queryKey: ["/api/partner/surveys"],
  });

  // Fetch completed surveys
  const { data: completedSurveys, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ["/api/partner/surveys/completed"],
  });

  // Fetch partner wallet
  const { data: wallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: ["/api/partner/wallet"],
  });

  const isLoading = isLoadingSurveys || isLoadingCompleted || isLoadingWallet;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 lg:pl-64 pb-16 lg:pb-0">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.fullName || user?.username}. Here's what's happening with your surveys.</p>
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
                        <p className="text-sm font-medium text-gray-500">Available Surveys</p>
                        <p className="text-2xl font-semibold text-gray-900">{availableSurveys?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Completed Surveys</p>
                        <p className="text-2xl font-semibold text-gray-900">{completedSurveys?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                        <Wallet className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Earnings</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          ${((wallet?.cashBalance || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                        <Calendar className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500">Coupons</p>
                        <p className="text-2xl font-semibold text-gray-900">{wallet?.couponsCount || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Available Surveys Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Available Surveys</h2>
                  <Link href="/partner/surveys" className="text-primary hover:text-primary/90 font-medium">
                    View all
                  </Link>
                </div>
                
                {availableSurveys && availableSurveys.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {availableSurveys.slice(0, 3).map((survey) => (
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
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys available</h3>
                      <p className="text-gray-500">Check back later for new survey opportunities</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Recent Completions */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Recently Completed</h2>
                  <Link href="/partner/completed-surveys" className="text-primary hover:text-primary/90 font-medium">
                    View all
                  </Link>
                </div>
                
                {completedSurveys && completedSurveys.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {completedSurveys.slice(0, 3).map((survey) => (
                      <Card key={survey.id} className="bg-white rounded-xl shadow overflow-hidden">
                        <CardContent className="p-5">
                          <h3 className="font-semibold mb-2">{survey.title}</h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Completed on {new Date(survey.completedAt).toLocaleDateString()}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Reward</span>
                            <span className="font-medium text-green-600">
                              ${((survey.reward || 0) / 100).toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No completed surveys yet</h3>
                      <p className="text-gray-500 mb-4">Start completing surveys to earn rewards</p>
                      <Link href="/partner/surveys">
                        <button className="text-primary hover:text-primary/90 font-medium">
                          Browse available surveys
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
}
