import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CompactFileUploadProps {
  onFilesUpload: (files: Array<{ name: string; data: any }>) => void;
}

export const CompactFileUpload = ({ onFilesUpload }: CompactFileUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateJSON = (content: string) => {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error("Formato JSON inválido");
    }
  };

  const handleFiles = async (fileList: FileList) => {
    setIsLoading(true);
    const filesArray = Array.from(fileList);
    const validFiles: Array<{ name: string; data: any }> = [];

    for (const file of filesArray) {
      if (file.type !== "application/json") {
        toast({
          title: "Erro",
          description: `${file.name} não é um arquivo JSON válido`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const content = await file.text();
        const jsonData = validateJSON(content);
        validFiles.push({ name: file.name, data: jsonData });
      } catch (error) {
        toast({
          title: "Erro",
          description: `Falha ao processar ${file.name}`,
          variant: "destructive",
        });
      }
    }

    if (validFiles.length > 0) {
      onFilesUpload(validFiles);
      toast({
        title: "Sucesso",
        description: `${validFiles.length} arquivo(s) carregado(s)`,
      });
    }

    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        multiple
        onChange={handleChange}
        className="hidden"
        id="file-upload-compact"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {isLoading ? "Carregando..." : "Carregar JSON"}
      </Button>
    </>
  );
};
