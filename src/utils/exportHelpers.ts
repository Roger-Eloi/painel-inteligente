import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import { ParsedWidget } from './jsonParser';

// Logo RankMyApp em SVG inline (cor será aplicada dinamicamente)
const RANKMYAPP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" id="Logo-RankMyApp" width="255" height="47.607" viewBox="0 0 255 47.607"><path id="Uniao_2" data-name="União 2" d="M8.4,47.607A8.4,8.4,0,0,1,0,39.221V8.385A8.4,8.4,0,0,1,8.4,0H39.291a8.4,8.4,0,0,1,8.4,8.385V39.229a8.4,8.4,0,0,1-8.4,8.378ZM2.549,8.385V39.229a5.85,5.85,0,0,0,5.85,5.84H39.291a5.85,5.85,0,0,0,5.85-5.84V8.385a5.849,5.849,0,0,0-5.85-5.839H8.4A5.849,5.849,0,0,0,2.549,8.385ZM235.882,44.728a2.156,2.156,0,0,1-.7-1.671V20.5a2.273,2.273,0,0,1,.657-1.711,2.435,2.435,0,0,1,1.77-.637,2.508,2.508,0,0,1,1.79.637,2.238,2.238,0,0,1,.676,1.711v1a6.116,6.116,0,0,1,2.528-2.528,7.757,7.757,0,0,1,3.76-.895,8.062,8.062,0,0,1,4.476,1.274,8.443,8.443,0,0,1,3.063,3.6A12.449,12.449,0,0,1,255,28.295a12.048,12.048,0,0,1-1.094,5.292,8.03,8.03,0,0,1-7.54,4.735,7.707,7.707,0,0,1-3.7-.875,6.137,6.137,0,0,1-2.507-2.427v8.117a2.064,2.064,0,0,1-.677,1.631,2.936,2.936,0,0,1-3.6-.04Zm5.491-21.168a7.344,7.344,0,0,0-1.294,4.656,7.274,7.274,0,0,0,1.294,4.616,4.966,4.966,0,0,0,7.341.019,7.038,7.038,0,0,0,1.312-4.557,7.435,7.435,0,0,0-1.312-4.694,4.906,4.906,0,0,0-7.341-.041ZM214.357,44.728a2.156,2.156,0,0,1-.7-1.671V20.5a2.275,2.275,0,0,1,.656-1.711,2.438,2.438,0,0,1,1.77-.637,2.508,2.508,0,0,1,1.79.637,2.238,2.238,0,0,1,.676,1.711v1a6.114,6.114,0,0,1,2.527-2.528,7.757,7.757,0,0,1,3.761-.895,8.062,8.062,0,0,1,4.476,1.274,8.447,8.447,0,0,1,3.063,3.6,12.459,12.459,0,0,1,1.094,5.352,12.057,12.057,0,0,1-1.094,5.292,8.03,8.03,0,0,1-7.54,4.735,7.714,7.714,0,0,1-3.7-.875,6.141,6.141,0,0,1-2.506-2.427v8.117a2.064,2.064,0,0,1-.677,1.631,2.606,2.606,0,0,1-1.791.6A2.579,2.579,0,0,1,214.357,44.728Zm5.491-21.168a7.344,7.344,0,0,0-1.294,4.656,7.274,7.274,0,0,0,1.294,4.616,4.966,4.966,0,0,0,7.341.019,7.035,7.035,0,0,0,1.313-4.557,7.432,7.432,0,0,0-1.313-4.694,4.905,4.905,0,0,0-7.341-.041ZM174.329,44.788a1.809,1.809,0,0,1-.7-1.453,2.571,2.571,0,0,1,.239-.995l2.706-5.689-7.4-15.4a2.016,2.016,0,0,1-.2-.916,1.94,1.94,0,0,1,.776-1.552,2.714,2.714,0,0,1,1.77-.637,2.342,2.342,0,0,1,1.234.338,2.258,2.258,0,0,1,.875,1.055l5.57,12.295,5.532-12.255a2.3,2.3,0,0,1,.855-1.055,2.17,2.17,0,0,1,1.175-.338,2.505,2.505,0,0,1,1.65.617,1.921,1.921,0,0,1,.737,1.532,2.053,2.053,0,0,1-.239.916L178.049,44.011a2.222,2.222,0,0,1-2.109,1.354A2.451,2.451,0,0,1,174.329,44.788Zm-90.5-7.262a6.306,6.306,0,0,1-2.507-2.188,5.53,5.53,0,0,1-.915-3.1A4.92,4.92,0,0,1,81.5,28.852a6.579,6.579,0,0,1,3.561-1.79,32.433,32.433,0,0,1,6.8-.558h.994v-.915a4.073,4.073,0,0,0-.835-2.845,3.556,3.556,0,0,0-2.706-.9,8.593,8.593,0,0,0-2.347.338q-1.194.338-2.825.974a3.978,3.978,0,0,1-1.512.518,1.493,1.493,0,0,1-1.174-.518,1.963,1.963,0,0,1-.457-1.352,2.037,2.037,0,0,1,.338-1.173,3.2,3.2,0,0,1,1.134-.935A12.967,12.967,0,0,1,85.8,18.507a17.2,17.2,0,0,1,3.8-.437q4.059,0,6.028,2.009t1.97,6.108V35.9a2.245,2.245,0,0,1-.637,1.691,2.409,2.409,0,0,1-1.75.616,2.326,2.326,0,0,1-1.691-.636,2.224,2.224,0,0,1-.657-1.671V35.02a5.192,5.192,0,0,1-2.129,2.427,6.389,6.389,0,0,1-3.361.875A7.814,7.814,0,0,1,83.83,37.526Zm4.178-8.157A4.015,4.015,0,0,0,85.9,30.2a2.129,2.129,0,0,0-.636,1.632,2.7,2.7,0,0,0,.895,2.089,3.158,3.158,0,0,0,2.208.816,4.248,4.248,0,0,0,3.243-1.334,4.819,4.819,0,0,0,1.253-3.442V29.13h-.715A27.484,27.484,0,0,0,88.008,29.369ZM76.489,37.983a2.619,2.619,0,0,1-.975-.895l-5.291-8.037a5.163,5.163,0,0,0-1.691-1.79,4.618,4.618,0,0,0-2.327-.518H62.3v8.914a2.593,2.593,0,0,1-.676,1.889,2.433,2.433,0,0,1-1.831.7,2.5,2.5,0,0,1-1.85-.7,2.549,2.549,0,0,1-.7-1.889V12.379a2.38,2.38,0,0,1,.656-1.79,2.491,2.491,0,0,1,1.81-.637h9.947q4.775,0,7.262,2.129a7.649,7.649,0,0,1,2.487,6.147,7.768,7.768,0,0,1-1.851,5.351,8.753,8.753,0,0,1-5.232,2.686,5.028,5.028,0,0,1,2.029,1,8.787,8.787,0,0,1,1.711,1.989l3.621,5.531a2.519,2.519,0,0,1,.477,1.393,1.867,1.867,0,0,1-.736,1.512,2.668,2.668,0,0,1-1.73.6A2.61,2.61,0,0,1,76.489,37.983ZM62.265,22.8h6.684a6.74,6.74,0,0,0,4.258-1.094,4.072,4.072,0,0,0,1.353-3.363,4,4,0,0,0-1.353-3.363,6.934,6.934,0,0,0-4.258-1.054H62.265Zm100.9,14.8a2.456,2.456,0,0,1-.6-1.75V19.462l-6.764,12.812a3.957,3.957,0,0,1-1.034,1.293,2.131,2.131,0,0,1-1.313.418,2.2,2.2,0,0,1-1.313-.4,3.642,3.642,0,0,1-1.034-1.313l-6.8-12.613V35.855a2.43,2.43,0,0,1-.616,1.73,2.161,2.161,0,0,1-1.652.657,2.13,2.13,0,0,1-1.631-.637,2.456,2.456,0,0,1-.6-1.75V12.3a2.59,2.59,0,0,1,.657-1.851,2.316,2.316,0,0,1,1.77-.7,2.679,2.679,0,0,1,2.427,1.711l8.833,16.83,8.793-16.83a2.634,2.634,0,0,1,2.347-1.711,2.384,2.384,0,0,1,1.79.7,2.544,2.544,0,0,1,.677,1.851V35.855a2.364,2.364,0,0,1-.637,1.75,2.261,2.261,0,0,1-1.671.637A2.128,2.128,0,0,1,163.169,37.606Zm-49.775,0a2.283,2.283,0,0,1-.677-1.75v-9.51a5.166,5.166,0,0,0-.854-3.3,3.292,3.292,0,0,0-2.686-1.034,4.541,4.541,0,0,0-3.442,1.353,5.023,5.023,0,0,0-1.293,3.621v8.874a2.289,2.289,0,0,1-.676,1.75,2.567,2.567,0,0,1-1.831.637,2.492,2.492,0,0,1-1.81-.637,2.325,2.325,0,0,1-.656-1.75v-15.4a2.189,2.189,0,0,1,.676-1.671,2.565,2.565,0,0,1,1.831-.637,2.372,2.372,0,0,1,1.691.617,2.113,2.113,0,0,1,.656,1.612v1.074a6.72,6.72,0,0,1,2.667-2.507,8.021,8.021,0,0,1,3.779-.876,6.5,6.5,0,0,1,5.213,1.99q1.71,1.99,1.711,6.008v9.789a2.323,2.323,0,0,1-.657,1.75,2.494,2.494,0,0,1-1.811.637A2.563,2.563,0,0,1,113.394,37.606Zm20.451-.12-9.311-8.435v6.8a2.149,2.149,0,0,1-.716,1.75,2.7,2.7,0,0,1-1.79.6,2.618,2.618,0,0,1-1.77-.6,2.174,2.174,0,0,1-.7-1.75V12.1a2.174,2.174,0,0,1,.7-1.75,2.618,2.618,0,0,1,1.77-.6,2.7,2.7,0,0,1,1.79.6,2.149,2.149,0,0,1,.716,1.75V27.062l8.515-8.157a2.245,2.245,0,0,1,1.631-.717,2.31,2.31,0,0,1,2.268,2.268,2.322,2.322,0,0,1-.755,1.671l-6.247,5.809,6.923,6.208a2.308,2.308,0,0,1,.8,1.711,2.344,2.344,0,0,1-.657,1.631,2.019,2.019,0,0,1-1.531.716A2.336,2.336,0,0,1,133.845,37.486Zm74.364.338a2.252,2.252,0,0,1-.876-1.054l-2.387-5.332H190.94l-2.387,5.332a2.256,2.256,0,0,1-.876,1.054,2.331,2.331,0,0,1-1.234.338,2.535,2.535,0,0,1-1.671-.637,1.957,1.957,0,0,1-.755-1.552,2.446,2.446,0,0,1,.239-1.034l10.981-23.595a2.567,2.567,0,0,1,1.094-1.214,3.168,3.168,0,0,1,3.144,0,2.57,2.57,0,0,1,1.094,1.214L211.591,34.94a2.446,2.446,0,0,1,.239,1.034,1.98,1.98,0,0,1-.735,1.552,2.514,2.514,0,0,1-1.692.637A2.258,2.258,0,0,1,208.209,37.825ZM192.691,27.459h10.5l-5.252-11.818ZM29.787,36.9a3.51,3.51,0,0,1-1.639-2.968V20.6a1.485,1.485,0,0,0-1.484-1.484H14.779a4.769,4.769,0,1,1,0-9.538H24.785c.035,0,.07-.008.106-.008h9.172a3.616,3.616,0,0,1,3.617,3.619.1.1,0,0,1-.014.042c0,.015.007.035.007.05V33.933a3.51,3.51,0,0,1-1.64,2.968,4.855,4.855,0,0,1-6.247,0Zm-15.4-1.159a3.4,3.4,0,1,1,.177,0Q14.48,35.746,14.391,35.742Zm7.136-6.431a3.4,3.4,0,1,1,.178,0Q21.616,29.316,21.527,29.311Z" fill="#1A89FF"></path></svg>`;

// Converter SVG para Base64 PNG para uso em PDFs
const svgToBase64 = async (color: string = '#1A89FF'): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Aplicar cor ao SVG
    const coloredSvg = RANKMYAPP_SVG.replace(/fill="#1A89FF"/g, `fill="${color}"`);
    
    // Criar blob e URL
    const blob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Criar imagem
    const img = new Image();
    img.onload = () => {
      // Criar canvas com dimensões do SVG
      const canvas = document.createElement('canvas');
      canvas.width = 255;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Desenhar e converter
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL('image/png');
      URL.revokeObjectURL(url);
      resolve(base64);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };
    
    img.src = url;
  });
};

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
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Carregar logo
  let logoBase64: string;
  try {
    logoBase64 = await svgToBase64('#1A89FF');
  } catch (error) {
    console.error('Error loading logo:', error);
    logoBase64 = '';
  }
  
  // Função para adicionar rodapé com logo
  const addFooter = (pageNum: number) => {
    pdf.setDrawColor(26, 137, 255);
    pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.text(`Página ${pageNum}`, 15, pageHeight - 12);
    if (logoBase64) {
      pdf.addImage(logoBase64, 'PNG', pageWidth - 50, pageHeight - 18, 35, 6.5);
    }
  };
  
  let currentPage = 1;
  
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
        headStyles: { fillColor: [26, 137, 255] },
        didDrawPage: () => {
          currentPage = (pdf as any).internal.getCurrentPageInfo().pageNumber;
        }
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
    if (yPosition > pageHeight - 30) {
      addFooter(currentPage);
      pdf.addPage();
      currentPage++;
      yPosition = 15;
    }
  }

  // Adicionar rodapé na última página
  addFooter(currentPage);

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
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Carregar logo
  let logoBase64: string;
  try {
    logoBase64 = await svgToBase64('#1A89FF');
  } catch (error) {
    console.error('Error loading logo:', error);
    logoBase64 = '';
  }
  
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
        styles: { fontSize: 7 },
        headStyles: { 
          fillColor: [26, 137, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto',
        showHead: 'everyPage',
        didDrawPage: () => {
          const pageCount = (pdf as any).internal.getNumberOfPages();
          const currentPage = (pdf as any).internal.getCurrentPageInfo().pageNumber;
          
          // Linha azul
          pdf.setDrawColor(26, 137, 255);
          pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
          
          // Número da página
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Página ${currentPage} de ${pageCount}`, 15, pageHeight - 12);
          
          // Logo
          if (logoBase64) {
            pdf.addImage(logoBase64, 'PNG', pageWidth - 50, pageHeight - 18, 35, 6.5);
          }
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;
    }

    // Adicionar nova página se necessário
    if (yPosition > pageHeight - 30) {
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
  
  // Carregar logo
  let logoBase64: string;
  try {
    logoBase64 = await svgToBase64('#1A89FF');
  } catch (error) {
    console.error('Error loading logo:', error);
    logoBase64 = '';
  }
  
  // Detectar widgets de estrela para não duplicar
  const starWidgets = widgets.filter(w => 
    w.slug?.toLowerCase().includes('star') || 
    w.name?.toLowerCase().includes('estrela')
  );
  
  // CABEÇALHO - Primeira página
  pdf.setFillColor(26, 137, 255);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('Relatório de Satisfação', pageWidth / 2, 20, { align: 'center' });
  pdf.setFontSize(11);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 30, { align: 'center' });
  
  // Função auxiliar para adicionar rodapé
  const addFooter = (pageNum: number) => {
    pdf.setDrawColor(26, 137, 255);
    pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.text(`Página ${pageNum}`, 15, pageHeight - 12);
    if (logoBase64) {
      pdf.addImage(logoBase64, 'PNG', pageWidth - 50, pageHeight - 18, 35, 6.5);
    }
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
      pdf.setTextColor(26, 137, 255);
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
          fillColor: [26, 137, 255],
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

// Interface para dados de instalações
interface InstallationsExportData {
  selectedSeries: {
    name: string;
    totalInstalls: number;
    monthlyGrowth?: number;
    yearlyGrowth?: number;
    dateRange: { start: string; end: string };
    color: string;
  };
  filteredMetrics: {
    totalInstalls: number;
    averagePerWeek: number;
    averagePerDay: number;
    dateRange?: { start: string; end: string };
  };
  chartData: {
    displayData: Array<{ date: string; installs: number }>;
    weekdayData: Array<{ weekday: string; average: number }>;
    monthlyData: Array<{ month: string; installs: number }>;
    viewMode: 'daily' | 'cumulative' | 'moving-average';
  };
  useCompactNumbers: boolean;
}

// Exportar relatório de Instalações para PDF
export const exportInstallationsToPDF = async (
  data: InstallationsExportData,
  formatNumber: (value: number) => string
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Carregar logo
  let logoBase64: string;
  try {
    logoBase64 = await svgToBase64('#1A89FF');
  } catch (error) {
    console.error('Error loading logo:', error);
    logoBase64 = '';
  }
  
  // Função para adicionar rodapé com logo
  const addFooter = (pageNum: number, totalPages: number) => {
    pdf.setDrawColor(26, 137, 255);
    pdf.setLineWidth(0.5);
    pdf.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.text(`Página ${pageNum} de ${totalPages}`, 15, pageHeight - 12);
    if (logoBase64) {
      pdf.addImage(logoBase64, 'PNG', pageWidth - 50, pageHeight - 18, 35, 6.5);
    }
  };
  
  let currentPage = 1;
  let yPosition = 20;
  
  // ========== CABEÇALHO ==========
  pdf.setFillColor(26, 137, 255);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  // Logo no cabeçalho
  if (logoBase64) {
    pdf.addImage(logoBase64, 'PNG', 15, 10, 40, 7.5);
  }
  
  // Título do relatório
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Relatório de Instalações', pageWidth - 15, 17, { align: 'right' });
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Período: ${data.selectedSeries.name}`, pageWidth - 15, 25, { align: 'right' });
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 15, 30, { align: 'right' });
  
  yPosition = 45;
  
  // ========== SEÇÃO 1: MÉTRICAS PRINCIPAIS ==========
  pdf.setTextColor(26, 137, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Métricas Principais', 15, yPosition);
  yPosition += 8;
  
  pdf.setDrawColor(26, 137, 255);
  pdf.setLineWidth(0.3);
  pdf.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;
  
  // Grid de métricas (2x2)
  const metricBoxWidth = (pageWidth - 40) / 2;
  const metricBoxHeight = 24;
  const metricGap = 5;
  
  // Métrica 1: Instalações Acumuladas
  pdf.setFillColor(245, 247, 250);
  pdf.rect(15, yPosition, metricBoxWidth, metricBoxHeight, 'F');
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('INSTALAÇÕES ACUMULADAS', 20, yPosition + 7);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(data.selectedSeries.totalInstalls), 20, yPosition + 15);
  
  // Crescimento
  if (data.selectedSeries.monthlyGrowth !== undefined && data.selectedSeries.monthlyGrowth !== 0) {
    const isPositive = data.selectedSeries.monthlyGrowth >= 0;
    pdf.setFontSize(8);
    pdf.setTextColor(isPositive ? 34 : 239, isPositive ? 197 : 68, isPositive ? 94 : 68);
    const growthText = `${isPositive ? '+' : ''}${data.selectedSeries.monthlyGrowth.toFixed(1)}% (mês)`;
    pdf.text(growthText, 20, yPosition + 21);
  }
  
  // Métrica 2: Total de Instalações
  pdf.setFillColor(245, 247, 250);
  pdf.rect(20 + metricBoxWidth, yPosition, metricBoxWidth, metricBoxHeight, 'F');
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('TOTAL PERÍODO', 25 + metricBoxWidth, yPosition + 7);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(data.filteredMetrics.totalInstalls), 25 + metricBoxWidth, yPosition + 15);
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  const dateRangeText = data.filteredMetrics.dateRange 
    ? `${new Date(data.filteredMetrics.dateRange.start).toLocaleDateString('pt-BR')} - ${new Date(data.filteredMetrics.dateRange.end).toLocaleDateString('pt-BR')}`
    : `${new Date(data.selectedSeries.dateRange.start).toLocaleDateString('pt-BR')} - ${new Date(data.selectedSeries.dateRange.end).toLocaleDateString('pt-BR')}`;
  pdf.text(dateRangeText, 25 + metricBoxWidth, yPosition + 21);
  
  yPosition += metricBoxHeight + metricGap;
  
  // Métrica 3: Média por Semana
  pdf.setFillColor(245, 247, 250);
  pdf.rect(15, yPosition, metricBoxWidth, metricBoxHeight, 'F');
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('MÉDIA POR SEMANA', 20, yPosition + 7);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(Math.round(data.filteredMetrics.averagePerWeek)), 20, yPosition + 15);
  
  // Métrica 4: Média por Dia
  pdf.setFillColor(245, 247, 250);
  pdf.rect(20 + metricBoxWidth, yPosition, metricBoxWidth, metricBoxHeight, 'F');
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('MÉDIA POR DIA', 25 + metricBoxWidth, yPosition + 7);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(formatNumber(Math.round(data.filteredMetrics.averagePerDay)), 25 + metricBoxWidth, yPosition + 15);
  
  yPosition += metricBoxHeight + 12;
  
  // ========== SEÇÃO 2: GRÁFICO DE EVOLUÇÃO ==========
  pdf.setTextColor(26, 137, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Evolução das Instalações - ${data.selectedSeries.name}`, 15, yPosition);
  yPosition += 5;
  
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const viewModeLabels = {
    'cumulative': 'Instalações Acumuladas',
    'moving-average': 'Média Móvel (7 dias)',
    'daily': 'Instalações Diárias'
  };
  pdf.text(`Modo de visualização: ${viewModeLabels[data.chartData.viewMode]}`, 15, yPosition + 3);
  yPosition += 10;
  
  // Tentar capturar o gráfico de área
  const areaChartElement = document.querySelector('[data-chart-type="installations-area"]');
  if (areaChartElement) {
    try {
      const canvas = await html2canvas(areaChartElement as HTMLElement, { 
        scale: 3,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 30;
      const imgHeight = 80;
      
      if (yPosition + imgHeight > pageHeight - 30) {
        addFooter(currentPage, 0);
        pdf.addPage();
        currentPage++;
        yPosition = 20;
      }
      
      pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Error capturing area chart:', error);
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      pdf.text('Gráfico não disponível para captura', 15, yPosition);
      yPosition += 10;
    }
  }
  
  // ========== SEÇÃO 3: DISTRIBUIÇÃO POR DIA DA SEMANA ==========
  if (yPosition > pageHeight - 80) {
    addFooter(currentPage, 0);
    pdf.addPage();
    currentPage++;
    yPosition = 20;
  }
  
  pdf.setTextColor(26, 137, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Distribuição por Dia da Semana', 15, yPosition);
  yPosition += 8;
  
  pdf.setDrawColor(26, 137, 255);
  pdf.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;
  
  // Tentar capturar gráfico de barras
  const weekdayChartElement = document.querySelector('[data-chart-type="installations-weekday"]');
  if (weekdayChartElement) {
    try {
      const canvas = await html2canvas(weekdayChartElement as HTMLElement, { 
        scale: 3,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = (pageWidth - 40) / 2;
      const imgHeight = 70;
      
      pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
    } catch (error) {
      console.error('Error capturing weekday chart:', error);
    }
  }
  
  // ========== SEÇÃO 4: TABELA MENSAL ==========
  pdf.setTextColor(26, 137, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Instalações por Mês', pageWidth / 2 + 10, yPosition);
  yPosition += 8;
  
  pdf.setDrawColor(26, 137, 255);
  pdf.line(pageWidth / 2 + 10, yPosition, pageWidth - 15, yPosition);
  yPosition += 3;
  
  // Criar tabela mensal
  const monthlyTableData = data.chartData.monthlyData.map((item, index) => {
    const previousInstalls = index > 0 ? data.chartData.monthlyData[index - 1].installs : 0;
    const growth = index > 0 && previousInstalls > 0
      ? ((item.installs - previousInstalls) / previousInstalls * 100).toFixed(1) + '%'
      : '—';
    
    return [
      item.month,
      formatNumber(item.installs),
      growth
    ];
  });
  
  autoTable(pdf, {
    startY: yPosition,
    head: [['Mês', 'Instalações', 'Variação']],
    body: monthlyTableData,
    theme: 'grid',
    styles: { 
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: { 
      fillColor: [26, 137, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { halign: 'right', cellWidth: 30 },
      2: { halign: 'center', cellWidth: 25 }
    },
    margin: { left: pageWidth / 2 + 10, right: 15 },
    didDrawPage: () => {
      currentPage = (pdf as any).internal.getCurrentPageInfo().pageNumber;
    }
  });
  
  // Calcular total de páginas e adicionar rodapés
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(i, totalPages);
  }
  
  // Salvar PDF
  const filename = `relatorio-instalacoes-${data.selectedSeries.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  pdf.save(filename);
};

// Exportar dados de Instalações para CSV
export const exportInstallationsToCSV = (
  data: InstallationsExportData,
  formatNumber: (value: number) => string
) => {
  const csvData: any[] = [];
  
  // ========== CABEÇALHO DO RELATÓRIO ==========
  csvData.push({ 
    Tipo: 'Relatório',
    Categoria: 'Instalações',
    Período: data.selectedSeries.name,
    'Data Geração': new Date().toLocaleString('pt-BR')
  });
  csvData.push({}); // Linha vazia
  
  // ========== SEÇÃO 1: MÉTRICAS RESUMIDAS ==========
  csvData.push({ 
    Métrica: 'Instalações Acumuladas',
    Valor: data.selectedSeries.totalInstalls,
    Crescimento: data.selectedSeries.monthlyGrowth !== undefined 
      ? `${data.selectedSeries.monthlyGrowth.toFixed(2)}% (mês)`
      : 'N/A'
  });
  
  csvData.push({
    Métrica: 'Total no Período Filtrado',
    Valor: data.filteredMetrics.totalInstalls,
    Crescimento: data.filteredMetrics.dateRange
      ? `${new Date(data.filteredMetrics.dateRange.start).toLocaleDateString('pt-BR')} até ${new Date(data.filteredMetrics.dateRange.end).toLocaleDateString('pt-BR')}`
      : 'Período completo'
  });
  
  csvData.push({
    Métrica: 'Média Semanal',
    Valor: Math.round(data.filteredMetrics.averagePerWeek),
    Crescimento: ''
  });
  
  csvData.push({
    Métrica: 'Média Diária',
    Valor: Math.round(data.filteredMetrics.averagePerDay),
    Crescimento: ''
  });
  
  csvData.push({}); // Linha vazia
  csvData.push({}); // Linha vazia
  
  // ========== SEÇÃO 2: EVOLUÇÃO DIÁRIA ==========
  csvData.push({ 
    Data: '=== EVOLUÇÃO TEMPORAL ===',
    Instalações: '',
    'Modo Visualização': data.chartData.viewMode === 'cumulative' ? 'Acumulado' 
      : data.chartData.viewMode === 'moving-average' ? 'Média Móvel 7d' 
      : 'Diário'
  });
  
  data.chartData.displayData.forEach(item => {
    csvData.push({
      Data: new Date(item.date).toLocaleDateString('pt-BR'),
      Instalações: item.installs,
      'Modo Visualização': ''
    });
  });
  
  csvData.push({}); // Linha vazia
  csvData.push({}); // Linha vazia
  
  // ========== SEÇÃO 3: DISTRIBUIÇÃO POR DIA DA SEMANA ==========
  csvData.push({ 
    'Dia da Semana': '=== DISTRIBUIÇÃO SEMANAL ===',
    'Média Instalações': ''
  });
  
  data.chartData.weekdayData.forEach(item => {
    csvData.push({
      'Dia da Semana': item.weekday,
      'Média Instalações': Math.round(item.average)
    });
  });
  
  csvData.push({}); // Linha vazia
  csvData.push({}); // Linha vazia
  
  // ========== SEÇÃO 4: DADOS MENSAIS ==========
  csvData.push({ 
    Mês: '=== INSTALAÇÕES MENSAIS ===',
    Total: '',
    'Variação %': ''
  });
  
  data.chartData.monthlyData.forEach((item, index) => {
    const previousInstalls = index > 0 ? data.chartData.monthlyData[index - 1].installs : 0;
    const growth = index > 0 && previousInstalls > 0
      ? ((item.installs - previousInstalls) / previousInstalls * 100).toFixed(1)
      : '';
    
    csvData.push({
      Mês: item.month,
      Total: item.installs,
      'Variação %': growth ? `${growth}%` : 'N/A'
    });
  });
  
  // Gerar CSV com UTF-8 BOM
  const csv = '\uFEFF' + Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `instalacoes-${data.selectedSeries.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`;
  link.click();
};
