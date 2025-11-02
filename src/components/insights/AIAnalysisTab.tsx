import { useState, useEffect, useRef } from "react";
import { Loader2, FileText, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { exportInsightsToPDF } from "@/utils/exportHelpers";
import { shareToWhatsApp, shareToTelegram } from "@/utils/shareHelpers";
import { preprocessDataForN8N } from "@/utils/dataPreprocessor";
import { parseJsonData } from "@/utils/jsonParser";
import WhatsAppIcon from "@/assets/whatsapp-icon.svg";
import TelegramIcon from "@/assets/telegram-icon.svg";
import LinkedInIcon from "@/assets/linkedin-icon.svg";

interface AIAnalysisTabProps {
  rawJsonStrings: string[];
}

export const AIAnalysisTab = ({ rawJsonStrings }: AIAnalysisTabProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [fullText, setFullText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const streamingIndexRef = useRef(0);

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  useEffect(() => {
    if (fullText && !isStreaming && streamingIndexRef.current === 0) {
      startStreaming();
    }
  }, [fullText]);

  const fetchAIAnalysis = async (customPrompt?: string) => {
    setIsLoading(true);
    
    try {
      // Parsear os JSONs
      const allWidgets = rawJsonStrings.flatMap(jsonStr => {
        try {
          const parsed = JSON.parse(jsonStr);
          return parseJsonData(parsed);
        } catch (error) {
          console.error("Erro ao parsear JSON:", error);
          return [];
        }
      });
      
      // Pré-processar os dados
      const preprocessedData = preprocessDataForN8N(allWidgets);
      
      console.log("📊 Dados pré-processados para N8N:", preprocessedData);
      
      const payload = {
        DADOS_PROCESSADOS: preprocessedData,
        DADOS_RAW: rawJsonStrings, // Manter raw como backup
        PROMPT_USER: customPrompt || ""
      };

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const analysisText = result.RESPOSTA || result.teste || "";
      
      if (!analysisText) {
        console.error("Resposta do N8N sem campo RESPOSTA ou teste:", result);
        throw new Error("Formato de resposta inválido do servidor");
      }
      
      setFullText(analysisText);
      setIsLoading(false);
      setHasGeneratedOnce(true);
    } catch (error) {
      console.error("Error fetching AI analysis:", error);
      toast.error("Erro ao gerar análise", {
        description: "Não foi possível conectar ao servidor. Tente novamente.",
      });
      setIsLoading(false);
      setFullText("❌ Erro ao carregar análise. Tente novamente mais tarde.");
    }
  };

  const startStreaming = () => {
    setIsStreaming(true);
    streamingIndexRef.current = 0;
    setDisplayedText("");

    const streamInterval = setInterval(() => {
      if (streamingIndexRef.current < fullText.length) {
        setDisplayedText((prev) => prev + fullText[streamingIndexRef.current]);
        streamingIndexRef.current += 1;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
      }
    }, 3);
  };

  const handleGenerateAnalysis = async () => {
    if (!userPrompt.trim()) {
      toast.error("Digite um prompt", {
        description: "Por favor, insira uma pergunta ou instrução para a IA.",
      });
      return;
    }
    
    // Reset states
    setFullText("");
    setDisplayedText("");
    streamingIndexRef.current = 0;
    
    // Fetch com prompt customizado
    await fetchAIAnalysis(userPrompt);
    
    // Limpar textarea após envio
    setUserPrompt("");
  };

  const handleExportPDF = async () => {
    await exportInsightsToPDF({
      insights: fullText,
      generatedAt: new Date().toLocaleString('pt-BR')
    });
  };

  const handleShareLinkedIn = () => {
    navigator.clipboard.writeText(fullText);
    window.open('https://www.linkedin.com/feed/', '_blank');
    toast.success("Texto copiado!", {
      description: "Cole a análise no LinkedIn",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Gerando análise com IA...</h3>
          <p className="text-sm text-muted-foreground">
            Isso pode levar alguns segundos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Análise Gerada por IA</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Compartilhar:</span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shareToWhatsApp(fullText)}
            title="Compartilhar no WhatsApp"
            className="h-9 w-9 hover:bg-[#25D366]/10"
          >
            <img src={WhatsAppIcon} alt="WhatsApp" className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shareToTelegram(fullText)}
            title="Compartilhar no Telegram"
            className="h-9 w-9 hover:bg-[#29B6F6]/10"
          >
            <img src={TelegramIcon} alt="Telegram" className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShareLinkedIn}
            title="Compartilhar no LinkedIn"
            className="h-9 w-9 hover:bg-[#0288D1]/10"
          >
            <img src={LinkedInIcon} alt="LinkedIn" className="h-6 w-6" />
          </Button>

          <div className="w-px h-6 bg-border mx-2" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <ScrollArea className="min-h-[400px] max-h-[800px] p-6">
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
              {displayedText}
            </ReactMarkdown>
            
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1" />
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Seção de Prompt Customizado - Aparece após primeira análise */}
      {hasGeneratedOnce && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Faça uma nova pergunta ou peça uma análise específica..."
              className="flex-1 min-h-[80px] resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleGenerateAnalysis();
                }
              }}
            />
            <Button 
              onClick={handleGenerateAnalysis} 
              disabled={isLoading || !userPrompt.trim()}
              className="h-[80px] px-6 whitespace-nowrap"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Análise
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Dica: Pressione Ctrl+Enter para enviar
          </p>
        </div>
      )}
    </div>
  );
};
