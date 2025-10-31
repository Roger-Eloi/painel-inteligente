import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ParsedWidget } from "@/utils/jsonParser";
import { DynamicBarChart } from "./DynamicBarChart";
import { DynamicPieChart } from "./DynamicPieChart";

interface StarDistributionContainerProps {
  widgets: ParsedWidget[];
}

export const StarDistributionContainer = ({ widgets }: StarDistributionContainerProps) => {
  // Pegar título e descrição do primeiro widget (ambos têm os mesmos valores)
  const title = widgets[0]?.config?.title?.text || "Distribuição por Estrela";
  const description = widgets[0]?.description || "";
  
  // Separar os widgets por tipo
  const barWidget = widgets.find(w => w.kind === "bar");
  const pieWidget = widgets.find(w => w.kind === "pie");
  
  return (
    <Card className="star-distribution-container" id="star-distribution-container">
      <CardHeader>
        <CardTitle><strong>{title}</strong></CardTitle>
        {description && (
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {barWidget && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground text-center">
                Quantidade de Reviews por Nota
              </h3>
              <DynamicBarChart widget={barWidget} hideTitle />
            </div>
          )}
          
          {pieWidget && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground text-center">
                Percentual de Avaliações
              </h3>
              <DynamicPieChart widget={pieWidget} hideTitle />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
