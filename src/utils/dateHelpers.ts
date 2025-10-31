export const getDateRangeDescription = (data: any[], titleText?: string): string => {
  if (!data || data.length === 0 || !data[0]?.date) {
    return titleText || '';
  }

  const dates = data
    .map(item => new Date(item.date))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return titleText || '';

  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const formatDateWithoutYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  let dateRangeText = '';
  
  if (startYear === endYear) {
    // Mesmo ano: "25/jun à 29/jun, 2025"
    dateRangeText = `${formatDateWithoutYear(startDate)} à ${formatDateWithoutYear(endDate)}, ${startYear}`;
  } else {
    // Anos diferentes: "25/jun/2024 à 29/jun/2025"
    dateRangeText = `${startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })} à ${endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }

  if (titleText) {
    return `${titleText} (${dateRangeText})`;
  }
  
  return `(${dateRangeText})`;
};
