import { X, FileJson, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface FileListProps {
  files: Array<{ name: string; data: any }>;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

export const FileList = ({ files, onRemoveFile, onClearAll }: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileJson className="h-4 w-4" />
          <Badge variant="secondary" className="rounded-full px-2">
            {files.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-1.5 text-sm font-semibold">
          Arquivos carregados ({files.length})
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {files.map((file, index) => (
            <DropdownMenuItem
              key={index}
              className="flex items-center justify-between gap-2 cursor-default"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileJson className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-sm truncate">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </DropdownMenuItem>
          ))}
        </div>
        {files.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={onClearAll}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar todos
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
