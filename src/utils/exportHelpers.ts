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

    // Gráficos (captura de tela com 300 DPI)
    if (['bar', 'pie', 'area', 'line'].includes(widget.kind)) {
      const element = document.getElementById(`widget-${widget.id}`);
      if (element) {
        try {
          // Capturar com alta resolução (300 DPI = scale 4.17 para 72 DPI base)
          const canvas = await html2canvas(element, { 
            scale: 4.17,  // 300 DPI / 72 DPI = 4.17
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          // Calcular dimensões reais mantendo proporção
          const imgWidth = element.offsetWidth * 0.264583;  // Converter px para mm (1px = 0.264583mm)
          const imgHeight = element.offsetHeight * 0.264583;
          
          // Verificar se cabe na página
          const maxWidth = pageWidth - 30; // Margens de 15mm de cada lado
          const maxHeight = pdf.internal.pageSize.getHeight() - yPosition - 20;
          
          let finalWidth = imgWidth;
          let finalHeight = imgHeight;
          
          // Redimensionar se necessário, mantendo proporção
          if (imgWidth > maxWidth) {
            finalWidth = maxWidth;
            finalHeight = (imgHeight * maxWidth) / imgWidth;
          }
          
          if (finalHeight > maxHeight) {
            pdf.addPage();
            yPosition = 15;
            finalHeight = Math.min(finalHeight, pdf.internal.pageSize.getHeight() - 40);
            finalWidth = (imgWidth * finalHeight) / imgHeight;
          }
          
          pdf.addImage(imgData, 'PNG', 15, yPosition, finalWidth, finalHeight);
          yPosition += finalHeight + 10;
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

// Exportar keywords completas em PDF (TODAS as keywords, sem limite)
export const exportKeywordsToPDF = async (
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
    // Focar apenas em tabelas de keywords
    if (widget.kind === 'table') {
      if (yPosition + 30 > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPosition = 15;
      }
      
      pdf.setFontSize(12);
      pdf.text(widget.config?.title?.text || widget.name, 15, yPosition);
      yPosition += 7;

      const headers = widget.config?.yAxis?.map((axis: any) => axis.label) || [];
      
      // INCLUIR TODAS as keywords (sem slice)
      const rows = widget.data.map(row => {
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
        styles: { fontSize: 7 },  // Fonte menor para caber mais dados
        headStyles: { 
          fillColor: [9, 115, 138],
          fontSize: 8,
          fontStyle: 'bold'
        },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto',
        showHead: 'everyPage',
        didDrawPage: (data) => {
          // Adicionar número de página
          const pageCount = (pdf as any).internal.getNumberOfPages();
          const currentPage = (pdf as any).internal.getCurrentPageInfo().pageNumber;
          pdf.setFontSize(8);
          pdf.text(
            `Página ${currentPage} de ${pageCount}`,
            pageWidth - 30,
            pdf.internal.pageSize.getHeight() - 10
          );
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;
    }

    // Adicionar nova página se necessário
    if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      yPosition = 15;
    }
  }

  pdf.save(`keywords-completo-${Date.now()}.pdf`);
};

// Exportar keywords para CSV (sem campo widget, UTF-8 com BOM)
export const exportKeywordsToCSV = (widgets: ParsedWidget[], filename: string) => {
  const allData: any[] = [];

  widgets.forEach(widget => {
    if (widget.kind === 'table') {
      const headers = widget.config?.yAxis?.map((axis: any) => axis.field) || [];
      widget.data.forEach(row => {
        const rowData: any = {}; // SEM campo widget
        headers.forEach(field => {
          const value = row.columns?.find((col: any) => col.field === field)?.value;
          rowData[field] = value;
        });
        allData.push(rowData);
      });
    }
  });

  if (allData.length === 0) {
    console.warn('No keyword data to export');
    return;
  }

  // Gerar CSV com UTF-8 BOM para compatibilidade com Excel
  const csv = Papa.unparse(allData);
  
  // Adicionar BOM (Byte Order Mark) para UTF-8
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csv;
  
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

// Exportar relatório de Satisfação com cabeçalho, corpo e rodapé profissional
export const exportSatisfactionToPDF = async (
  widgets: ParsedWidget[],
  categoryName: string
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Detectar widgets de estrela para não duplicar
  const starWidgets = widgets.filter(w => 
    w.slug?.toLowerCase().includes('star') || 
    w.name?.toLowerCase().includes('estrela')
  );
  
  // CABEÇALHO - Primeira página
  pdf.setFillColor(9, 115, 138);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('Relatório de Satisfação', pageWidth / 2, 20, { align: 'center' });
  pdf.setFontSize(11);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 30, { align: 'center' });
  
  // Função auxiliar para adicionar rodapé
  const addFooter = (pageNum: number) => {
    pdf.setDrawColor(9, 115, 138);
    pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.text(`Página ${pageNum}`, 15, pageHeight - 12);
    pdf.setFontSize(10);
    pdf.setTextColor(9, 115, 138);
    pdf.text('Desenvolvido pela MyRankApp', pageWidth - 15, pageHeight - 12, { align: 'right' });
  };

  let yPosition = 50;
  let currentPage = 1;

  // Renderizar Star Distribution Container se existir
  if (starWidgets.length > 0) {
    const containerElement = document.getElementById('star-distribution-container');
    if (containerElement) {
      try {
        const canvas = await html2canvas(containerElement as HTMLElement, { 
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yPosition + imgHeight > pageHeight - 30) {
          addFooter(currentPage);
          pdf.addPage();
          currentPage++;
          yPosition = 20;
        }

        pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 15;
      } catch (error) {
        console.error('Erro ao capturar container de estrelas:', error);
      }
    }
  }

  // Filtrar widgets para não duplicar os de estrela
  const filteredWidgets = widgets.filter(w => !starWidgets.some(sw => sw.id === w.id));

  for (const widget of filteredWidgets) {
    // Big Numbers
    if (widget.kind === 'big_number') {
      const data = widget.data[0];
      if (yPosition + 25 > pageHeight - 30) {
        addFooter(currentPage);
        pdf.addPage();
        currentPage++;
        yPosition = 20;
      }
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(widget.config?.title?.text || widget.name, 15, yPosition);
      
      if (widget.description) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(widget.description, 15, yPosition + 5);
      }
      
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(9, 115, 138);
      pdf.text(`${data.big_number}`, 15, yPosition + 15);
      yPosition += 30;
    }

    // Tabelas
    if (widget.kind === 'table') {
      if (yPosition + 35 > pageHeight - 30) {
        addFooter(currentPage);
        pdf.addPage();
        currentPage++;
        yPosition = 20;
      }
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(widget.config?.title?.text || widget.name, 15, yPosition);
      
      if (widget.description) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(widget.description, 15, yPosition + 5);
        yPosition += 7;
      }
      
      yPosition += 7;

      const headers = widget.config?.yAxis?.map((axis: any) => axis.label) || [];
      const rows = widget.data.map(row => {
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
        headStyles: { 
          fillColor: [9, 115, 138],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        margin: { left: 15, right: 15 },
        didDrawPage: (data) => {
          if (data.pageNumber > currentPage) {
            currentPage = data.pageNumber;
          }
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Gráficos (captura de tela com 300 DPI)
    if (['bar', 'pie', 'area', 'line'].includes(widget.kind)) {
      const element = document.getElementById(`widget-${widget.id}`);
      if (element) {
        try {
          const canvas = await html2canvas(element, { 
            scale: 4.17,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff',
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = element.offsetWidth * 0.264583;
          const imgHeight = element.offsetHeight * 0.264583;
          
          const maxWidth = pageWidth - 30;
          const maxHeight = pageHeight - yPosition - 30;
          
          let finalWidth = imgWidth;
          let finalHeight = imgHeight;
          
          if (imgWidth > maxWidth) {
            finalWidth = maxWidth;
            finalHeight = (imgHeight * maxWidth) / imgWidth;
          }
          
          if (finalHeight > maxHeight) {
            addFooter(currentPage);
            pdf.addPage();
            currentPage++;
            yPosition = 20;
            finalHeight = Math.min(finalHeight, pageHeight - 50);
            finalWidth = (imgWidth * finalHeight) / imgHeight;
          }
          
          pdf.addImage(imgData, 'PNG', 15, yPosition, finalWidth, finalHeight);
          yPosition += finalHeight + 15;
        } catch (error) {
          console.error('Error capturing chart:', error);
        }
      }
    }

    if (yPosition > pageHeight - 40) {
      addFooter(currentPage);
      pdf.addPage();
      currentPage++;
      yPosition = 20;
    }
  }

  // Adicionar rodapé na última página
  addFooter(currentPage);

  pdf.save(`relatorio-satisfacao-${Date.now()}.pdf`);
};
