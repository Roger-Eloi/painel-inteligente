import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ParsedWidget } from "@/utils/jsonParser";
import { formatDate } from "@/utils/formatters";
import { calculateYAxisDomain } from "@/utils/chartHelpers";
import { getDateRangeDescription } from "@/utils/dateHelpers";
import { shouldFormatDateInTitle } from "@/utils/categoryMapping";

interface DynamicAreaChartProps {
  widget: ParsedWidget;
}

export const DynamicAreaChart = ({ widget }: DynamicAreaChartProps) => {
  const { config, data, xField, yField } = widget;
  
  const defaultColor = widget.colors?.default || "#09738a";
  
  // yAxis can be an array of field configs or undefined
  // If it's not an array, create one from yField
  let yAxisConfig = config?.yAxis || [];
  if (!Array.isArray(yAxisConfig)) {
    yAxisConfig = [];
  }
  
  // If yAxisConfig is empty but we have yField, create config from it
  if (yAxisConfig.length === 0 && yField) {
    const fields = yField.toString().split(',').map(f => f.trim());
    yAxisConfig = fields.map(field => ({
      field,
      format: config?.yAxis?.format || "0.000a",
      label: field.replace(/_/g, ' ').toUpperCase()
    }));
  }
  
  // Calculate dynamic Y-axis domain
  const yFields = yAxisConfig.map((axis: any) => axis.field);
  const [minDomain, maxDomain] = calculateYAxisDomain(data, yFields);

  // Enhanced title with date range (only for Usuários and Instalações)
  const titleText = config?.title?.text || widget.name;
  const categoryName = widget.category?.name || '';
  
  const enhancedTitle = shouldFormatDateInTitle(categoryName)
    ? getDateRangeDescription(data, titleText)
    : titleText;
  
  const isLine = config?.kind === "line";

  return (
    <Card id={`widget-${widget.id}`}>
      <CardHeader>
        <CardTitle>{enhancedTitle}</CardTitle>
        {widget.description && (
          <CardDescription className="text-xs line-clamp-2">
            {widget.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              {yAxisConfig.map((axis: any, index: number) => (
                <linearGradient key={axis.field} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={defaultColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={defaultColor} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xField}
              tickFormatter={(value) => formatDate(value, config?.xAxis?.format)}
              className="text-xs"
              angle={config?.xAxis?.rotateLabels ? -45 : 0}
              textAnchor={config?.xAxis?.rotateLabels ? "end" : "middle"}
              height={config?.xAxis?.rotateLabels ? 60 : 30}
            />
            <YAxis 
              className="text-xs" 
              domain={[minDomain, maxDomain]}
              tickFormatter={(value) => value.toLocaleString('pt-BR')}
            />
            <Tooltip 
              labelFormatter={(value) => formatDate(value, config?.tooltip?.xDateFormat)}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            {config?.legend && <Legend {...config.legend} />}
            {yAxisConfig.map((axis: any, index: number) => (
              <Area
                key={axis.field}
                type="monotone"
                dataKey={axis.field}
                stroke={defaultColor}
                fillOpacity={isLine ? 0 : 1}
                fill={`url(#gradient-${index})`}
                name={axis.label}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
