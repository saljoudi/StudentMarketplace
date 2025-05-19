import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { format } from "date-fns";

interface SurveyListProps {
  surveys: Array<{
    id: number;
    title: string;
    description: string;
    status: "draft" | "active" | "completed";
    responseCount: number;
    maxResponses: number | null;
    createdAt: string;
    expiresAt: string | null;
    questionCount: number;
  }>;
  onCreateSurvey?: () => void;
}

export function SurveyList({ surveys, onCreateSurvey }: SurveyListProps) {
  const statusBadgeStyles = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
  };

  return (
    <Card className="bg-white shadow rounded-xl overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
        <h2 className="text-xl font-bold text-gray-900">Your Surveys</h2>
        {onCreateSurvey && (
          <Button onClick={onCreateSurvey} className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Survey
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Survey Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell>
                  <div className="font-medium text-gray-900">{survey.title}</div>
                  <div className="text-sm text-gray-500">{survey.questionCount} questions</div>
                </TableCell>
                <TableCell>
                  <Badge className={statusBadgeStyles[survey.status]}>
                    {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {survey.responseCount} {survey.maxResponses ? `/ ${survey.maxResponses}` : ''}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {format(new Date(survey.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {survey.expiresAt 
                    ? format(new Date(survey.expiresAt), 'MMM d, yyyy')
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  <Link href={`/business/survey-results/${survey.id}`} className="text-primary-600 hover:text-primary-900">
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}

            {surveys.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <p className="text-gray-500">No surveys yet</p>
                  {onCreateSurvey && (
                    <Button 
                      onClick={onCreateSurvey} 
                      variant="link" 
                      className="mt-2"
                    >
                      Create your first survey
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
