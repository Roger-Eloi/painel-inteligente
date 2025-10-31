import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ParsedWidget } from "@/utils/jsonParser";
import { formatNumber, getColorForValue } from "@/utils/formatters";

interface KeywordTableProps {
  widget: ParsedWidget;
}

export const KeywordTable = ({ widget }: KeywordTableProps) => {
  const [visibleRows, setVisibleRows] = useState(20);
  const { config, data } = widget;
  
  const yAxisConfig = config?.yAxis || [];
  const colorRules = config?.labelColorRules || [];
  
  const titleText = config?.title?.text || widget.name;

  const getCellValue = (row: any, field: string) => {
    if (row.columns) {
      const column = row.columns.find((col: any) => col.field === field);
      return column?.value;
    }
    return row[field];
  };

  const formatCellValue = (value: any, format: string) => {
    if (format === "string") return value;
    if (typeof value === "number") {
      return formatNumber(value, format);
    }
    return value;
  };

  const getCellColorClass = (value: any, field: string) => {
    const color = getColorForValue(value, field, colorRules);
    if (color === "green") return "text-success";
    if (color === "red") return "text-destructive";
    if (color === "gray") return "text-muted-foreground";
    return "";
  };

  const showMore = () => {
    setVisibleRows(prev => Math.min(prev + 20, data.length));
  };

  const displayedData = data.slice(0, visibleRows);
  const hasMore = visibleRows < data.length;
  const remainingCount = Math.min(20, data.length - visibleRows);

  return (
    <Card id={`widget-${widget.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle>{titleText}</CardTitle>
            {widget.description && (
              <CardDescription className="text-xs line-clamp-2 mt-1.5">
                {widget.description}
              </CardDescription>
            )}
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {visibleRows} de {data.length} keywords
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {yAxisConfig.map((axis: any) => (
                  <TableHead key={axis.field}>{axis.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedData.map((row, index) => (
                <TableRow key={index}>
                  {yAxisConfig.map((axis: any) => {
                    const value = getCellValue(row, axis.field);
                    const formattedValue = formatCellValue(value, axis.format);
                    const colorClass = getCellColorClass(value, axis.field);
                    
                    return (
                      <TableCell key={axis.field} className={colorClass}>
                        {formattedValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              onClick={showMore}
              className="w-full md:w-auto"
            >
              Mostrar mais ({remainingCount} keywords)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
