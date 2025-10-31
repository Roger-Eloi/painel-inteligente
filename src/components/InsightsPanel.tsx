import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface InsightsPanelProps {
  data: Array<{ name: string; data: any }>;
}

export const InsightsPanel = ({ data }: InsightsPanelProps) => {
  const [insights, setInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    if (!data || data.length === 0) {
      toast.error("Nenhum dado disponível para análise");
      return;
    }

    setIsLoading(true);
    setInsights("");

    try {
      // Prepare data for N8N
      const payload = data.map(file => ({
        filename: file.name,
        content: file.data
      }));

      // Call N8N webhook with basic auth
      const username = "produto@rankmyapp.com.br";
      const password = "Mudar123";
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch(
        "https://formulaativa.app.n8n.cloud/webhook/projeto-1-lovable-painel-inteligente",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${credentials}`
          },
          body: JSON.stringify({ files: payload })
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result = await response.text();
      setInsights(result);
      toast.success("Insights gerados com sucesso!");
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error(
        error instanceof Error 
          ? `Erro ao gerar insights: ${error.message}`
          : "Erro desconhecido ao gerar insights"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-primary p-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Insights de IA</h3>
            <p className="text-sm text-muted-foreground">Análise automática dos seus dados</p>
          </div>
        </div>
        <Button
          onClick={generateInsights}
          disabled={isLoading || data.length === 0}
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Insights
            </>
          )}
        </Button>
      </div>

      <div className="min-h-[200px]">
        {!insights && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Clique em "Gerar Insights" para obter uma análise inteligente dos seus dados
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              Analisando seus dados...
            </p>
          </div>
        )}

        {insights && !isLoading && (
          <div className="prose prose-sm max-w-none">
            <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap animate-fade-in">
              {insights}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
