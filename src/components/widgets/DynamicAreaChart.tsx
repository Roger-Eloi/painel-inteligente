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
  
  // Cores predefinidas para múltiplas séries
  const defaultColors = ["#09738a", "#f97316", "#8b5cf6", "#10b981", "#ef4444"];
  const getSeriesColor = (index: number, customColor?: string) => {
    if (customColor) return customColor;
    return defaultColors[index % defaultColors.length];
  };
  
  // Detectar se é categoria Satisfação
  const isSatisfactionCategory = widget.category?.name?.toLowerCase() === 'satisfaction';
  const titleText = isSatisfactionCategory && config?.title?.text
    ? config.title.text
    : (config?.title?.text || widget.name);
  
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
  const categoryName = widget.category?.name || '';
  
  const enhancedTitle = shouldFormatDateInTitle(categoryName) && !isSatisfactionCategory
    ? getDateRangeDescription(data, titleText)
    : titleText;
  
  const isLine = config?.kind === "line";

  return (
    <Card id={`widget-${widget.id}`}>
      <CardHeader>
        <CardTitle>{titleText}</CardTitle>
        {widget.description && !isSatisfactionCategory && (
          <CardDescription className="text-xs line-clamp-2">
            {widget.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              {yAxisConfig.map((axis: any, index: number) => {
                const seriesColor = getSeriesColor(index, axis.color);
                return (
                  <linearGradient key={axis.field} id={`gradient-${widget.id}-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={seriesColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={seriesColor} stopOpacity={0}/>
                  </linearGradient>
                );
              })}
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
              domain={[
                (dataMin: number) => Math.floor(dataMin * 0.99),
                'auto'
              ]}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toLocaleString('pt-BR');
              }}
            />
            <Tooltip 
              labelFormatter={(value) => formatDate(value, config?.tooltip?.xDateFormat)}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: any, name: any, props: any) => {
                const index = yAxisConfig.findIndex((axis: any) => 
                  (axis.label || axis.field) === name
                );
                const seriesColor = getSeriesColor(index);
                return [
                  <span style={{ color: seriesColor, fontWeight: 'bold' }}>
                    {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
                  </span>,
                  name
                ];
              }}
            />
            {yAxisConfig.length > 1 && (
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value, entry: any) => {
                  const index = yAxisConfig.findIndex((axis: any) => 
                    (axis.label || axis.field) === value
                  );
                  const seriesColor = getSeriesColor(index);
                  return <span style={{ color: seriesColor }}>{value}</span>;
                }}
              />
            )}
            {yAxisConfig.map((axis: any, index: number) => {
              const seriesColor = getSeriesColor(index, axis.color);
              return (
                <Area
                  key={axis.field}
                  type="monotone"
                  dataKey={axis.field}
                  stroke={seriesColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${widget.id}-${index})`}
                  name={axis.label || axis.field}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
