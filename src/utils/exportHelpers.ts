import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import { ParsedWidget } from './jsonParser';

// Exportar CSV de uma tabela
export const exportTableToCSV = (widget: ParsedWidget, filename: string) => {
  const headers = widget.config?.yAxis?.map((axis: any) => axis.label) || [];
  const rows = widget.data.map(row => {
    return widget.config?.yAxis?.map((axis: any) => {
      const value = row.columns?.find((col: any) => col.field === axis.field)?.value;
      return value !== undefined ? value : '';
    }) || [];
  });

  const csv = Papa.unparse({
    fields: headers,
    data: rows
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

// Exportar dashboard completo como PDF
export const exportDashboardToPDF = async (
  widgets: ParsedWidget[],
  categoryName: string
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFontSize(18);
  pdf.text(`Relatório: ${categoryName}`, pageWidth / 2, 15, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 22, { align: 'center' });

  let yPosition = 30;

  for (const widget of widgets) {
    // Big Numbers
    if (widget.kind === 'big_number') {
      const data = widget.data[0];
      if (yPosition + 20 > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPosition = 15;
      }
      pdf.setFontSize(12);
      pdf.text(widget.config?.title?.text || widget.name, 15, yPosition);
      pdf.setFontSize(20);
      pdf.text(`${data.big_number}`, 15, yPosition + 10);
      yPosition += 25;
    }

    // Tabelas
    if (widget.kind === 'table') {
      if (yPosition + 30 > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPosition = 15;
      }
      pdf.setFontSize(12);
      pdf.text(widget.config?.title?.text || widget.name, 15, yPosition);
      yPosition += 7;

      const headers = widget.config?.yAxis?.map((axis: any) => axis.label) || [];
      const rows = widget.data.slice(0, 20).map(row => {
        return widget.config?.yAxis?.map((axis: any) => {
          const value = row.columns?.find((col: any) => col.field === axis.field)?.value;
          return value !== undefined ? value : '';
        }) || [];
      });

      autoTable(pdf, {
        startY: yPosition,
        head: [headers],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [9, 115, 138] },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;
    }

    // Gráficos (captura de tela)
    if (['bar', 'pie', 'area', 'line'].includes(widget.kind)) {
      const element = document.getElementById(`widget-${widget.id}`);
      if (element) {
        try {
          const canvas = await html2canvas(element, { 
            scale: 2,
            logging: false,
            useCORS: true
          });
          const imgData = canvas.toDataURL('image/png');
          
          if (yPosition + 80 > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            yPosition = 15;
          }

          pdf.addImage(imgData, 'PNG', 15, yPosition, 180, 80);
          yPosition += 90;
        } catch (error) {
          console.error('Error capturing chart:', error);
        }
      }
    }

    // Adicionar nova página se necessário
    if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      yPosition = 15;
    }
  }

  pdf.save(`relatorio-${categoryName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`);
};

// Exportar CSV agregado de múltiplas tabelas
export const exportAllTablesToCSV = (widgets: ParsedWidget[], filename: string) => {
  const allData: any[] = [];

  widgets.forEach(widget => {
    if (widget.kind === 'table') {
      const headers = widget.config?.yAxis?.map((axis: any) => axis.field) || [];
      widget.data.forEach(row => {
        const rowData: any = { widget: widget.name };
        headers.forEach(field => {
          const value = row.columns?.find((col: any) => col.field === field)?.value;
          rowData[field] = value;
        });
        allData.push(rowData);
      });
    }
  });

  if (allData.length === 0) {
    console.warn('No table data to export');
    return;
  }

  const csv = Papa.unparse(allData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};
