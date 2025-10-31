import { useCallback, useState } from "react";
import { Upload, FileJson, X, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesUpload: (files: Array<{ name: string; data: any }>) => void;
}

export const FileUpload = ({ onFilesUpload }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; data: any }>>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateJSON = (content: string): any => {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error("Arquivo JSON inválido");
    }
  };

  const handleFiles = useCallback(
    async (files: FileList) => {
      const jsonFiles: Array<{ name: string; data: any }> = [];
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.name.endsWith(".json")) {
          errors.push(`${file.name}: Apenas arquivos JSON são permitidos`);
          continue;
        }

        try {
          const text = await file.text();
          const data = validateJSON(text);
          jsonFiles.push({ name: file.name, data });
        } catch (error) {
          errors.push(`${file.name}: ${error instanceof Error ? error.message : "Erro ao processar"}`);
        }
      }

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
      }

      if (jsonFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...jsonFiles]);
        onFilesUpload(jsonFiles);
        toast.success(`${jsonFiles.length} arquivo(s) carregado(s) com sucesso`);
      }

      setDragActive(false);
    },
    [onFilesUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadedFiles([]);
    toast.info("Todos os arquivos foram removidos");
  };

  return (
    <div className="space-y-4">
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? "border-primary bg-primary/5 shadow-glow"
            : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4 transition-transform hover:scale-110">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload de Arquivos JSON</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Arraste e solte seus arquivos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Apenas arquivos .json são aceitos
            </p>
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".json"
          multiple
          className="hidden"
          onChange={handleChange}
        />
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Arquivos carregados ({uploadedFiles.length})
            </h4>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Limpar todos
            </Button>
          </div>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <Card
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-card animate-fade-in"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-2">
                    <FileJson className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
