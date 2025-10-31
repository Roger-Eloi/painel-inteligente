import { X } from "lucide-react";

interface AITooltipProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const AITooltip = ({ isVisible, onDismiss }: AITooltipProps) => {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-24 right-6 z-40 animate-fade-in max-w-xs"
      role="tooltip"
    >
      <div className="relative">
        {/* Balão de diálogo */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <p className="text-sm font-medium">
            Veja o que seus dados têm a dizer
          </p>
          <button 
            onClick={onDismiss}
            className="ml-2 hover:opacity-70 transition-opacity"
            aria-label="Fechar tooltip"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Seta apontando para o botão */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-primary rotate-45 transform"></div>
      </div>
    </div>
  );
};
