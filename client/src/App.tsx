import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import PartnerDashboard from "@/pages/partner/dashboard";
import PartnerSurveys from "@/pages/partner/surveys";
import CompletedSurveys from "@/pages/partner/completed-surveys";
import PartnerRewards from "@/pages/partner/rewards";
import TakeSurvey from "@/pages/partner/take-survey";
import BusinessDashboard from "@/pages/business/dashboard";
import BusinessSurveys from "@/pages/business/surveys";
import SurveyResults from "@/pages/business/survey-results";

function Router() {
  return (
    <Switch>
      {/* Authentication */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Partner routes */}
      <ProtectedRoute path="/" component={PartnerDashboard} />
      <ProtectedRoute path="/partner/dashboard" component={PartnerDashboard} requiredRole="partner" />
      <ProtectedRoute path="/partner/surveys" component={PartnerSurveys} requiredRole="partner" />
      <ProtectedRoute path="/partner/completed-surveys" component={CompletedSurveys} requiredRole="partner" />
      <ProtectedRoute path="/partner/rewards" component={PartnerRewards} requiredRole="partner" />
      <ProtectedRoute path="/partner/take-survey/:id" component={TakeSurvey} requiredRole="partner" />
      
      {/* Business routes */}
      <ProtectedRoute path="/business/dashboard" component={BusinessDashboard} requiredRole="business" />
      <ProtectedRoute path="/business/surveys" component={BusinessSurveys} requiredRole="business" />
      <ProtectedRoute path="/business/survey-results/:id" component={SurveyResults} requiredRole="business" />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
