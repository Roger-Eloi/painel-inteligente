import { ParsedWidget } from "@/utils/jsonParser";
import { BigNumberCard } from "@/components/widgets/BigNumberCard";
import { DynamicBarChart } from "@/components/widgets/DynamicBarChart";
import { DynamicPieChart } from "@/components/widgets/DynamicPieChart";
import { DynamicAreaChart } from "@/components/widgets/DynamicAreaChart";
import { DynamicTable } from "@/components/widgets/DynamicTable";
import { StarDistributionContainer } from "@/components/widgets/StarDistributionContainer";

interface DashboardGridProps {
  widgets: ParsedWidget[];
}

export const DashboardGrid = ({ widgets }: DashboardGridProps) => {
  // Detectar widgets de distribuição por estrela (categoria satisfaction, slug contém "star")
  const starWidgets = widgets.filter(w => 
    w.category?.name === 'satisfaction' && 
    (w.slug?.toLowerCase().includes('star') || w.name?.toLowerCase().includes('estrela'))
  );
  
  // Group widgets by type for optimal layout
  const bigNumbers = widgets.filter(w => w.kind === "big_number");
  const charts = widgets.filter(w => 
    ["bar", "pie", "area", "line"].includes(w.kind) &&
    !starWidgets.some(sw => sw.id === w.id)
  );
  const tables = widgets.filter(w => w.kind === "table");

  const renderWidget = (widget: ParsedWidget) => {
    switch (widget.kind) {
      case "big_number":
        return <BigNumberCard key={widget.id} widget={widget} />;
      case "bar":
        return <DynamicBarChart key={widget.id} widget={widget} />;
      case "pie":
        return <DynamicPieChart key={widget.id} widget={widget} />;
      case "area":
      case "line":
        return <DynamicAreaChart key={widget.id} widget={widget} />;
      case "table":
        return <DynamicTable key={widget.id} widget={widget} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Big Number Cards - 3-4 per row */}
      {bigNumbers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bigNumbers.map(renderWidget)}
        </div>
      )}

      {/* Star Distribution Container - se existir */}
      {starWidgets.length > 0 && (
        <StarDistributionContainer widgets={starWidgets} />
      )}

      {/* Charts - 2 per row */}
      {charts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {charts.map(renderWidget)}
        </div>
      )}

      {/* Tables - full width */}
      {tables.length > 0 && (
        <div className="space-y-6">
          {tables.map(renderWidget)}
        </div>
      )}
    </div>
  );
};
