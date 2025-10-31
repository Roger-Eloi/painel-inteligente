import { Sparkles } from "lucide-react";
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

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: string;
  onRegenerate: () => void;
  isLoading: boolean;
}

export const InsightsModal = ({
  isOpen,
  onClose,
  insights,
  onRegenerate,
  isLoading,
}: InsightsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[75vw] h-[80vh] flex flex-col sm:max-w-[85vw] md:max-w-[85vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Insights de IA
          </DialogTitle>
          <DialogDescription>
            Análise inteligente dos seus dados gerada por IA
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 py-4">
          <div className="prose max-w-none dark:prose-invert">
            <div className="bg-muted/50 rounded-lg p-6 whitespace-pre-wrap text-base leading-relaxed">
              {insights || "Nenhum insight disponível."}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={onRegenerate} disabled={isLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Novamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
