import { useEffect } from "react";
import { CheckCircle2, FileJson, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadNotificationProps {
  files: string[];
  onDismiss: () => void;
}

export const FileUploadNotification = ({ 
  files, 
  onDismiss 
}: FileUploadNotificationProps) => {
  useEffect(() => {
    if (files.length > 0) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000); // 5 segundos

      return () => clearTimeout(timer);
    }
  }, [files, onDismiss]);

  if (files.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-20 animate-slide-in-from-top">
      <div className="bg-success/10 border border-success/20 rounded-lg p-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-success/20 p-1">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-success-foreground mb-1">
              {files.length === 1 ? 'Arquivo adicionado' : `${files.length} arquivos adicionados`}
            </p>
            <ul className="space-y-1">
              {files.map((fileName, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FileJson className="h-3 w-3 flex-shrink-0 text-success" />
                  <span className="truncate">{fileName}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
