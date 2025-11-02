export interface ParsedWidget {
  id: string;
  documentId: string;
  name: string;
  slug: string;
  kind: 'big_number' | 'bar' | 'pie' | 'area' | 'line' | 'table';
  description: string;
  category: {
    name: string;
    slug: string;
    documentId: string;
  };
  config: any;
  data: any[];
  xField?: string;
  yField?: string;
  colors?: any;
  labels?: any;
}

export const parseJsonData = (jsonContent: any): ParsedWidget[] => {
  // Check if it's an array of widgets (full page)
  if (Array.isArray(jsonContent)) {
    return jsonContent.map((widget, index) => parseWidget(widget, index));
  }
  
  // Single widget
  return [parseWidget(jsonContent, 0)];
};

const parseWidget = (widget: any, index: number): ParsedWidget => {
  const { documentId, name, slug, kind, description, category, config, data, exampleData, xField, yField, colors, labels } = widget;
  
  // Normalize category name to lowercase for consistent mapping
  const normalizedCategory = category ? {
    ...category,
    name: category.name.toLowerCase()
  } : category;
  
  // Extract actual data - SEMPRE usar o objeto "dados", nunca "exampleData"
  let extractedData: any[] = [];
  
  // Buscar APENAS no campo "data" (que contém os dados reais)
  if (data && typeof data === 'object') {
    const appIds = Object.keys(data);
    if (appIds.length > 0) {
      extractedData = data[appIds[0]] || [];
    }
  }
  
  // Log de warning se não houver dados válidos
  if (extractedData.length === 0) {
    console.warn(`[jsonParser] Widget "${name}" não possui dados no objeto "dados"`);
  }
  
  return {
    id: `${documentId || slug || name}-${index}`, // Ensure unique IDs
    documentId,
    name,
    slug,
    kind,
    description,
    category: normalizedCategory,
    config,
    data: extractedData,
    xField,
    yField,
    colors,
    labels
  };
};
