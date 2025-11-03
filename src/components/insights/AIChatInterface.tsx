import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, ArrowDown, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { aiAnalysisManager } from "@/utils/aiAnalysisManager";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Carregar histórico do manager ao montar (excluindo a análise inicial)
  useEffect(() => {
    const history = aiAnalysisManager.getConversationHistory();
    // Filtrar apenas mensagens de chat (pular a primeira que é a análise inicial)
    const chatMessages = history.slice(1).map(m => ({ role: m.role, content: m.content }));
    setMessages(chatMessages);
  }, []);
  
  // Auto-scroll quando novas mensagens chegam
  useEffect(() => {
    if (messages.length > 0) {
      contentEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    
    // Adicionar mensagem do usuário imediatamente
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await aiAnalysisManager.sendChatMessage(userMessage);
      
      // Adicionar resposta da IA
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Erro ao enviar mensagem", {
        description: "Tente novamente em alguns instantes."
      });
      
      // Remover mensagem do usuário em caso de erro
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };
  
  const scrollToBottom = () => {
    contentEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrolledToBottom = 
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    
    setShowScrollButton(!scrolledToBottom && messages.length > 0);
  };
  
  return (
    <div className="flex flex-col h-[600px] bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-border bg-muted/30">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Chat com IA - Faça suas perguntas</h3>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 relative">
        <ScrollArea 
          className="h-full p-4"
          ref={scrollAreaRef}
          onScrollCapture={handleScroll}
        >
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Faça uma pergunta sobre a análise acima</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-2 last:mb-0" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-4 mb-2 last:mb-0" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-4 mb-2 last:mb-0" {...props} />
                          ),
                          code: ({ node, inline, ...props }: any) => (
                            inline ? (
                              <code className="bg-background/50 px-1 py-0.5 rounded text-xs" {...props} />
                            ) : (
                              <code className="block bg-background/50 p-2 rounded text-xs overflow-x-auto" {...props} />
                            )
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={contentEndRef} />
          </div>
        </ScrollArea>
        
        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            size="icon"
            className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua pergunta..."
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
};
