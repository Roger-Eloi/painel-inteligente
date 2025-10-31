import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ParsedWidget } from "@/utils/jsonParser";
import { getDateRangeDescription } from "@/utils/dateHelpers";

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

  // Função para converter número de estrelas em emoji
  const getStarEmoji = (score: number): string => {
    return '⭐'.repeat(score);
  };

  // Calculate percentages
  const total = data.reduce((sum, item) => sum + (item[yField!] || 0), 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: ((item[yField!] / total) * 100).toFixed(1)
  }));

  // Custom Legend para mostrar estrelas emoji
  const renderLegend = (props: any) => {
    const { payload } = props;
    const isStarDistribution = widget.name?.toLowerCase().includes('estrela') || 
                               widget.name?.toLowerCase().includes('star') ||
                               widget.slug?.toLowerCase().includes('star');
    
    return (
      <div className="flex flex-col gap-2 justify-center h-full pl-4">
        {payload.map((entry: any, index: number) => {
          const score = entry.payload.score || entry.payload[xField!];
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              {isStarDistribution && !isNaN(Number(score)) ? (
                <span className="font-medium">{getStarEmoji(Number(score))}</span>
              ) : (
                <span className="font-medium">{score}</span>
              )}
              <span className="text-muted-foreground">
                ({entry.payload.percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Enhanced title with date range
  const dateRangeText = getDateRangeDescription(data);
  const enhancedTitle = dateRangeText 
    ? `${config?.title?.text || widget.name} - ${dateRangeText}`
    : config?.title?.text || widget.name;

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
          <PieChart>
            <Pie
              data={dataWithPercentage}
              cx="40%"
              cy="50%"
              labelLine={false}
              label={false}
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
              formatter={(value, name, props) => {
                const score = props.payload.score || props.payload[xField!];
                const isStarDistribution = widget.name?.toLowerCase().includes('estrela') || 
                                         widget.name?.toLowerCase().includes('star') ||
                                         widget.slug?.toLowerCase().includes('star');
                
                if (isStarDistribution && !isNaN(Number(score))) {
                  return [`${value}`, getStarEmoji(Number(score))];
                }
                return [`${value}`, name];
              }}
            />
            <Legend 
              content={renderLegend}
              verticalAlign="middle"
              align="right"
              layout="vertical"
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
