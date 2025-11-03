import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles, Send, ArrowDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { exportInsightsToPDF } from "@/utils/exportHelpers";
import { shareToWhatsApp, shareToTelegram } from "@/utils/shareHelpers";
import { aiAnalysisManager } from "@/utils/aiAnalysisManager";
import WhatsAppIcon from "@/assets/whatsapp-icon.svg";
import TelegramIcon from "@/assets/telegram-icon.svg";
import LinkedInIcon from "@/assets/linkedin-icon.svg";

interface AIAnalysisTabProps {
  rawJsonStrings: string[];
}

export const AIAnalysisTab = ({ rawJsonStrings }: AIAnalysisTabProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialAnalysis, setInitialAnalysis] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Verificar se já tem análise
    if (aiAnalysisManager.hasInitialAnalysis()) {
      const history = aiAnalysisManager.getConversationHistory();
      const firstMessage = history.find(m => m.role === 'assistant');
      if (firstMessage) {
        setInitialAnalysis(firstMessage.content);
        // Carregar mensagens do chat (excluindo a primeira que é a análise inicial)
        const chatHistory = history.slice(1);
        setChatMessages(chatHistory);
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

  // Listener de scroll manual para o viewport do ScrollArea
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScrollEvent = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    viewport.addEventListener('scroll', handleScrollEvent);
    return () => viewport.removeEventListener('scroll', handleScrollEvent);
  }, []);

  // Auto-scroll quando mensagens mudam
  useEffect(() => {
    if (!isSending) {
      const viewport = viewportRef.current;
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [chatMessages, isSending, initialAnalysis]);

  const scrollToBottom = () => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    // Adicionar mensagem do usuário instantaneamente
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await aiAnalysisManager.sendChatMessage(userMessage);
      
      // Adicionar resposta da IA
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem", {
        description: "Não foi possível conectar ao servidor."
      });
      
      // Remover mensagem do usuário em caso de erro
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col min-h-[400px] max-h-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Análise com IA</h2>
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

      {/* Conteúdo com scroll */}
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6" ref={viewportRef}>
            {/* Análise Inicial */}
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

            {/* Divisor entre análise e chat */}
            {chatMessages.length > 0 && (
              <Separator className="my-6" />
            )}

            {/* Mensagens do Chat */}
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      🤖
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`rounded-lg px-4 py-3 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      👤
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isSending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    🤖
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={contentEndRef} />
          </div>
        </ScrollArea>

        {/* Botão scroll to bottom */}
        {showScrollButton && (
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-4 right-4 rounded-full shadow-lg z-10"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Input de Chat */}
      <div className="border-t border-border p-4 shrink-0">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Digite sua pergunta..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            size="icon"
            className="h-[60px] w-[60px] shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar
        </p>
      </div>
    </div>
  );
};
