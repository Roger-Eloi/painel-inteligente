export const CATEGORY_NAMES: Record<string, string> = {
  "Activation": "Instalações",
  "Analytics": "Usuários",
  "category5": "Acompanhamento de Keywords",
  "Satisfaction": "Satisfação",
};

export const getCategoryDisplayName = (categoryName: string): string => {
  return CATEGORY_NAMES[categoryName] || categoryName;
};

export const shouldShowFilters = (categoryName: string): boolean => {
  return categoryName === 'category5' || 
         CATEGORY_NAMES[categoryName] === 'Acompanhamento de Keywords';
};

export const shouldFormatDateInTitle = (categoryName: string): boolean => {
  return categoryName === 'Analytics' || categoryName === 'Activation';
};
