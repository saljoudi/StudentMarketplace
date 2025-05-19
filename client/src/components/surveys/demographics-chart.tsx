import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface DemographicData {
  name: string;
  value: number;
}

interface DemographicsChartProps {
  ageData: DemographicData[];
  genderData: DemographicData[];
  locationData?: DemographicData[];
}

export function DemographicsChart({ ageData, genderData, locationData }: DemographicsChartProps) {
  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-white rounded-xl shadow h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Respondent Demographics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[300px] w-full">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div>
              <h3 className="text-sm font-medium text-center mb-2">Age Distribution</h3>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-sm font-medium text-center mb-2">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <h4 className="font-medium text-sm text-gray-500 mb-2">Age Groups</h4>
            <div className="space-y-2">
              {ageData.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border rounded-lg p-3">
            <h4 className="font-medium text-sm text-gray-500 mb-2">Gender</h4>
            <div className="space-y-2">
              {genderData.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
