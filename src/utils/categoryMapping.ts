export const CATEGORY_NAMES: Record<string, string> = {
  activation: "Instalações",
  analytics: "Usuários",
  category5: "Keywords",
  satisfaction: "Satisfação",
  engagement: "Engajamento",
};

export const getCategoryDisplayName = (categoryName: string): string => {
  // Try direct lookup
  if (CATEGORY_NAMES[categoryName]) {
    return CATEGORY_NAMES[categoryName];
  }
  
  // Try lowercase lookup
  const lowerCaseName = categoryName.toLowerCase();
  if (CATEGORY_NAMES[lowerCaseName]) {
    return CATEGORY_NAMES[lowerCaseName];
  }
  
  return categoryName;
};

export const shouldShowFilters = (categoryName: string): boolean => {
  const normalized = categoryName.toLowerCase();
  return normalized === 'category5' || 
         getCategoryDisplayName(categoryName) === 'Keywords';
};

export const shouldFormatDateInTitle = (categoryName: string): boolean => {
  const normalized = categoryName.toLowerCase();
  return normalized === 'analytics' || normalized === 'activation';
};
