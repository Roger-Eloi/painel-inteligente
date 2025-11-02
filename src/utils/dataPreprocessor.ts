import { ParsedWidget } from "./jsonParser";

export interface PreprocessedData {
  category: string;
  summary: string[];
  data: any[][];
}

// Função principal que processa todos os widgets
export const preprocessDataForN8N = (widgets: ParsedWidget[]): Record<string, PreprocessedData> => {
  const processed: Record<string, PreprocessedData> = {};
  
  // Agrupar widgets por categoria
  const widgetsByCategory = groupWidgetsByCategory(widgets);
  
  // Processar cada categoria
  Object.entries(widgetsByCategory).forEach(([category, categoryWidgets]) => {
    if (category === 'keywords' || category === 'category5') {
      processed['keywords'] = preprocessKeywords(categoryWidgets);
    } else if (category === 'activation') {
      processed['instalacoes'] = preprocessInstallations(categoryWidgets);
    } else if (category === 'analytics') {
      processed['usuarios'] = preprocessUsers(categoryWidgets);
    } else if (category === 'satisfaction') {
      processed['satisfacao'] = preprocessSatisfaction(categoryWidgets);
    } else if (category === 'engagement') {
      processed['engajamento'] = preprocessEngagement(categoryWidgets);
    }
  });
  
  return processed;
};

// Helper para agrupar por categoria
const groupWidgetsByCategory = (widgets: ParsedWidget[]): Record<string, ParsedWidget[]> => {
  return widgets.reduce((acc, widget) => {
    const category = widget.category?.slug || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(widget);
    return acc;
  }, {} as Record<string, ParsedWidget[]>);
};

// ============================================
// PROCESSADORES POR CATEGORIA
// ============================================

// A) Keywords (Prioridade)
const preprocessKeywords = (widgets: ParsedWidget[]): PreprocessedData => {
  // Encontrar widget de tabela de keywords
  const keywordWidget = widgets.find(w => w.kind === 'table');
  
  if (!keywordWidget || !keywordWidget.data || keywordWidget.data.length === 0) {
    return {
      category: 'keywords',
      summary: [],
      data: []
    };
  }
  
  const { config, data } = keywordWidget;
  const yAxisConfig = config?.yAxis || [];
  
  // Criar array de cabeçalhos (summary)
  const summary = yAxisConfig.map((axis: any) => axis.field);
  
  // Processar cada linha de dados
  const processedData = data.map((row: any) => {
    return summary.map(field => {
      // Buscar valor em row.columns ou diretamente
      let value;
      if (row.columns) {
        const column = row.columns.find((col: any) => col.field === field);
        value = column?.value;
      } else {
        value = row[field];
      }
      
      // Formatar valor conforme necessário
      return formatValue(value, field, yAxisConfig);
    });
  });
  
  return {
    category: 'keywords',
    summary,
    data: processedData
  };
};

// B) Instalações
const preprocessInstallations = (widgets: ParsedWidget[]): PreprocessedData => {
  // Buscar todos os widgets de instalações (area charts e big numbers)
  const areaWidgets = widgets.filter(w => w.kind === 'area');
  
  if (areaWidgets.length === 0) {
    return { category: 'instalacoes', summary: [], data: [] };
  }
  
  // Usar o primeiro widget de área como base
  const mainWidget = areaWidgets[0];
  const { data } = mainWidget;
  
  if (!data || data.length === 0) {
    return { category: 'instalacoes', summary: [], data: [] };
  }
  
  // Detectar campos de data e valores
  const sample = data[0];
  const dateField = Object.keys(sample).find(k => {
    const v = sample[k];
    return typeof v === 'string' && !isNaN(Date.parse(v));
  });
  
  if (!dateField) {
    return { category: 'instalacoes', summary: [], data: [] };
  }
  
  // Pegar todos os campos numéricos (exceto o campo de data)
  const valueFields = Object.keys(sample).filter(k => 
    k !== dateField && !isNaN(Number(sample[k]))
  );
  
  // Criar summary
  const summary = ['data', ...valueFields];
  
  // Criar dados formatados
  const processedData = data.map((row: any) => {
    const rowData: any[] = [row[dateField]];
    valueFields.forEach(field => {
      rowData.push(Number(row[field]) || 0);
    });
    return rowData;
  });
  
  // Ordenar por data
  processedData.sort((a, b) => 
    new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );
  
  return {
    category: 'instalacoes',
    summary,
    data: processedData
  };
};

// C) Usuários (Analytics)
const preprocessUsers = (widgets: ParsedWidget[]): PreprocessedData => {
  const summary: string[] = [];
  const data: any[][] = [];
  
  widgets.forEach(widget => {
    if (widget.kind === 'big_number') {
      // Big numbers viram uma linha de resumo
      const name = widget.name || 'Métrica';
      const value = widget.data[0]?.value || 0;
      summary.push(name);
      data.push([name, value]);
    } else if (widget.kind === 'table') {
      // Processar tabelas
      const { config, data: tableData } = widget;
      const yAxisConfig = config?.yAxis || [];
      
      if (yAxisConfig.length > 0 && tableData.length > 0) {
        const fields = yAxisConfig.map((axis: any) => axis.field);
        
        // Adicionar dados da tabela
        tableData.forEach((row: any) => {
          const rowData = fields.map(field => {
            if (row.columns) {
              const col = row.columns.find((c: any) => c.field === field);
              return col?.value;
            }
            return row[field];
          });
          data.push(rowData);
        });
      }
    } else if (widget.kind === 'bar' || widget.kind === 'pie' || widget.kind === 'area') {
      // Processar gráficos - extrair dados tabulares
      const chartData = widget.data;
      if (chartData.length > 0) {
        chartData.forEach((row: any) => {
          data.push(Object.values(row));
        });
      }
    }
  });
  
  return {
    category: 'usuarios',
    summary: summary.length > 0 ? summary : ['metrica', 'valor'],
    data
  };
};

// D) Satisfação
const preprocessSatisfaction = (widgets: ParsedWidget[]): PreprocessedData => {
  // Buscar widget de distribuição de estrelas (bar ou pie)
  const starWidget = widgets.find(w => 
    w.kind === 'bar' || w.kind === 'pie'
  );
  
  if (!starWidget || !starWidget.data || starWidget.data.length === 0) {
    return { category: 'satisfacao', summary: [], data: [] };
  }
  
  const { data } = starWidget;
  const summary = ['rating', 'count', 'percentage'];
  
  // Calcular total para percentuais
  const total = data.reduce((sum: number, row: any) => {
    const count = row.count || row.value || row.y || 0;
    return sum + Number(count);
  }, 0);
  
  // Processar dados
  const processedData = data.map((row: any) => {
    const rating = row.rating || row.stars || row.x || row.name || '';
    const count = Number(row.count || row.value || row.y || 0);
    const percentage = total > 0 ? ((count / total) * 100).toFixed(2) + '%' : '0%';
    
    return [rating, count, percentage];
  });
  
  return {
    category: 'satisfacao',
    summary,
    data: processedData
  };
};

// E) Engajamento
const preprocessEngagement = (widgets: ParsedWidget[]): PreprocessedData => {
  const summary: string[] = [];
  const data: any[][] = [];
  
  widgets.forEach(widget => {
    if (widget.kind === 'big_number') {
      const name = widget.name || 'Métrica';
      const value = widget.data[0]?.value || 0;
      summary.push(name);
      data.push([name, value]);
    } else if (widget.kind === 'table') {
      // Processar tabelas
      const { config, data: tableData } = widget;
      const yAxisConfig = config?.yAxis || [];
      
      if (yAxisConfig.length > 0 && tableData.length > 0) {
        const fields = yAxisConfig.map((axis: any) => axis.field);
        
        tableData.forEach((row: any) => {
          const rowData = fields.map(field => {
            if (row.columns) {
              const col = row.columns.find((c: any) => c.field === field);
              return col?.value;
            }
            return row[field];
          });
          data.push(rowData);
        });
      }
    } else {
      // Outros tipos de gráficos
      const chartData = widget.data;
      if (chartData.length > 0) {
        chartData.forEach((row: any) => {
          data.push(Object.values(row));
        });
      }
    }
  });
  
  return {
    category: 'engajamento',
    summary: summary.length > 0 ? summary : ['metrica', 'valor'],
    data
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper para formatar valores
const formatValue = (value: any, field: string, config: any[]): any => {
  const fieldConfig = config.find((c: any) => c.field === field);
  
  if (!fieldConfig) return value;
  
  // Se for número e tiver formato específico
  if (typeof value === 'number' && fieldConfig.format) {
    if (fieldConfig.format === '0') return Math.round(value);
    if (fieldConfig.format === '0.00') return parseFloat(value.toFixed(2));
  }
  
  return value;
};
