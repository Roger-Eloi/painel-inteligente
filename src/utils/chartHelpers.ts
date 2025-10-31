/**
 * Calcula o domínio (domain) do eixo Y baseado nos dados
 * @param data Array de dados do gráfico
 * @param fields Array de campos numéricos a considerar
 * @returns [min, max] com margem de 10%
 */
export const calculateYAxisDomain = (
  data: any[], 
  fields: string[]
): [number, number] => {
  if (!data || data.length === 0) {
    return [0, 100]; // Fallback padrão
  }

  let min = Infinity;
  let max = -Infinity;

  // Encontrar min e max considerando todos os campos
  data.forEach(item => {
    fields.forEach(field => {
      const value = Number(item[field]);
      if (!isNaN(value)) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    });
  });

  // Se todos os valores forem iguais
  if (min === max) {
    return [min * 0.9, max * 1.1];
  }

  // Adicionar margem de 10%
  const margin = (max - min) * 0.1;
  const adjustedMin = Math.max(0, min - margin); // Não pode ser negativo
  const adjustedMax = max + margin;

  // Arredondar para valores "bonitos"
  return [
    Math.floor(adjustedMin),
    Math.ceil(adjustedMax)
  ];
};
