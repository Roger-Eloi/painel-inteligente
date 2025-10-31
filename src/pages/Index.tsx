import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { DataVisualization } from "@/components/DataVisualization";
import { InsightsPanel } from "@/components/InsightsPanel";
import { BarChart3 } from "lucide-react";

const Index = () => {
  const [uploadedData, setUploadedData] = useState<Array<{ name: string; data: any }>>([]);

  const handleFilesUpload = (files: Array<{ name: string; data: any }>) => {
    setUploadedData((prev) => [...prev, ...files]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <FileUpload onFilesUpload={handleFilesUpload} />
            </div>
          </div>

          {/* Visualization Section */}
          <div className="lg:col-span-2 space-y-6">
            <DataVisualization data={uploadedData} />
            <InsightsPanel data={uploadedData} />
          </div>
        </div>
      </main>

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
