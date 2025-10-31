export const formatNumber = (value: number, format?: string): string => {
  if (value === null || value === undefined) return '-';
  
  if (!format) return value.toString();
  
  // Handle different format types
  if (format === '0') {
    return Math.round(value).toString();
  }
  
  if (format === '0.00') {
    return value.toFixed(2);
  }
  
  if (format === '0.000a') {
    return formatCompactNumber(value);
  }
  
  if (format.includes('a')) {
    return formatCompactNumber(value);
  }
  
  return value.toString();
};

const formatCompactNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toFixed(2);
};

export const formatDate = (dateString: string, format?: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (!format || format === 'DD/MM') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }
  
  if (format === 'DD/MM/yyyy') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return dateString;
};

export const getColorForValue = (value: any, field: string, colorRules?: any[]): string => {
  if (!colorRules) return '';
  
  for (const rule of colorRules) {
    if (rule.field === field) {
      // Evaluate condition
      if (rule.condition.includes('<') && value < 0) {
        return rule.color;
      }
      if (rule.condition.includes('>') && value > 0) {
        return rule.color;
      }
      if (rule.condition.includes('===') && value === 0) {
        return rule.color;
      }
    }
  }
  
  return '';
};
