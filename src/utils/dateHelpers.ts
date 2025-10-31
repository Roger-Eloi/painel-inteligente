export const getDateRangeDescription = (data: any[]): string => {
  if (!data || data.length === 0 || !data[0]?.date) {
    return '';
  }

  const dates = data
    .map(item => new Date(item.date))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return '';

  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  let periodDescription = '';
  if (diffDays <= 7) {
    periodDescription = 'Última semana';
  } else if (diffDays <= 31) {
    periodDescription = 'Último mês';
  } else if (diffDays <= 90) {
    periodDescription = 'Últimos 3 meses';
  } else if (diffDays <= 180) {
    periodDescription = 'Últimos 6 meses';
  } else {
    periodDescription = 'Período analisado';
  }

  return `${periodDescription} (${formatDate(startDate)} - ${formatDate(endDate)})`;
};
