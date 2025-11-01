import { useState, useMemo } from "react";
import { CompactFileUpload } from "@/components/navbar/CompactFileUpload";
import { FileList } from "@/components/navbar/FileList";
import { DashboardTabs } from "@/components/layout/DashboardTabs";
import { ProcessingToast } from "@/components/navbar/ProcessingToast";
import { parseJsonData, ParsedWidget } from "@/utils/jsonParser";
import { useAsyncFileProcessor } from "@/hooks/useAsyncFileProcessor";
import { useToast } from "@/hooks/use-toast";
import rankmyappLogo from "@/assets/rankmyapp-logo.svg";
import rankmyappIcon from "@/assets/rankmyapp-icon.jpg";
import chartIcon from "@/assets/chart-icon.png";

const Index = () => {
  const [uploadedData, setUploadedData] = useState<Array<{ name: string; data: any }>>([]);
  const [rawJsonStrings, setRawJsonStrings] = useState<string[]>([]);
  const [showProcessingToast, setShowProcessingToast] = useState(false);
  const { toast } = useToast();

  // Parse all uploaded JSONs into widgets
  const allWidgets = useMemo(() => {
    const widgets: ParsedWidget[] = [];
    uploadedData.forEach(file => {
      const parsed = parseJsonData(file.data);
      widgets.push(...parsed);
    });
    return widgets;
  }, [uploadedData]);

  const { processingState, processFiles, cancelProcessing } = useAsyncFileProcessor(
    allWidgets,
    undefined,
    (results, duplicatesCount) => {
      // Add processed files to state
      if (results.length > 0) {
        const newFiles = results.map(r => ({ name: r.name, data: r.data }));
        setUploadedData((prev) => [...prev, ...newFiles]);
        
        const newRawStrings = results.map(r => JSON.stringify(r.data));
        setRawJsonStrings((prev) => [...prev, ...newRawStrings]);

        toast({
          title: "Arquivos processados",
          description: `${results.length} arquivo(s) adicionado(s)${
            duplicatesCount > 0 ? `, ${duplicatesCount} duplicata(s) ignorada(s)` : ""
          }`,
        });
      } else if (duplicatesCount > 0) {
        toast({
          title: "Duplicatas detectadas",
          description: `${duplicatesCount} widget(s) duplicado(s) foram ignorados`,
          variant: "default",
        });
      }

      // Auto-dismiss toast after completion
      setTimeout(() => setShowProcessingToast(false), 3000);
    }
  );

  const handleFilesUpload = (files: Array<{ name: string; data: any }>) => {
    setShowProcessingToast(true);
    processFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedData((prev) => prev.filter((_, i) => i !== index));
    setRawJsonStrings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setUploadedData([]);
    setRawJsonStrings([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Upload */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={rankmyappIcon} 
                alt="RankMyApp" 
                className="h-8 w-8 object-contain rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Painel Inteligente
                </h1>
                <p className="text-sm text-muted-foreground">
                  Visualização e análise de dados com IA
                </p>
              </div>
            </div>

            {/* Upload and File List */}
          <div className="flex items-center gap-2">
            <FileList 
              files={uploadedData}
              onRemoveFile={handleRemoveFile}
              onClearAll={handleClearAll}
            />
            <CompactFileUpload 
              onFilesUpload={handleFilesUpload}
              onProcessingStart={() => setShowProcessingToast(true)}
            />
          </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {allWidgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="rounded-full bg-gradient-primary/10 p-6 mb-4">
              <img 
                src={chartIcon} 
                alt="Dashboard" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Painel Inteligente</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Faça upload de arquivos JSON para começar a visualizar seus dados.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dashboard Tabs */}
            <DashboardTabs widgets={allWidgets} rawJsonStrings={rawJsonStrings} />
          </div>
        )}
      </main>

      {/* Processing Toast */}
      {showProcessingToast && (
        <ProcessingToast
          state={processingState}
          onCancel={cancelProcessing}
          onDismiss={() => setShowProcessingToast(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Desenvolvido por</span>
          <img 
            src={rankmyappLogo} 
            alt="RankMyApp" 
            className="h-6 w-auto brightness-0 saturate-100"
            style={{ filter: 'invert(45%) sepia(98%) saturate(3027%) hue-rotate(200deg) brightness(99%) contrast(101%)' }}
          />
        </div>
      </footer>
    </div>
  );
};

export default Index;
