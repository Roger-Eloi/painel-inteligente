import { useMemo } from "react";
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
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface InstallationsChartsProps {
  widgets: ParsedWidget[];
}

export const InstallationsCharts = ({ widgets }: InstallationsChartsProps) => {
  const installationsData = useMemo(() => {
    // DEBUG: Log dos widgets recebidos
    console.log('[InstallationsCharts] Widgets recebidos:', widgets);
    console.log('[InstallationsCharts] Total de widgets:', widgets.length);
    
    widgets.forEach((w, idx) => {
      console.log(`[InstallationsCharts] Widget ${idx}:`, {
        name: w.name,
        slug: w.slug,
        category: w.category,
        dataLength: w.data?.length,
        sampleData: w.data?.[0]
      });
    });
    
    // Buscar widget com critérios mais flexíveis
    const installationsWidget = widgets.find(
      (w) =>
        w.name?.toUpperCase().includes("INSTALAÇÕES") ||
        w.name?.toUpperCase().includes("INSTALACOES") ||
        w.name?.toUpperCase().includes("INSTALL") ||
        w.slug?.toLowerCase().includes("install") ||
        w.slug?.toLowerCase().includes("activation") ||
        w.category?.slug === 'activation'
    );
    
    console.log('[InstallationsCharts] Widget encontrado:', installationsWidget);
    
    if (!installationsWidget?.data || installationsWidget.data.length === 0) {
      console.warn('[InstallationsCharts] Nenhum dado encontrado no widget');
      return null;
    }
    
    console.log('[InstallationsCharts] Primeiros 3 registros:', installationsWidget.data.slice(0, 3));

    // Detectar automaticamente os campos de data e valor
    const detectFields = (data: any[]) => {
      const sample = data[0];
      
      // Possíveis nomes de campo de data
      const dateFields = ['date', 'x', 'time', 'datetime', 'day', 'period'];
      const dateField = dateFields.find(f => sample[f] !== undefined);
      
      // Possíveis nomes de campo de valor
      const valueFields = ['y', 'value', 'installs', 'installations', 'count', 'total', 'amount'];
      const valueField = valueFields.find(f => sample[f] !== undefined && !isNaN(Number(sample[f])));
      
      console.log('[InstallationsCharts] Campos detectados:', { dateField, valueField, sample });
      
      return { dateField, valueField };
    };

    const { dateField, valueField } = detectFields(installationsWidget.data);

    if (!dateField || !valueField) {
      console.error('[InstallationsCharts] Não foi possível detectar campos de data ou valor');
      return null;
    }

    // Agregar e processar dados por data usando os campos detectados
    const aggregatedByDate = installationsWidget.data.reduce((acc: any, item: any) => {
      const date = item[dateField];
      if (!date) return acc;

      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 };
      }

      // Somar valores usando o campo detectado
      const value = Number(item[valueField] || 0);
      acc[date].total += value;
      acc[date].count++;

      return acc;
    }, {});

    console.log('[InstallationsCharts] Dados agregados por data:', Object.keys(aggregatedByDate).length, 'datas únicas');

    // Converter para array e ordenar por data
    const timeSeriesData = Object.values(aggregatedByDate)
      .map((item: any) => ({
        date: item.date,
        installs: item.total,
      }))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calcular métricas
    const totalInstalls = timeSeriesData.reduce((sum: number, item: any) => sum + item.installs, 0);
    const averagePerDay = totalInstalls / timeSeriesData.length;

    // Calcular crescimento (comparar primeira e última semana)
    const weekData = timeSeriesData.slice(-7);
    const firstWeekAvg = timeSeriesData.slice(0, 7).reduce((sum: any, item: any) => sum + item.installs, 0) / 7;
    const lastWeekAvg = weekData.reduce((sum: any, item: any) => sum + item.installs, 0) / 7;
    const growthPercentage = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100;

    // Agregar por dia da semana
    const byWeekday = timeSeriesData.reduce((acc: any, item: any) => {
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
    const weekdayData = weekdayOrder
      .map((day) => {
        const data = byWeekday[day];
        return data
          ? {
              weekday: day,
              average: Math.round(data.total / data.count),
            }
          : { weekday: day, average: 0 };
      });

    // Agregar por mês
    const byMonth = timeSeriesData.reduce((acc: any, item: any) => {
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

    return {
      timeSeriesData,
      totalInstalls,
      averagePerDay,
      growthPercentage,
      weekdayData,
      monthlyData,
      dateRange: {
        start: timeSeriesData[0]?.date,
        end: timeSeriesData[timeSeriesData.length - 1]?.date,
      },
    };
  }, [widgets]);

  if (!installationsData) {
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

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Instalações</CardDescription>
            <CardTitle className="text-3xl">{installationsData.totalInstalls.toLocaleString("pt-BR")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(installationsData.dateRange.start).toLocaleDateString("pt-BR")} -{" "}
              {new Date(installationsData.dateRange.end).toLocaleDateString("pt-BR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Média por Dia</CardDescription>
            <CardTitle className="text-3xl">{Math.round(installationsData.averagePerDay).toLocaleString("pt-BR")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Instalações diárias em média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Crescimento Semanal</CardDescription>
            <CardTitle className={`text-3xl flex items-center gap-2 ${installationsData.growthPercentage >= 0 ? "text-success" : "text-destructive"}`}>
              {installationsData.growthPercentage >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              {Math.abs(installationsData.growthPercentage).toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Comparação última vs. primeira semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha - Evolução Temporal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução das Instalações ao Longo do Tempo</CardTitle>
          <CardDescription>Acompanhamento diário de novas instalações</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              installs: {
                label: "Instalações",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={installationsData.timeSeriesData}>
                <defs>
                  <linearGradient id="colorInstalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="installs" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorInstalls)" />
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
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={installationsData.weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="weekday" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="average" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
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
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={installationsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="installs" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
