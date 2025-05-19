import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface ResponseChartProps {
  data: {
    dates: string[];
    counts: number[];
  };
  surveyStats: {
    totalResponses: number;
    averageTimeToComplete?: number;
    completionRate?: number;
  };
}

export function ResponseChart({ data, surveyStats }: ResponseChartProps) {
  const chartData = data.dates.map((date, index) => ({
    date,
    responses: data.counts[index],
  }));

  return (
    <Card className="bg-white rounded-xl shadow h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Responses Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="responses" 
                stroke="hsl(var(--primary))" 
                activeDot={{ r: 8 }} 
                name="Responses" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Responses:</span>
            <span className="font-medium">{surveyStats.totalResponses}</span>
          </div>
          {surveyStats.averageTimeToComplete !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Average Time to Complete:</span>
              <span className="font-medium">{surveyStats.averageTimeToComplete} min</span>
            </div>
          )}
          {surveyStats.completionRate !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Completion Rate:</span>
              <span className="font-medium">{surveyStats.completionRate}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
