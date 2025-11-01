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
  
  // Extract actual data - prefer the dataset with more data points
  let extractedData: any[] = [];
  let dataFromData: any[] = [];
  let dataFromExample: any[] = [];
  
  // Extract from 'data' field
  if (data && typeof data === 'object') {
    const appIds = Object.keys(data);
    if (appIds.length > 0) {
      dataFromData = data[appIds[0]] || [];
    }
  }
  
  // Extract from 'exampleData' field
  if (exampleData && typeof exampleData === 'object') {
    const appIds = Object.keys(exampleData);
    if (appIds.length > 0) {
      dataFromExample = exampleData[appIds[0]] || [];
    }
  }
  
  // Prefer the dataset with more data points
  // This ensures we use the most complete dataset available
  if (dataFromData.length > 0 && dataFromExample.length > 0) {
    // Both exist - use the one with more data points
    extractedData = dataFromData.length >= dataFromExample.length ? dataFromData : dataFromExample;
  } else if (dataFromData.length > 0) {
    // Only data exists
    extractedData = dataFromData;
  } else if (dataFromExample.length > 0) {
    // Only exampleData exists
    extractedData = dataFromExample;
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
