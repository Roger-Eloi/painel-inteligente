import { useState, useEffect } from "react";
import { Loader2, FileText, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { exportInsightsToPDF } from "@/utils/exportHelpers";
import { shareToWhatsApp, shareToTelegram } from "@/utils/shareHelpers";
import { aiAnalysisManager } from "@/utils/aiAnalysisManager";
import { AIChatInterface } from "./AIChatInterface";
import WhatsAppIcon from "@/assets/whatsapp-icon.svg";
import TelegramIcon from "@/assets/telegram-icon.svg";
import LinkedInIcon from "@/assets/linkedin-icon.svg";

interface AIAnalysisTabProps {
  rawJsonStrings: string[];
}

export const AIAnalysisTab = ({ rawJsonStrings }: AIAnalysisTabProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialAnalysis, setInitialAnalysis] = useState("");

  useEffect(() => {
    // Verificar se já tem análise
    if (aiAnalysisManager.hasInitialAnalysis()) {
      const history = aiAnalysisManager.getConversationHistory();
      const firstMessage = history.find(m => m.role === 'assistant');
      if (firstMessage) {
        setInitialAnalysis(firstMessage.content);
        setIsLoading(false);
        return;
      }
    }
    
    // Se está carregando, aguardar
    if (aiAnalysisManager.isLoading()) {
      aiAnalysisManager.fetchInitialAnalysis(rawJsonStrings)
        .then(analysis => {
          setInitialAnalysis(analysis);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error:", error);
          toast.error("Erro ao gerar análise");
          setIsLoading(false);
        });
      return;
    }
    
    // Primeira vez: fazer análise inicial
    fetchInitialAnalysis();
  }, []);

  const fetchInitialAnalysis = async () => {
    setIsLoading(true);
    
    try {
      const analysis = await aiAnalysisManager.fetchInitialAnalysis(rawJsonStrings);
      setInitialAnalysis(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      toast.error("Erro ao gerar análise", {
        description: "Não foi possível conectar ao servidor."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    const allMessages = aiAnalysisManager.getConversationHistory();
    const fullText = allMessages.map(m => 
      `${m.role === 'user' ? '👤 Você' : '🤖 IA'}: ${m.content}`
    ).join('\n\n---\n\n');
    
    await exportInsightsToPDF({
      insights: fullText,
      generatedAt: new Date().toLocaleString('pt-BR')
    });
  };

  const handleShareLinkedIn = () => {
    navigator.clipboard.writeText(initialAnalysis);
    window.open('https://www.linkedin.com/feed/', '_blank');
    toast.success("Análise copiada!", {
      description: "Cole no LinkedIn"
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Gerando análise inicial...</h3>
          <p className="text-sm text-muted-foreground">
            Analisando seus dados. Isso pode levar alguns segundos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Análise Inicial */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Análise Inicial</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Compartilhar:</span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shareToWhatsApp(initialAnalysis)}
              title="WhatsApp"
            >
              <img src={WhatsAppIcon} alt="WhatsApp" className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shareToTelegram(initialAnalysis)}
              title="Telegram"
            >
              <img src={TelegramIcon} alt="Telegram" className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShareLinkedIn}
              title="LinkedIn"
            >
              <img src={LinkedInIcon} alt="LinkedIn" className="h-6 w-6" />
            </Button>

            <div className="w-px h-6 bg-border mx-2" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
            >
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <ScrollArea className="max-h-[400px] p-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-3xl font-bold mb-4 text-primary" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-semibold mb-3 text-primary" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-semibold mb-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-4 leading-relaxed" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="leading-relaxed" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-foreground" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) => (
                    inline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props} />
                    ) : (
                      <code className="block bg-muted p-4 rounded-lg overflow-x-auto" {...props} />
                    )
                  ),
                }}
              >
                {initialAnalysis}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Interface de Chat */}
      <AIChatInterface />
    </div>
  );
};
