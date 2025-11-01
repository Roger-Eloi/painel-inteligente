import { Sparkles, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { exportInsightsToPDF } from "@/utils/exportHelpers";
import { shareToWhatsApp, shareToTelegram } from "@/utils/shareHelpers";
import { toast } from "sonner";
import WhatsAppIcon from "@/assets/whatsapp-icon.svg";
import TelegramIcon from "@/assets/telegram-icon.svg";
import LinkedInIcon from "@/assets/linkedin-icon.svg";

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: string;
  question?: string;
  onRegenerate: () => void;
  isLoading: boolean;
}

export const InsightsModal = ({
  isOpen,
  onClose,
  insights,
  question,
  onRegenerate,
  isLoading,
}: InsightsModalProps) => {
  const handleExportPDF = async () => {
    await exportInsightsToPDF({
      insights,
      question,
      generatedAt: new Date().toLocaleString('pt-BR')
    });
  };

  const handleShareLinkedIn = (text: string) => {
    navigator.clipboard.writeText(text);
    window.open('https://www.linkedin.com/feed/', '_blank');
    toast.success("Texto copiado!", {
      description: "Cole a análise no LinkedIn",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[75vw] h-[80vh] flex flex-col sm:max-w-[85vw] md:max-w-[85vw] lg:max-w-[75vw]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <DialogTitle className="text-xl">Insights de IA</DialogTitle>
                <DialogDescription>
                  Análise inteligente dos seus dados gerada por IA
                </DialogDescription>
              </div>
            </div>
            
            {/* Botão Exportar Resposta */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportPDF}
              disabled={!insights}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-4 w-4" />
              Exportar Resposta
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 py-4">
          <div className="prose max-w-none dark:prose-invert">
            <div className="bg-muted/50 rounded-lg p-6 whitespace-pre-wrap text-base leading-relaxed">
              {insights || "Nenhum insight disponível."}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-4">
          {/* Seção de compartilhamento */}
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-sm text-muted-foreground">Compartilhar:</span>
            
            {/* WhatsApp */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shareToWhatsApp(insights)}
              disabled={!insights}
              title="Compartilhar no WhatsApp"
              className="h-9 w-9 hover:bg-[#25D366]/10"
            >
              <img src={WhatsAppIcon} alt="WhatsApp" className="h-6 w-6" />
            </Button>
            
            {/* Telegram */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shareToTelegram(insights)}
              disabled={!insights}
              title="Compartilhar no Telegram"
              className="h-9 w-9 hover:bg-[#29B6F6]/10"
            >
              <img src={TelegramIcon} alt="Telegram" className="h-6 w-6" />
            </Button>
            
            {/* LinkedIn */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleShareLinkedIn(insights)}
              disabled={!insights}
              title="Compartilhar no LinkedIn"
              className="h-9 w-9 hover:bg-[#0288D1]/10"
            >
              <img src={LinkedInIcon} alt="LinkedIn" className="h-6 w-6" />
            </Button>
          </div>
          
          {/* Botões de ação */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={onRegenerate} disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Gerar Novamente
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
