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
  
  // Extract actual data - use data if available, otherwise use exampleData
  let extractedData: any[] = [];
  
  if (data && typeof data === 'object') {
    // data can be an object with appId keys
    const appIds = Object.keys(data);
    if (appIds.length > 0) {
      extractedData = data[appIds[0]]; // Use first appId data
    }
  }
  
  // Fallback to exampleData
  if (extractedData.length === 0 && exampleData && typeof exampleData === 'object') {
    const appIds = Object.keys(exampleData);
    if (appIds.length > 0) {
      extractedData = exampleData[appIds[0]];
    }
  }
  
  return {
    id: `${documentId || slug || name}-${index}`, // Ensure unique IDs
    documentId,
    name,
    slug,
    kind,
    description,
    category,
    config,
    data: extractedData,
    xField,
    yField,
    colors,
    labels
  };
};
