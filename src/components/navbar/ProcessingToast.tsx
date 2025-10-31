import { Progress } from "@/components/ui/progress";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProcessingState } from "@/hooks/useAsyncFileProcessor";

interface ProcessingToastProps {
  state: ProcessingState;
  onCancel?: () => void;
  onDismiss?: () => void;
}

export const ProcessingToast = ({ state, onCancel, onDismiss }: ProcessingToastProps) => {
  const { isProcessing, currentFile, progress, processedFiles, totalFiles, errors } = state;

  if (!isProcessing && progress === 0) return null;

  const isComplete = !isProcessing && progress === 100;
  const hasErrors = errors.length > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 animate-fade-in">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : hasErrors && !isProcessing ? (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            ) : (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            )}
            <h3 className="font-semibold text-sm">
              {isComplete
                ? "Processamento concluído"
                : isProcessing
                ? "Processando arquivos..."
                : "Processamento pausado"}
            </h3>
          </div>
          {isComplete || (!isProcessing && hasErrors) ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {processedFiles} de {totalFiles} arquivo{totalFiles !== 1 ? "s" : ""}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Current File */}
          {currentFile && isProcessing && (
            <div className="text-xs text-muted-foreground truncate">
              <span className="font-medium">Processando:</span> {currentFile}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
              <p className="font-medium">
                {errors.length} erro{errors.length !== 1 ? "s" : ""} encontrado{errors.length !== 1 ? "s" : ""}:
              </p>
              <ul className="list-disc list-inside max-h-20 overflow-y-auto">
                {errors.map((error, i) => (
                  <li key={i} className="truncate">
                    {error.fileName}: {error.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Completion Message */}
          {isComplete && !hasErrors && (
            <div className="text-xs text-green-600 dark:text-green-400">
              ✓ Todos os arquivos foram processados com sucesso
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
