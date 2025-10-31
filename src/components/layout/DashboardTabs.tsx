import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DashboardGrid } from "./DashboardGrid";
import { DashboardFilters } from "@/components/filters/DashboardFilters";
import { ParsedWidget } from "@/utils/jsonParser";
import { exportDashboardToPDF, exportAllTablesToCSV, exportKeywordsToPDF, exportKeywordsToCSV, exportSatisfactionToPDF } from "@/utils/exportHelpers";
import { getCategoryDisplayName } from "@/utils/categoryMapping";
import { FileDown, FileSpreadsheet } from "lucide-react";

interface DashboardTabsProps {
  widgets: ParsedWidget[];
}

export const DashboardTabs = ({ widgets }: DashboardTabsProps) => {
  // Agrupar widgets por categoria
  const categories = useMemo(() => {
    const grouped: Record<string, ParsedWidget[]> = {};
    
    widgets.forEach(widget => {
      const categoryName = widget.category?.name || "Outros";
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(widget);
    });
    
    return grouped;
  }, [widgets]);

  // Estado para widgets filtrados
  const [filteredCategories, setFilteredCategories] = useState<Record<string, ParsedWidget[]>>({});

  const categoryKeys = Object.keys(categories).sort();

  // Se não houver widgets, não renderizar nada
  if (widgets.length === 0) {
    return null;
  }

  // Handlers de exportação
  const handleExportPDF = async (categoryName: string) => {
    const widgetsToExport = filteredCategories[categoryName] || categories[categoryName];
    const displayName = getCategoryDisplayName(categoryName);
    const normalizedCategory = categoryName.toLowerCase();
    
    // Usar função específica para cada categoria
    if (normalizedCategory === 'category5') {
      await exportKeywordsToPDF(widgetsToExport, displayName);
    } else if (normalizedCategory === 'satisfaction' || displayName === 'Satisfação') {
      await exportSatisfactionToPDF(widgetsToExport, displayName);
    } else {
      await exportDashboardToPDF(widgetsToExport, displayName);
    }
  };

  const handleExportCSV = (categoryName: string) => {
    const widgetsToExport = filteredCategories[categoryName] || categories[categoryName];
    const displayName = getCategoryDisplayName(categoryName).toLowerCase().replace(/\s+/g, '-');
    const normalizedCategory = categoryName.toLowerCase();
    
    // Usar função específica para cada categoria
    if (normalizedCategory === 'category5') {
      exportKeywordsToCSV(widgetsToExport, `keywords-${Date.now()}`);
    } else if (normalizedCategory === 'satisfaction' || displayName === 'satisfação') {
      exportAllTablesToCSV(widgetsToExport, `satisfacao-${Date.now()}`);
    } else {
      exportAllTablesToCSV(widgetsToExport, `${displayName}-data`);
    }
  };

  const handleExportAllPDF = async () => {
    await exportDashboardToPDF(widgets, "Todos-os-Dados");
  };

  const handleExportAllCSV = () => {
    exportAllTablesToCSV(widgets, "todos-os-dados");
  };

  // Se houver apenas uma categoria, renderizar sem tabs
  if (categoryKeys.length === 1) {
    const category = categoryKeys[0];
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {getCategoryDisplayName(category)}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportPDF(category)}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV(category)}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
        <DashboardFilters
          category={category}
          widgets={categories[category]}
          onFilterChange={(filtered) => {
            setFilteredCategories(prev => ({ ...prev, [category]: filtered }));
          }}
        />
        <DashboardGrid widgets={filteredCategories[category] || categories[category]} />
      </div>
    );
  }

  return (
    <Tabs defaultValue="todos" className="w-full">
      <TabsList className="grid w-full gap-2 mb-6 h-auto p-1 bg-muted/50" style={{ gridTemplateColumns: `repeat(${categoryKeys.length + 1}, minmax(0, 1fr))` }}>
        <TabsTrigger 
          value="todos" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          Todos ({widgets.length})
        </TabsTrigger>
        {categoryKeys.map(category => (
          <TabsTrigger 
            key={category} 
            value={category}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {getCategoryDisplayName(category)} ({categories[category].length})
          </TabsTrigger>
        ))}
      </TabsList>
      
      {/* Aba "Todos" */}
      <TabsContent value="todos" className="animate-fade-in mt-0">
        <DashboardGrid widgets={widgets} />
      </TabsContent>
      
      {/* Abas por categoria */}
      {categoryKeys.map(category => (
        <TabsContent 
          key={category} 
          value={category}
          className="animate-fade-in mt-0"
        >
          <div className="flex justify-end items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportPDF(category)}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportCSV(category)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
          <DashboardFilters
            category={category}
            widgets={categories[category]}
            onFilterChange={(filtered) => {
              setFilteredCategories(prev => ({ ...prev, [category]: filtered }));
            }}
          />
          <DashboardGrid widgets={filteredCategories[category] || categories[category]} />
        </TabsContent>
      ))}
    </Tabs>
  );
};
