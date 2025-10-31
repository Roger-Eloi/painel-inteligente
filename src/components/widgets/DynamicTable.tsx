import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface DynamicTableProps {
  widget: ParsedWidget;
}

export const DynamicTable = ({ widget }: DynamicTableProps) => {
  const { config, data } = widget;
  
  const yAxisConfig = config?.yAxis || [];
  const colorRules = config?.labelColorRules || [];

  const getCellValue = (row: any, field: string) => {
    // Handle column structure
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config?.title?.text || widget.name}</CardTitle>
        {widget.description && (
          <CardDescription className="text-xs line-clamp-2">
            {widget.description}
          </CardDescription>
        )}
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
              {data.map((row, index) => (
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
      </CardContent>
    </Card>
  );
};
