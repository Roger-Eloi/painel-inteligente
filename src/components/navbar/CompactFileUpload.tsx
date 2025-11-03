import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompactFileUploadProps {
  onFilesUpload: (files: Array<{ name: string; data: any }>) => void;
  onUploadSuccess?: (fileNames: string[]) => void;
  onProcessingStart?: () => void;
}

export const CompactFileUpload = ({ onFilesUpload, onUploadSuccess, onProcessingStart }: CompactFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateJSON = (content: string) => {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error("Formato JSON inválido");
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    const validFiles: Array<{ name: string; data: any }> = [];

    for (const file of filesArray) {
      if (file.type !== "application/json") {
        continue;
      }

      try {
        const content = await file.text();
        const jsonData = validateJSON(content);
        validFiles.push({ name: file.name, data: jsonData });
      } catch (error) {
        // Silently skip invalid files
      }
    }

    if (validFiles.length > 0) {
      onProcessingStart?.();
      onFilesUpload(validFiles);
      onUploadSuccess?.(validFiles.map(f => f.name));
    }

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
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Carregar Arquivos
      </Button>
    </>
  );
};
