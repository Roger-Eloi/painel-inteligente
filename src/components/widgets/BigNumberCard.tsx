import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";
import { ParsedWidget } from "@/utils/jsonParser";

interface BigNumberCardProps {
  widget: ParsedWidget;
}

export const BigNumberCard = ({ widget }: BigNumberCardProps) => {
  const data = widget.data[0];
  const { config } = widget;
  const increaseIsPositive = config["increase-is-positive"] === "True";

  const bigNumber = data?.big_number || 0;
  const variations = data?.variations || {};
  const format = config?.bigNumber?.format || "0";
  const suffix = config?.bigNumber?.suffix || "";
  
  // Detectar se é categoria Satisfação
  const isSatisfactionCategory = widget.category?.name?.toLowerCase() === 'satisfaction';
  const titleText = isSatisfactionCategory && config?.title?.text 
    ? config.title.text 
    : (config?.title?.text || widget.name);

  const monthVariation = variations.month;
  const yearVariation = variations.year;

  const getVariationColor = (type: string) => {
    if (!type) return "text-muted-foreground";
    if (type === "up") {
      return increaseIsPositive ? "text-success" : "text-destructive";
    }
    return increaseIsPositive ? "text-destructive" : "text-success";
  };

  const getVariationIcon = (type: string) => {
    if (!type) return null;
    return type === "up" ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  return (
    <Card className="hover-scale" id={`widget-${widget.id}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {titleText}
        </CardTitle>
        {isSatisfactionCategory && widget.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {widget.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4 flex items-baseline min-h-[2.5rem]">
          <span>{formatNumber(bigNumber, format)}</span>
          {suffix && <span className="text-xl ml-1">{suffix}</span>}
        </div>
        
        <div className="flex flex-col gap-1 text-sm">
          {monthVariation?.value !== null && monthVariation?.value !== undefined && (
            <div className={`flex items-center gap-1 ${getVariationColor(monthVariation.type)}`}>
              {getVariationIcon(monthVariation.type)}
              <span>{Math.abs(monthVariation.value)}% (mês)</span>
            </div>
          )}
          
          {yearVariation?.value !== null && yearVariation?.value !== undefined && (
            <div className={`flex items-center gap-1 ${getVariationColor(yearVariation.type)}`}>
              {getVariationIcon(yearVariation.type)}
              <span>{Math.abs(yearVariation.value)}% (ano)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
