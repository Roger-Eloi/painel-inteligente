import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { ParsedWidget } from "@/utils/jsonParser";
import { calculateYAxisDomain } from "@/utils/chartHelpers";
import { getDateRangeDescription } from "@/utils/dateHelpers";
import { shouldFormatDateInTitle } from "@/utils/categoryMapping";

interface DynamicBarChartProps {
  widget: ParsedWidget;
}

export const DynamicBarChart = ({ widget }: DynamicBarChartProps) => {
  const { config, data, xField, yField } = widget;

  // Get color mapping
  const colorMapping = config?.color?.mapping || {};
  const defaultColor = widget.colors?.default || "#09738a";

  // Sort data if needed
  const sortedData = config?.sort
    ? [...data].sort((a, b) => {
        const field = config.sort.field;
        return config.sort.order === "asc" ? a[field] - b[field] : b[field] - a[field];
      })
    : data;

  // Calculate dynamic Y-axis domain
  const yFields = [yField].filter(Boolean) as string[];
  const [minDomain, maxDomain] = calculateYAxisDomain(sortedData, yFields);

  // Enhanced title with date range (only for Usuários and Instalações)
  const titleText = config?.title?.text || widget.name;
  const categoryName = widget.category?.name || "";
  const enhancedTitle = shouldFormatDateInTitle(categoryName)
    ? getDateRangeDescription(sortedData, titleText)
    : titleText;

  const getBarColor = (entry: any) => {
    const colorByField = config?.color?.byField;
    if (colorByField && colorMapping[entry[colorByField]]) {
      return colorMapping[entry[colorByField]];
    }
    return defaultColor;
  };

  return (
    <Card id={`widget-${widget.id}`}>
      <CardHeader>
        <CardTitle><strong>{enhancedTitle}</strong></CardTitle>
        {widget.description && (
          <CardDescription className="text-xs line-clamp-2">
            {widget.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xField}
              hide={true}
            />
            <YAxis
              hide={true}
              domain={[minDomain, maxDomain]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar
              dataKey={yField} 
              radius={[4, 4, 0, 0]}
              label={{ position: 'bottom', fill: 'hsl(var(--foreground))', fontSize: 14, fontWeight: 'bold' }}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
