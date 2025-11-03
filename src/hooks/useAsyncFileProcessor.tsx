import { useState, useCallback, useRef } from "react";
import { parseJsonData, ParsedWidget } from "@/utils/jsonParser";
import { filterDuplicates } from "@/utils/duplicateDetector";
import { aiAnalysisManager } from "@/utils/aiAnalysisManager";

export interface ProcessingState {
  isProcessing: boolean;
  currentFile: string | null;
  progress: number;
  totalFiles: number;
  processedFiles: number;
  errors: Array<{ fileName: string; error: string }>;
}

interface ProcessFileResult {
  name: string;
  data: any;
  widgets: ParsedWidget[];
}

export const useAsyncFileProcessor = (
  existingWidgets: ParsedWidget[],
  onProgress?: (state: ProcessingState) => void,
  onComplete?: (results: ProcessFileResult[], duplicatesCount: number) => void
) => {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    currentFile: null,
    progress: 0,
    totalFiles: 0,
    processedFiles: 0,
    errors: [],
  });

  const cancelRef = useRef(false);

  const updateState = useCallback(
    (updates: Partial<ProcessingState>) => {
      setProcessingState((prev) => {
        const newState = { ...prev, ...updates };
        onProgress?.(newState);
        return newState;
      });
    },
    [onProgress]
  );

  const processFileAsync = async (
    file: { name: string; data: any },
    index: number,
    total: number
  ): Promise<ProcessFileResult | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (cancelRef.current) {
          resolve(null);
          return;
        }

        try {
          const widgets = parseJsonData(file.data);
          const progress = ((index + 1) / total) * 100;

          updateState({
            currentFile: file.name,
            progress,
            processedFiles: index + 1,
          });

          resolve({
            name: file.name,
            data: file.data,
            widgets,
          });
        } catch (error) {
          updateState({
            errors: [
              ...processingState.errors,
              {
                fileName: file.name,
                error: error instanceof Error ? error.message : "Erro ao processar arquivo",
              },
            ],
          });
          resolve(null);
        }
      }, 0); // Use setTimeout to prevent blocking
    });
  };

  const processFiles = useCallback(
    async (files: Array<{ name: string; data: any }>) => {
      cancelRef.current = false;
      
      // Resetar cache de IA quando processar novos arquivos
      aiAnalysisManager.reset();

      updateState({
        isProcessing: true,
        currentFile: null,
        progress: 0,
        totalFiles: files.length,
        processedFiles: 0,
        errors: [],
      });

      const results: ProcessFileResult[] = [];
      let totalDuplicates = 0;

      for (let i = 0; i < files.length; i++) {
        if (cancelRef.current) break;

        const result = await processFileAsync(files[i], i, files.length);
        if (result) {
          // Check for duplicates
          const allExistingWidgets = [
            ...existingWidgets,
            ...results.flatMap((r) => r.widgets),
          ];
          
          const { unique, duplicates } = filterDuplicates(
            result.widgets,
            allExistingWidgets
          );

          totalDuplicates += duplicates.length;

          if (unique.length > 0) {
            results.push({
              ...result,
              widgets: unique,
            });
          }
        }
      }

      updateState({
        isProcessing: false,
        currentFile: null,
        progress: 100,
      });

      onComplete?.(results, totalDuplicates);
    },
    [existingWidgets, updateState, onComplete, processingState.errors]
  );

  const cancelProcessing = useCallback(() => {
    cancelRef.current = true;
    updateState({
      isProcessing: false,
      currentFile: null,
    });
  }, [updateState]);

  return {
    processingState,
    processFiles,
    cancelProcessing,
  };
};
