import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardGrid } from "./DashboardGrid";
import { ParsedWidget } from "@/utils/jsonParser";

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

  const categoryKeys = Object.keys(categories).sort();

  // Se não houver widgets, não renderizar nada
  if (widgets.length === 0) {
    return null;
  }

  // Se houver apenas uma categoria, renderizar sem tabs
  if (categoryKeys.length === 1) {
    return <DashboardGrid widgets={widgets} />;
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
            {category} ({categories[category].length})
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
          <DashboardGrid widgets={categories[category]} />
        </TabsContent>
      ))}
    </Tabs>
  );
};
