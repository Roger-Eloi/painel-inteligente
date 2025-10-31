import { useState, useMemo } from "react";
import { CompactFileUpload } from "@/components/navbar/CompactFileUpload";
import { FileList } from "@/components/navbar/FileList";
import { DashboardTabs } from "@/components/layout/DashboardTabs";
import { FloatingInsightsButton } from "@/components/insights/FloatingInsightsButton";
import { BarChart3, LayoutDashboard } from "lucide-react";
import { parseJsonData, ParsedWidget } from "@/utils/jsonParser";

const Index = () => {
  const [uploadedData, setUploadedData] = useState<Array<{ name: string; data: any }>>([]);
  const [rawJsonStrings, setRawJsonStrings] = useState<string[]>([]);

  const handleFilesUpload = (files: Array<{ name: string; data: any }>) => {
    // Armazenar dados parseados (para visualização)
    setUploadedData((prev) => [...prev, ...files]);
    
    // Armazenar JSONs como strings (para N8N)
    const jsonStrings = files.map(file => JSON.stringify(file.data));
    setRawJsonStrings((prev) => [...prev, ...jsonStrings]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedData((prev) => prev.filter((_, i) => i !== index));
    setRawJsonStrings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setUploadedData([]);
    setRawJsonStrings([]);
  };

  // Parse all uploaded JSONs into widgets
  const allWidgets = useMemo(() => {
    const widgets: ParsedWidget[] = [];
    uploadedData.forEach(file => {
      const parsed = parseJsonData(file.data);
      widgets.push(...parsed);
    });
    return widgets;
  }, [uploadedData]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Upload */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-primary p-2">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
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
              <CompactFileUpload onFilesUpload={handleFilesUpload} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {allWidgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="rounded-full bg-gradient-primary/10 p-6 mb-4">
              <LayoutDashboard className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Painel Inteligente</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Faça upload de arquivos JSON no canto superior direito para começar a visualizar seus dados com gráficos dinâmicos e insights de IA.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dashboard Grid */}
            <DashboardTabs widgets={allWidgets} />
          </div>
        )}
      </main>

      {/* Floating Insights Button */}
      {rawJsonStrings.length > 0 && (
        <FloatingInsightsButton rawJsonStrings={rawJsonStrings} />
      )}

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Painel de Visualização de Dados • Desenvolvido com Lovable</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
