import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { InsightsModal } from "./InsightsModal";
import { AITooltip } from "./AITooltip";

interface FloatingInsightsButtonProps {
  rawJsonStrings: string[];
}

export const FloatingInsightsButton = ({ rawJsonStrings }: FloatingInsightsButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const { toast } = useToast();

  // Timer para esconder o tooltip após 15 segundos
  useEffect(() => {
    if (rawJsonStrings.length > 0 && showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 15000); // 15 segundos

      return () => clearTimeout(timer);
    }
  }, [rawJsonStrings.length, showTooltip]);

  const generateInsights = async () => {
    if (!rawJsonStrings || rawJsonStrings.length === 0) {
      toast({
        title: "Nenhum dado disponível",
        description: "Faça upload de arquivos JSON primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Payload simplificado com JSONs como strings
      const payload = {
        DADOS: rawJsonStrings,
      };

      // Credenciais corretas (sem @)
      const username = "produto.rankmyapp.com.br";
      const password = "Mudar123";
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch(
        "https://formulaativa.app.n8n.cloud/webhook/projeto-1-lovable-painel-inteligente",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 403) {
        toast({
          title: "Erro de autenticação",
          description: "Credenciais inválidas para o webhook N8N.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (response.status === 500) {
        toast({
          title: "Erro no servidor",
          description: "O servidor N8N encontrou um erro. Tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      setInsights(result);
      setIsModalOpen(true);
      
      toast({
        title: "Insights gerados!",
        description: "Os insights de IA foram gerados com sucesso.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Erro ao gerar insights",
        description: "Não foi possível conectar ao servidor N8N. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Tooltip animado */}
      <AITooltip 
        isVisible={showTooltip && !isLoading && !isModalOpen} 
        onDismiss={() => setShowTooltip(false)} 
      />

      <Button
        onClick={generateInsights}
        disabled={isLoading}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full p-0 shadow-2xl bg-gradient-primary hover:bg-gradient-primary hover:scale-110 transition-all duration-300"
        title="Gerar Insights de IA"
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        ) : (
          <Sparkles className="h-6 w-6 text-white animate-pulse" />
        )}
      </Button>

      <InsightsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        insights={insights}
        onRegenerate={generateInsights}
        isLoading={isLoading}
      />
    </>
  );
};
