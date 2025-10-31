import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParsedWidget } from "@/utils/jsonParser";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Calendar, Check } from "lucide-react";

interface InstallationsChartsProps {
  widgets: ParsedWidget[];
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const InstallationsCharts = ({ widgets }: InstallationsChartsProps) => {
  const allInstallationsSeries = useMemo(() => {
    console.log('[InstallationsCharts] Total de widgets:', widgets.length);

    // Buscar TODOS os widgets de instalações
    const installationsWidgets = widgets.filter(
      (w) =>
        w.name?.toUpperCase().includes("INSTALAÇÕES") ||
        w.name?.toUpperCase().includes("INSTALACOES") ||
        w.name?.toUpperCase().includes("INSTALL") ||
        w.slug?.toLowerCase().includes("install") ||
        w.slug?.toLowerCase().includes("activation") ||
        w.category?.slug === 'activation'
    );

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
      const dateCandidates = [
        installationsWidget.xField,
        'createdAt',
        'date',
        'x',
        'time',
        'datetime',
        'day',
        'period'
      ].filter(Boolean);
      
      const valueCandidates = [
        installationsWidget.yField,
        'maxinstalls',
        'new_installs',
        'installs',
        'installation',
        'installations',
        'y',
        'value',
        'count',
        'total',
        'amount'
      ].filter(Boolean);

      let dateField = dateCandidates.find(f => sample[f as string] !== undefined) as string;
      let valueField = valueCandidates.find(f => 
        sample[f as string] !== undefined && !isNaN(Number(sample[f as string]))
      ) as string;

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
      const sorted = [...installationsWidget.data]
        .filter(it => it[dateField] && !isNaN(Date.parse(it[dateField])))
        .sort((a, b) => new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime());

      // Detectar se é série acumulada
      const nameHint = String(valueField).toLowerCase().includes('max') || 
                       String(installationsWidget?.config?.yAxis?.label || '').toLowerCase().includes('acumulad');
      const monotonic = sorted.every((it, i) => 
        i === 0 || Number(it[valueField]) >= Number(sorted[i - 1][valueField])
      );
      const isCumulative = nameHint || monotonic;

      // Agregar por data (desduplicar)
      const byDate = new Map<string, { date: string; value: number }>();
      for (const it of sorted) {
        const d = it[dateField] as string;
        const v = Number(it[valueField] ?? 0);
        
        if (!byDate.has(d)) {
          byDate.set(d, { date: d, value: isCumulative ? v : 0 });
        } else {
          const existing = byDate.get(d)!;
          if (isCumulative) {
            byDate.set(d, { date: d, value: Math.max(existing.value, v) });
          } else {
            byDate.set(d, { date: d, value: existing.value + v });
          }
        }
      }

      const datesAsc = [...byDate.values()].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Converter para série diária
      let timeSeriesData: { date: string; installs: number }[] = [];
      
      if (isCumulative) {
        for (let i = 0; i < datesAsc.length; i++) {
          const curr = datesAsc[i].value;
          const prev = i > 0 ? datesAsc[i - 1].value : 0;
          const daily = Math.max(0, curr - prev);
          timeSeriesData.push({ date: datesAsc[i].date, installs: daily });
        }
      } else {
        timeSeriesData = datesAsc.map(d => ({ date: d.date, installs: d.value }));
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
        growthPercentage = firstAvg === 0 ? (lastAvg > 0 ? 100 : 0) : ((lastAvg - firstAvg) / firstAvg) * 100;
      }

      // Agregar por dia da semana
      const byWeekday = timeSeriesData.reduce((acc: any, item) => {
        const date = new Date(item.date);
        const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" });

        if (!acc[weekday]) {
          acc[weekday] = { weekday, total: 0, count: 0 };
        }

        acc[weekday].total += item.installs;
        acc[weekday].count++;

        return acc;
      }, {});

      const weekdayOrder = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
      const weekdayData = weekdayOrder.map((day) => {
        const data = byWeekday[day];
        return data
          ? { weekday: day, average: Math.round(data.total / data.count) }
          : { weekday: day, average: 0 };
      });

      // Agregar por mês
      const byMonth = timeSeriesData.reduce((acc: any, item) => {
        const date = new Date(item.date);
        const month = date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

        if (!acc[month]) {
          acc[month] = { month, total: 0 };
        }

        acc[month].total += item.installs;

        return acc;
      }, {});

      const monthlyData = Object.values(byMonth).map((item: any) => ({
        month: item.month,
        installs: item.total,
      }));

      const seriesName = detectSeriesName(installationsWidget, index);

      return {
        id: `series-${index}`,
        name: seriesName,
        totalInstalls,
        averagePerDay,
        growthPercentage,
        timeSeriesData,
        weekdayData,
        monthlyData,
        dateRange: {
          start: timeSeriesData[0]?.date,
          end: timeSeriesData[timeSeriesData.length - 1]?.date,
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

  // Selecionar primeira série por padrão
  useEffect(() => {
    if (allInstallationsSeries && allInstallationsSeries.length > 0 && !selectedSeriesId) {
      setSelectedSeriesId(allInstallationsSeries[0].id);
    }
  }, [allInstallationsSeries, selectedSeriesId]);

  // Obter série selecionada
  const selectedSeries = allInstallationsSeries?.find(s => s.id === selectedSeriesId);

  if (!allInstallationsSeries || allInstallationsSeries.length === 0) {
    return (
      <Card>
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
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Card de Seleção de Arquivo */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione o Período</CardTitle>
          <CardDescription>Escolha qual arquivo de instalações deseja visualizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allInstallationsSeries.map((series) => (
              <button
                key={series.id}
                onClick={() => setSelectedSeriesId(series.id)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${selectedSeriesId === series.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-muted hover:border-primary/50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">{series.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(series.dateRange.start).toLocaleDateString("pt-BR", { month: 'short', year: 'numeric' })}
                      {' - '}
                      {new Date(series.dateRange.end).toLocaleDateString("pt-BR", { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {selectedSeriesId === series.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Total Acumulado</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: series.color }}>
                    {series.totalInstalls.toLocaleString("pt-BR")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Renderizar gráficos apenas da série selecionada */}
      {selectedSeries && (
        <>
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Instalações</CardDescription>
                <CardTitle className="text-3xl">{selectedSeries.totalInstalls.toLocaleString("pt-BR")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(selectedSeries.dateRange.start).toLocaleDateString("pt-BR")} -{" "}
                  {new Date(selectedSeries.dateRange.end).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Média por Dia</CardDescription>
                <CardTitle className="text-3xl">{Math.round(selectedSeries.averagePerDay).toLocaleString("pt-BR")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Instalações diárias em média</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Crescimento Semanal</CardDescription>
                <CardTitle className={`text-3xl flex items-center gap-2 ${selectedSeries.growthPercentage >= 0 ? "text-success" : "text-destructive"}`}>
                  {selectedSeries.growthPercentage >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  {Math.abs(selectedSeries.growthPercentage).toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Comparação última vs. primeira semana</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Área - Evolução Temporal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução das Instalações - {selectedSeries.name}</CardTitle>
              <CardDescription>Acompanhamento diário de novas instalações</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  installs: {
                    label: "Instalações",
                    color: selectedSeries.color,
                  },
                }}
                className="h-[350px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedSeries.timeSeriesData}>
                    <defs>
                      <linearGradient id={`colorInstalls-${selectedSeries.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedSeries.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={selectedSeries.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      className="text-xs"
                    />
                    <YAxis 
                      className="text-xs"
                      domain={[
                        (dataMin: number) => Math.floor(dataMin * 0.9),
                        'auto'
                      ]}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="installs" 
                      stroke={selectedSeries.color} 
                      fillOpacity={1} 
                      fill={`url(#colorInstalls-${selectedSeries.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráficos de Distribuição */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico por Dia da Semana */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Dia da Semana</CardTitle>
                <CardDescription>Média de instalações por dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    average: {
                      label: "Média de Instalações",
                      color: selectedSeries.color,
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedSeries.weekdayData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="weekday" className="text-xs" />
                      <YAxis 
                        className="text-xs"
                        domain={[
                          (dataMin: number) => Math.floor(dataMin * 0.9),
                          'auto'
                        ]}
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="average" fill={selectedSeries.color} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Gráfico Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Instalações por Mês</CardTitle>
                <CardDescription>Total acumulado mensal</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    installs: {
                      label: "Instalações",
                      color: selectedSeries.color,
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedSeries.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis 
                        className="text-xs"
                        domain={[
                          (dataMin: number) => Math.floor(dataMin * 0.9),
                          'auto'
                        ]}
                      />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="installs" fill={selectedSeries.color} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
