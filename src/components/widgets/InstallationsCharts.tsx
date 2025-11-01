import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParsedWidget } from "@/utils/jsonParser";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar as CalendarIcon, Check, X, TrendingUp, TrendingDown } from "lucide-react";
import { exportInstallationsToPDF, exportInstallationsToCSV } from "@/utils/exportHelpers";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
interface InstallationsChartsProps {
  widgets: ParsedWidget[];
}
const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
export const InstallationsCharts = ({
  widgets
}: InstallationsChartsProps) => {
  const allInstallationsSeries = useMemo(() => {
    console.log('[InstallationsCharts] Total de widgets:', widgets.length);

    // Buscar TODOS os widgets de instalações
    const installationsWidgets = widgets.filter(w => w.name?.toUpperCase().includes("INSTALAÇÕES") || w.name?.toUpperCase().includes("INSTALACOES") || w.name?.toUpperCase().includes("INSTALL") || w.slug?.toLowerCase().includes("install") || w.slug?.toLowerCase().includes("activation") || w.category?.slug === 'activation');
    console.log('[InstallationsCharts] Total de arquivos encontrados:', installationsWidgets.length);
    if (installationsWidgets.length === 0) {
      console.warn('[InstallationsCharts] Nenhum widget de instalações encontrado');
      return null;
    }

    // Função para detectar nome da série
    const detectSeriesName = (widget: ParsedWidget, index: number): string => {
      const slug = widget.slug?.toLowerCase() || '';
      const name = widget.name?.toLowerCase() || '';
      if (slug.includes('6-meses') || name.includes('6 meses')) return '6 meses';
      if (slug.includes('1-mes') || name.includes('1 mês') || name.includes('1 mes')) return '1 mês';
      if (slug.includes('3-meses') || name.includes('3 meses')) return '3 meses';
      if (slug.includes('12-meses') || name.includes('12 meses') || name.includes('1 ano')) return '1 ano';
      return `Período ${index + 1}`;
    };

    // Processar cada widget independentemente
    const processedSeries = installationsWidgets.map((installationsWidget, index) => {
      if (!installationsWidget?.data || installationsWidget.data.length === 0) {
        return null;
      }
      const sample = installationsWidget.data[0] || {};

      // Priorizar xField/yField do widget, depois tentar alternativas
      const dateCandidates = [installationsWidget.xField, 'createdAt', 'date', 'x', 'time', 'datetime', 'day', 'period'].filter(Boolean);
      const valueCandidates = [installationsWidget.yField, 'maxinstalls', 'new_installs', 'installs', 'installation', 'installations', 'y', 'value', 'count', 'total', 'amount'].filter(Boolean);
      let dateField = dateCandidates.find(f => sample[f as string] !== undefined) as string;
      let valueField = valueCandidates.find(f => sample[f as string] !== undefined && !isNaN(Number(sample[f as string]))) as string;

      // Heurística: procurar por tipo
      if (!dateField) {
        dateField = Object.keys(sample).find(k => {
          const v = sample[k];
          return typeof v === 'string' && !isNaN(Date.parse(v));
        }) || '';
      }
      if (!valueField) {
        valueField = Object.keys(sample).find(k => !isNaN(Number(sample[k]))) || '';
      }
      if (!dateField || !valueField) {
        console.error(`[InstallationsCharts] Campos não detectados para widget ${index}`);
        return null;
      }

      // Ordenar por data
      const sorted = [...installationsWidget.data].filter(it => it[dateField] && !isNaN(Date.parse(it[dateField]))).sort((a, b) => new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime());

      // Detectar se é série acumulada
      const nameHint = String(valueField).toLowerCase().includes('max') || String(installationsWidget?.config?.yAxis?.label || '').toLowerCase().includes('acumulad');
      const monotonic = sorted.every((it, i) => i === 0 || Number(it[valueField]) >= Number(sorted[i - 1][valueField]));
      const isCumulative = nameHint || monotonic;

      // Agregar por data (desduplicar)
      const byDate = new Map<string, {
        date: string;
        value: number;
      }>();
      for (const it of sorted) {
        const d = it[dateField] as string;
        const v = Number(it[valueField] ?? 0);
        if (!byDate.has(d)) {
          byDate.set(d, {
            date: d,
            value: isCumulative ? v : 0
          });
        } else {
          const existing = byDate.get(d)!;
          if (isCumulative) {
            byDate.set(d, {
              date: d,
              value: Math.max(existing.value, v)
            });
          } else {
            byDate.set(d, {
              date: d,
              value: existing.value + v
            });
          }
        }
      }
      const datesAsc = [...byDate.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Converter para série diária
      let timeSeriesData: {
        date: string;
        installs: number;
      }[] = [];
      if (isCumulative) {
        for (let i = 0; i < datesAsc.length; i++) {
          const curr = datesAsc[i].value;
          const prev = i > 0 ? datesAsc[i - 1].value : 0;
          const daily = Math.max(0, curr - prev);
          timeSeriesData.push({
            date: datesAsc[i].date,
            installs: daily
          });
        }
      } else {
        timeSeriesData = datesAsc.map(d => ({
          date: d.date,
          installs: d.value
        }));
      }
      if (timeSeriesData.length === 0) return null;

      // Calcular métricas
      const totalInstalls = timeSeriesData.reduce((sum, item) => sum + item.installs, 0);
      const averagePerDay = timeSeriesData.length ? totalInstalls / timeSeriesData.length : 0;

      // Calcular crescimento semanal
      const n = timeSeriesData.length;
      let growthPercentage = 0;
      if (n >= 2) {
        const span = n >= 14 ? 7 : Math.max(1, Math.floor(n / 2));
        const firstAvg = timeSeriesData.slice(0, span).reduce((s, i) => s + i.installs, 0) / span;
        const lastAvg = timeSeriesData.slice(-span).reduce((s, i) => s + i.installs, 0) / span;
        growthPercentage = firstAvg === 0 ? lastAvg > 0 ? 100 : 0 : (lastAvg - firstAvg) / firstAvg * 100;
      }

      // Calcular crescimento mensal (últimos 30 dias vs 30 dias anteriores)
      let monthlyGrowth = 0;
      if (n >= 60) {
        const last30Days = timeSeriesData.slice(-30);
        const previous30Days = timeSeriesData.slice(-60, -30);
        const last30Total = last30Days.reduce((s, i) => s + i.installs, 0);
        const prev30Total = previous30Days.reduce((s, i) => s + i.installs, 0);
        monthlyGrowth = prev30Total > 0 ? (last30Total - prev30Total) / prev30Total * 100 : 0;
      }

      // Calcular crescimento anual (se houver dados suficientes)
      let yearlyGrowth = 0;
      if (n >= 365) {
        const last365Days = timeSeriesData.slice(-365);
        const previous365Days = timeSeriesData.slice(-730, -365);
        if (previous365Days.length > 0) {
          const lastYearTotal = last365Days.reduce((s, i) => s + i.installs, 0);
          const prevYearTotal = previous365Days.reduce((s, i) => s + i.installs, 0);
          yearlyGrowth = prevYearTotal > 0 ? (lastYearTotal - prevYearTotal) / prevYearTotal * 100 : 0;
        }
      }

      // Agregar por dia da semana
      const byWeekday = timeSeriesData.reduce((acc: any, item) => {
        const date = new Date(item.date);
        const weekday = date.toLocaleDateString("pt-BR", {
          weekday: "short"
        });
        if (!acc[weekday]) {
          acc[weekday] = {
            weekday,
            total: 0,
            count: 0
          };
        }
        acc[weekday].total += item.installs;
        acc[weekday].count++;
        return acc;
      }, {});
      const weekdayOrder = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
      const weekdayData = weekdayOrder.map(day => {
        const data = byWeekday[day];
        return data ? {
          weekday: day,
          average: Math.round(data.total / data.count)
        } : {
          weekday: day,
          average: 0
        };
      });

      // Agregar por mês
      const byMonth = timeSeriesData.reduce((acc: any, item) => {
        const date = new Date(item.date);
        const month = date.toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric"
        });
        if (!acc[month]) {
          acc[month] = {
            month,
            total: 0
          };
        }
        acc[month].total += item.installs;
        return acc;
      }, {});
      const monthlyData = Object.values(byMonth).map((item: any) => ({
        month: item.month,
        installs: item.total
      }));
      const seriesName = detectSeriesName(installationsWidget, index);
      return {
        id: `series-${index}`,
        name: seriesName,
        totalInstalls,
        averagePerDay,
        growthPercentage,
        monthlyGrowth,
        yearlyGrowth,
        timeSeriesData,
        weekdayData,
        monthlyData,
        dateRange: {
          start: timeSeriesData[0]?.date,
          end: timeSeriesData[timeSeriesData.length - 1]?.date
        },
        color: COLORS[index % COLORS.length],
        widget: installationsWidget
      };
    }).filter(Boolean);
    console.log('[InstallationsCharts] Séries processadas:', {
      totalSeries: processedSeries.length,
      names: processedSeries.map(s => s?.name)
    });
    return processedSeries.length > 0 ? processedSeries : null;
  }, [widgets]);

  // Estado para controlar qual série está selecionada
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  // Estados para filtros de data - inicializar com período total pré-selecionado
  const [dateFilter, setDateFilter] = useState<{
    start: Date | null;
    end: Date | null;
  }>(() => {
    if (allInstallationsSeries && allInstallationsSeries.length > 0) {
      const firstSeries = allInstallationsSeries[0];
      return {
        start: new Date(firstSeries.dateRange.start),
        end: new Date(firstSeries.dateRange.end)
      };
    }
    return {
      start: null,
      end: null
    };
  });
  const [showAllPeriods, setShowAllPeriods] = useState(true);
  const [useCompactNumbers, setUseCompactNumbers] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Estado para tipo de visualização do gráfico
  const [viewMode, setViewMode] = useState<'daily' | 'cumulative' | 'moving-average'>('cumulative');

  // Função para formatar números de forma compacta
  const formatNumber = (value: number, compact: boolean = useCompactNumbers): string => {
    if (!compact) {
      return value.toLocaleString('pt-BR');
    }

    // Formato compacto
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString('pt-BR');
  };

  // Selecionar primeira série por padrão
  useEffect(() => {
    if (allInstallationsSeries && allInstallationsSeries.length > 0 && !selectedSeriesId) {
      setSelectedSeriesId(allInstallationsSeries[0].id);
    }
  }, [allInstallationsSeries, selectedSeriesId]);

  // Obter série selecionada
  const selectedSeries = allInstallationsSeries?.find(s => s.id === selectedSeriesId);

  // Calcular range de datas disponíveis no JSON
  const availableDateRange = useMemo(() => {
    if (!selectedSeries?.timeSeriesData || selectedSeries.timeSeriesData.length === 0) {
      return {
        minDate: new Date(),
        maxDate: new Date()
      };
    }
    const dates = selectedSeries.timeSeriesData.map(item => new Date(item.date)).filter(date => !isNaN(date.getTime()));
    if (dates.length === 0) {
      return {
        minDate: new Date(),
        maxDate: new Date()
      };
    }
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return {
      minDate,
      maxDate
    };
  }, [selectedSeries]);

  // Funções de filtragem de dados por data
  const getFilteredData = (data: Array<{
    date: string;
    installs: number;
  }>) => {
    if (showAllPeriods || !dateFilter.start || !dateFilter.end) {
      return data;
    }
    const startTime = dateFilter.start.getTime();
    const endTime = dateFilter.end.getTime();
    return data.filter(item => {
      const itemTime = new Date(item.date).getTime();
      return itemTime >= startTime && itemTime <= endTime;
    });
  };
  const getFilteredWeekdayData = (filteredTimeSeries: Array<{
    date: string;
    installs: number;
  }>) => {
    const byWeekday = filteredTimeSeries.reduce((acc: any, item) => {
      const date = new Date(item.date);
      const weekday = date.toLocaleDateString("pt-BR", {
        weekday: "short"
      });
      if (!acc[weekday]) acc[weekday] = {
        weekday,
        total: 0,
        count: 0
      };
      acc[weekday].total += item.installs;
      acc[weekday].count++;
      return acc;
    }, {});
    const weekdayOrder = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
    return weekdayOrder.map(day => {
      const data = byWeekday[day];
      return data ? {
        weekday: day,
        average: Math.round(data.total / data.count)
      } : {
        weekday: day,
        average: 0
      };
    });
  };
  const getFilteredMonthlyData = (filteredTimeSeries: Array<{
    date: string;
    installs: number;
  }>) => {
    const byMonth = filteredTimeSeries.reduce((acc: any, item) => {
      const date = new Date(item.date);
      const month = date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric"
      });
      if (!acc[month]) acc[month] = {
        month,
        total: 0
      };
      acc[month].total += item.installs;
      return acc;
    }, {});
    return Object.values(byMonth).map((item: any) => ({
      month: item.month,
      installs: item.total
    }));
  };

  // Calcular dados acumulados
  const getCumulativeData = (dailyData: Array<{
    date: string;
    installs: number;
  }>) => {
    let accumulated = 0;
    return dailyData.map(item => {
      accumulated += item.installs;
      return {
        date: item.date,
        installs: accumulated
      };
    });
  };

  // Calcular média móvel
  const getMovingAverageData = (dailyData: Array<{
    date: string;
    installs: number;
  }>, days: number = 7) => {
    return dailyData.map((item, index) => {
      const start = Math.max(0, index - days + 1);
      const slice = dailyData.slice(start, index + 1);
      const average = slice.reduce((sum, d) => sum + d.installs, 0) / slice.length;
      return {
        date: item.date,
        installs: Math.round(average)
      };
    });
  };

  // Calcular métricas dos dados filtrados
  const filteredTimeSeriesData = selectedSeries ? getFilteredData(selectedSeries.timeSeriesData) : [];
  const filteredTotalInstalls = filteredTimeSeriesData.reduce((sum, item) => sum + item.installs, 0);
  const filteredAveragePerDay = filteredTimeSeriesData.length ? filteredTotalInstalls / filteredTimeSeriesData.length : 0;
  const filteredAveragePerWeek = filteredTimeSeriesData.length ? filteredTotalInstalls / filteredTimeSeriesData.length * 7 : 0;

  // Extrair anos únicos dos dados mensais
  const availableYears = useMemo(() => {
    if (!selectedSeries) return [];
    const years = new Set<string>();
    getFilteredMonthlyData(filteredTimeSeriesData).forEach(item => {
      // "mai. de 2025" -> extrair "2025"
      const yearMatch = item.month.match(/\d{4}/);
      if (yearMatch) {
        years.add(yearMatch[0]);
      }
    });
    return ['all', ...Array.from(years).sort()];
  }, [selectedSeries, filteredTimeSeriesData]);

  // Filtrar dados mensais por ano selecionado
  const yearFilteredMonthlyData = useMemo(() => {
    const monthlyData = getFilteredMonthlyData(filteredTimeSeriesData);
    if (selectedYear === 'all') return monthlyData;
    return monthlyData.filter(item => item.month.includes(selectedYear));
  }, [filteredTimeSeriesData, selectedYear]);

  // Preparar dados para exibição baseado no modo de visualização
  let displayData: Array<{
    date: string;
    installs: number;
  }> = filteredTimeSeriesData;
  let yAxisLabel = 'Instalações';
  if (selectedSeries && filteredTimeSeriesData.length > 0) {
    switch (viewMode) {
      case 'cumulative':
        displayData = getCumulativeData(filteredTimeSeriesData);
        yAxisLabel = 'Instalações Acumuladas';
        break;
      case 'moving-average':
        displayData = getMovingAverageData(filteredTimeSeriesData, 7);
        yAxisLabel = 'Média Móvel (7 dias)';
        break;
      case 'daily':
      default:
        displayData = filteredTimeSeriesData;
        yAxisLabel = 'Instalações Diárias';
        break;
    }
  }

  // Handlers de exportação
  const handleExportPDF = async () => {
    if (!selectedSeries) return;
    const exportData = {
      selectedSeries: {
        name: selectedSeries.name,
        totalInstalls: selectedSeries.totalInstalls,
        monthlyGrowth: selectedSeries.monthlyGrowth,
        yearlyGrowth: selectedSeries.yearlyGrowth,
        dateRange: selectedSeries.dateRange,
        color: selectedSeries.color
      },
      filteredMetrics: {
        totalInstalls: filteredTotalInstalls,
        averagePerWeek: filteredAveragePerWeek,
        averagePerDay: filteredAveragePerDay,
        dateRange: showAllPeriods ? undefined : {
          start: dateFilter.start!.toISOString(),
          end: dateFilter.end!.toISOString()
        }
      },
      chartData: {
        displayData,
        weekdayData: getFilteredWeekdayData(filteredTimeSeriesData),
        monthlyData: yearFilteredMonthlyData,
        viewMode
      },
      useCompactNumbers
    };
    await exportInstallationsToPDF(exportData, formatNumber);
  };
  const handleExportCSV = () => {
    if (!selectedSeries) return;
    const exportData = {
      selectedSeries: {
        name: selectedSeries.name,
        totalInstalls: selectedSeries.totalInstalls,
        monthlyGrowth: selectedSeries.monthlyGrowth,
        yearlyGrowth: selectedSeries.yearlyGrowth,
        dateRange: selectedSeries.dateRange,
        color: selectedSeries.color
      },
      filteredMetrics: {
        totalInstalls: filteredTotalInstalls,
        averagePerWeek: filteredAveragePerWeek,
        averagePerDay: filteredAveragePerDay,
        dateRange: showAllPeriods ? undefined : {
          start: dateFilter.start!.toISOString(),
          end: dateFilter.end!.toISOString()
        }
      },
      chartData: {
        displayData,
        weekdayData: getFilteredWeekdayData(filteredTimeSeriesData),
        monthlyData: yearFilteredMonthlyData,
        viewMode
      },
      useCompactNumbers
    };
    exportInstallationsToCSV(exportData, formatNumber);
  };

  // Listener para eventos de exportação do DashboardTabs
  useEffect(() => {
    const handleExportEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail.type === 'pdf') {
        handleExportPDF();
      } else if (customEvent.detail.type === 'csv') {
        handleExportCSV();
      }
    };
    window.addEventListener('export-installations', handleExportEvent);
    return () => {
      window.removeEventListener('export-installations', handleExportEvent);
    };
  }, [selectedSeries, displayData, filteredTotalInstalls, filteredAveragePerWeek, filteredAveragePerDay, viewMode, yearFilteredMonthlyData, filteredTimeSeriesData]);
  if (!allInstallationsSeries || allInstallationsSeries.length === 0) {
    return <Card>
        <CardHeader>
          <CardTitle>Seção de Instalações</CardTitle>
          <CardDescription>Nenhum dado disponível para exibir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm space-y-2">
            <p>⚠️ Os gráficos não puderam ser renderizados.</p>
            <p className="text-xs">Possíveis causas:</p>
            <ul className="list-disc list-inside text-xs pl-2">
              <li>Nenhum widget com dados de instalações foi encontrado</li>
              <li>Os dados não têm a estrutura esperada (campos de data/valor)</li>
              <li>Nenhum arquivo foi carregado nesta categoria</li>
            </ul>
            <p className="text-xs mt-4">
              <strong>Dica:</strong> Abra o console do navegador (F12) para ver logs de debug detalhados.
            </p>
          </div>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-6 animate-fade-in">
      {/* Card de Seleção de Arquivo */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>Selecione o Período</CardTitle>
                <CardDescription>Escolha qual arquivo de instalações deseja visualizar</CardDescription>
              </div>
              
              {/* Toggle de Formatação Compacta */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {useCompactNumbers ? 'Compacto' : 'Completo'}
                </span>
                <Switch checked={useCompactNumbers} onCheckedChange={setUseCompactNumbers} aria-label="Alternar formatação de números" />
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allInstallationsSeries.map(series => <button key={series.id} onClick={() => setSelectedSeriesId(series.id)} className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${selectedSeriesId === series.id ? 'border-primary bg-primary/5 shadow-md' : 'border-muted hover:border-primary/50'}
                `}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">{series.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(series.dateRange.start).toLocaleDateString("pt-BR", {
                    month: 'short',
                    year: 'numeric'
                  })}
                      {' - '}
                      {new Date(series.dateRange.end).toLocaleDateString("pt-BR", {
                    month: 'short',
                    year: 'numeric'
                  })}
                    </p>
                  </div>
                  {selectedSeriesId === series.id && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>}
                </div>
                
              </button>)}
          </div>
        </CardContent>
      </Card>

      {/* Renderizar gráficos apenas da série selecionada */}
      {selectedSeries && <>
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Instalações Acumuladas</CardDescription>
                <CardTitle className="text-3xl">{formatNumber(selectedSeries.totalInstalls)}</CardTitle>
              </CardHeader>
              <CardContent>
                
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Instalações</CardDescription>
                <CardTitle className="text-3xl">{formatNumber(filteredTotalInstalls)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {showAllPeriods ? `${new Date(selectedSeries.dateRange.start).toLocaleDateString("pt-BR")} - ${new Date(selectedSeries.dateRange.end).toLocaleDateString("pt-BR")}` : `${format(dateFilter.start!, "dd/MM/yyyy")} - ${format(dateFilter.end!, "dd/MM/yyyy")}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Média por Semana</CardDescription>
                <CardTitle className="text-3xl">{formatNumber(Math.round(filteredAveragePerWeek))}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {showAllPeriods ? "Período total" : "Período filtrado"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Média por Dia</CardDescription>
                <CardTitle className="text-3xl">{formatNumber(Math.round(filteredAveragePerDay))}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {showAllPeriods ? "Período total" : "Período filtrado"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Área - Evolução Temporal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>Evolução das Instalações - {selectedSeries.name}</CardTitle>
                  <CardDescription>Acompanhamento diário de novas instalações</CardDescription>
                </div>
                
                {/* Controles de Filtro */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Toggle de Modo de Visualização */}
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                    <Button variant={viewMode === 'cumulative' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('cumulative')} className="h-8">
                      Acumulado
                    </Button>
                    <Button variant={viewMode === 'moving-average' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('moving-average')} className="h-8">
                      Média 7d
                    </Button>
                    <Button variant={viewMode === 'daily' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('daily')} className="h-8">
                      Diário
                    </Button>
                  </div>
                  <Button variant={showAllPeriods ? "default" : "outline"} size="sm" onClick={() => {
                setShowAllPeriods(true);
                setDateFilter({
                  start: null,
                  end: null
                });
              }}>
                    Período Total
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={!showAllPeriods ? "default" : "outline"} size="sm" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {dateFilter.start && dateFilter.end ? `${format(dateFilter.start, "dd/MM/yy", {
                      locale: ptBR
                    })} - ${format(dateFilter.end, "dd/MM/yy", {
                      locale: ptBR
                    })}` : "Filtrar por Data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar mode="range" selected={{
                    from: dateFilter.start || undefined,
                    to: dateFilter.end || undefined
                  }} onSelect={range => {
                    if (range?.from) {
                      if (range?.to) {
                        // Ambas as datas selecionadas
                        setDateFilter({
                          start: range.from,
                          end: range.to
                        });
                        setShowAllPeriods(false);
                      } else {
                        // Apenas data inicial selecionada
                        setDateFilter({
                          start: range.from,
                          end: range.from
                        });
                        setShowAllPeriods(false);
                      }
                    }
                  }} disabled={date => {
                    // Desabilitar datas fora do range do JSON
                    return date < availableDateRange.minDate || date > availableDateRange.maxDate;
                  }} defaultMonth={availableDateRange.minDate} locale={ptBR} numberOfMonths={2} className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                  
                  {!showAllPeriods && dateFilter.start && dateFilter.end && <Button variant="ghost" size="sm" onClick={() => {
                setDateFilter({
                  start: null,
                  end: null
                });
                setShowAllPeriods(true);
              }}>
                      <X className="h-4 w-4" />
                    </Button>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div data-chart-type="installations-area">
                <ChartContainer config={{
              installs: {
                label: yAxisLabel,
                color: selectedSeries.color
              }
            }} className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData}>
                    <defs>
                      <linearGradient id={`colorInstalls-${selectedSeries.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedSeries.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={selectedSeries.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tickFormatter={date => new Date(date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short"
                  })} className="text-xs" />
                    <YAxis className="text-xs" domain={[(dataMin: number) => Math.floor(dataMin * 0.99), 'auto']} tickFormatter={value => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toFixed(0);
                  }} />
                    <Tooltip content={({
                    active,
                    payload
                  }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0];
                    return <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              {new Date(data.payload.date).toLocaleDateString("pt-BR")}
                            </p>
                  <p className="font-semibold">
                    {formatNumber(Number(data.value) || 0)} {yAxisLabel.toLowerCase()}
                  </p>
                          </div>;
                  }} />
                    <Area type="monotone" dataKey="installs" stroke={selectedSeries.color} fillOpacity={1} fill={`url(#colorInstalls-${selectedSeries.id})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
              </div>
              
              {/* Descrição do Widget */}
              {selectedSeries.widget.description && <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {selectedSeries.widget.description}
                  </p>
                </div>}
            </CardContent>
          </Card>

          {/* Gráficos de Distribuição */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico por Dia da Semana */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Dia da Semana</CardTitle>
                <CardDescription>
                  {showAllPeriods ? "Média de instalações por dia (período total)" : `Período: ${format(dateFilter.start!, "dd/MM/yy")} - ${format(dateFilter.end!, "dd/MM/yy")}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div data-chart-type="installations-weekday">
                  <ChartContainer config={{
                average: {
                  label: "Média de Instalações",
                  color: selectedSeries.color
                }
              }} className="h-[390px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getFilteredWeekdayData(filteredTimeSeriesData)} layout="vertical" margin={{
                    top: 5,
                    right: 60,
                    left: 0,
                    bottom: 5
                  }}>
                      <defs>
                        <linearGradient id="weekdayGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="5%" stopColor={selectedSeries.color} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={selectedSeries.color} stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                      <XAxis type="number" hide={true} />
                      <YAxis type="category" dataKey="weekday" className="text-xs" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="average" fill="url(#weekdayGradient)" radius={[0, 8, 8, 0]} label={{
                      position: 'right',
                      formatter: (value: number) => formatNumber(value),
                      style: {
                        fontSize: '11px',
                        fontWeight: 'bold',
                        fill: selectedSeries.color
                      }
                    }} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                </div>
              </CardContent>
            </Card>

            {/* Card Mensal - Tabela */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Instalações por Mês</CardTitle>
                    <CardDescription>
                      {showAllPeriods ? "Total acumulado mensal (período total)" : `Período: ${format(dateFilter.start!, "dd/MM/yy")} - ${format(dateFilter.end!, "dd/MM/yy")}`}
                    </CardDescription>
                  </div>
                  
                  {/* Filtro de Ano */}
                  {availableYears.length > 1 && <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ano:</span>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {availableYears.filter(y => y !== 'all').map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[400px] w-full rounded-lg border">
                  <Table className="rounded-lg overflow-hidden">
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[180px]">Mês</TableHead>
                        <TableHead className="text-right">Instalações</TableHead>
                        <TableHead className="text-right w-[120px]">Variação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yearFilteredMonthlyData.length > 0 ? yearFilteredMonthlyData.map((item, index) => {
                    const monthData = yearFilteredMonthlyData;
                    const previousInstalls = index > 0 ? monthData[index - 1].installs : 0;
                    const growth = index > 0 ? (item.installs - previousInstalls) / previousInstalls * 100 : null;
                    return <TableRow key={item.month} className="hover:bg-accent/50">
                              <TableCell className="font-medium">
                                {item.month}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-lg font-bold" style={{
                          color: selectedSeries.color
                        }}>
                                  {formatNumber(item.installs)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {growth !== null ? <div className={`inline-flex items-center gap-1 text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {growth >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                    <span>{Math.abs(growth).toFixed(1)}%</span>
                                  </div> : <span className="text-xs text-muted-foreground">—</span>}
                              </TableCell>
                            </TableRow>;
                  }) : <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            Nenhum dado mensal disponível para o período selecionado
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </>}
    </div>;
};