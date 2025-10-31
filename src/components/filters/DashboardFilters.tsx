import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ParsedWidget } from "@/utils/jsonParser";
import { shouldShowFilters } from "@/utils/categoryMapping";
import { Search, X } from "lucide-react";

interface DashboardFiltersProps {
  category: string;
  widgets: ParsedWidget[];
  onFilterChange: (filteredWidgets: ParsedWidget[]) => void;
}

export const DashboardFilters = ({ category, widgets, onFilterChange }: DashboardFiltersProps) => {
  const [keywordSearch, setKeywordSearch] = useState('');
  const [competitivityFilter, setCompetitivityFilter] = useState<string>('all');
  const [sortByPosition, setSortByPosition] = useState<'asc' | 'desc' | 'none'>('none');

  useEffect(() => {
    let filtered = [...widgets];

    // Filtros específicos para Keywords (category5)
    if (shouldShowFilters(category)) {
      filtered = filtered.map(widget => {
        if (widget.kind === 'table') {
          let filteredData = widget.data.filter(row => {
            // Buscar keyword
            const keywordColumn = row.columns?.find((col: any) => col.field === 'keyword');
            const keyword = keywordColumn?.value || '';
            
            if (keywordSearch && !keyword.toLowerCase().includes(keywordSearch.toLowerCase())) {
              return false;
            }

            // Filtrar competitividade
            const competitivityColumn = row.columns?.find((col: any) => col.field === 'competitivity');
            const competitivity = competitivityColumn?.value || '';
            
            if (competitivityFilter !== 'all' && competitivity !== competitivityFilter) {
              return false;
            }

            return true;
          });

          // Aplicar ordenação por posição
          if (sortByPosition !== 'none') {
            filteredData = [...filteredData].sort((a, b) => {
              const posA = a.columns?.find((col: any) => col.field === 'position')?.value || 0;
              const posB = b.columns?.find((col: any) => col.field === 'position')?.value || 0;
              
              return sortByPosition === 'asc' 
                ? posA - posB  // Menor para maior
                : posB - posA; // Maior para menor
            });
          }

          return { ...widget, data: filteredData };
        }
        return widget;
      });
    }

    onFilterChange(filtered);
  }, [keywordSearch, competitivityFilter, sortByPosition, widgets, category]);

  // Só mostrar filtros para Acompanhamento de Keywords
  if (!shouldShowFilters(category)) {
    return null;
  }

  const hasFilters = keywordSearch || competitivityFilter !== 'all' || sortByPosition !== 'none';

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca por Keyword */}
          <div>
            <Label htmlFor="keyword-search" className="text-sm font-medium mb-2 block">
              Buscar Keyword
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="keyword-search"
                placeholder="Digite a keyword..."
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro de Competitividade */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Competitividade
            </Label>
            <Select
              value={competitivityFilter}
              onValueChange={(value) => setCompetitivityFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="very low">Muito Baixa</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="very high">Muito Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordenação por Posição */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Ordenar por Posição
            </Label>
            <Select
              value={sortByPosition}
              onValueChange={(value: 'asc' | 'desc' | 'none') => setSortByPosition(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem ordenação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem ordenação</SelectItem>
                <SelectItem value="asc">Menor → Maior (1, 2, 3...)</SelectItem>
                <SelectItem value="desc">Maior → Menor (...3, 2, 1)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão de Limpar */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setKeywordSearch('');
                setCompetitivityFilter('all');
                setSortByPosition('none');
              }}
              className="w-full"
              disabled={!hasFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
