import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SurveyCardProps {
  id: number;
  title: string;
  description: string;
  estimatedTime?: number;
  reward?: number;
  expiresAt?: string;
  questionCount: number;
}

export function SurveyCard({
  id,
  title,
  description,
  estimatedTime,
  reward,
  expiresAt,
  questionCount,
}: SurveyCardProps) {
  const formattedExpiryDate = expiresAt 
    ? formatDistanceToNow(new Date(expiresAt), { addSuffix: true }) 
    : null;

  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">
          {estimatedTime ? `Approx. ${estimatedTime} minutes` : "Quick survey"} 
          {reward ? ` • $${(reward / 100).toFixed(2)} reward` : ""}
        </p>
      </CardHeader>
      <CardContent className="px-5 py-3">
        {description && (
          <p className="mb-3 text-sm text-gray-600">{description}</p>
        )}
        <div className="flex items-center mb-3">
          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">
            {formattedExpiryDate ? `Expires ${formattedExpiryDate}` : "No expiration date"}
          </span>
        </div>
        <div className="flex items-center mb-3">
          <HelpCircle className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">{questionCount} questions</span>
        </div>
        <Link href={`/partner/take-survey/${id}`}>
          <Button className="w-full">Start Survey</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

interface CompletedSurveyCardProps {
  id: number;
  title: string;
  description: string;
  completedAt: string;
  reward?: number;
}

export function CompletedSurveyCard({
  id,
  title,
  description,
  completedAt,
  reward,
}: CompletedSurveyCardProps) {
  const formattedCompletedDate = formatDistanceToNow(new Date(completedAt), { addSuffix: true });

  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">
          Completed {formattedCompletedDate}
          {reward ? ` • $${(reward / 100).toFixed(2)} earned` : ""}
        </p>
      </CardHeader>
      <CardContent className="px-5 py-3">
        {description && (
          <p className="mb-3 text-sm text-gray-600">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
