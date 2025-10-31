import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ParsedWidget } from "@/utils/jsonParser";

interface DynamicPieChartProps {
  widget: ParsedWidget;
}

export const DynamicPieChart = ({ widget }: DynamicPieChartProps) => {
  const { config, data, xField, yField } = widget;
  
  const colorMapping = config?.color?.mapping || {};
  const defaultColor = widget.colors?.default || "#09738a";
  const isDonut = config?.kind === "donut";

  const getColor = (entry: any) => {
    const colorByField = config?.color?.byField;
    if (colorByField && colorMapping[entry[colorByField]]) {
      return colorMapping[entry[colorByField]];
    }
    return defaultColor;
  };

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + (item[yField!] || 0), 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: ((item[yField!] / total) * 100).toFixed(1)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config?.title?.text || widget.name}</CardTitle>
        {widget.description && (
          <CardDescription className="text-xs line-clamp-2">
            {widget.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataWithPercentage}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry[xField!]}: ${entry.percentage}%`}
              outerRadius={80}
              innerRadius={isDonut ? 40 : 0}
              fill="#8884d8"
              dataKey={yField}
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry)} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
