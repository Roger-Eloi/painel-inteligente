import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
  const [customQuestion, setCustomQuestion] = useState("");

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
      toast.error("Nenhum dado disponível", {
        description: "Faça upload de arquivos JSON primeiro.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Payload simplificado com JSONs como strings
      const payload = {
        DADOS: rawJsonStrings,
        PERGUNTA: customQuestion || "Gere insights gerais dos dados"
      };

      // Credenciais corretas (sem @)
      const username = "produto.rankmyapp.com.br";
      const password = "Mudar123";
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch("https://webhook.digital-ai.tech/webhook/projeto-1-lovable-painel-inteligente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        toast.error("Erro de autenticação", {
          description: "Credenciais inválidas para o webhook N8N.",
        });
        setIsLoading(false);
        return;
      }

      if (response.status === 500) {
        toast.error("Erro no servidor", {
          description: "O servidor N8N encontrou um erro. Tente novamente.",
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
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Erro ao gerar insights", {
        description: "Não foi possível conectar ao servidor N8N. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AITooltip 
        isVisible={showTooltip && !isLoading && !isModalOpen} 
        onDismiss={() => setShowTooltip(false)} 
      />
      
      {/* Barra fixa no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 max-w-6xl mx-auto">
            {/* Textarea para pergunta */}
            <Textarea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Faça uma pergunta sobre seus dados ou deixe em branco para análise geral..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            
            {/* Botão Gerar Análise */}
            <Button
              onClick={generateInsights}
              disabled={isLoading || rawJsonStrings.length === 0}
              className="bg-primary hover:bg-primary/90 px-8 py-6 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Gerar Análise
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <InsightsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        insights={insights}
        question={customQuestion}
        onRegenerate={generateInsights}
        isLoading={isLoading}
      />
    </>
  );
};
