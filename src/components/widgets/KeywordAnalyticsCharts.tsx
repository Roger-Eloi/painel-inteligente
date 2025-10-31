import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
interface KeywordAnalyticsChartsProps {
  data: any[];
}
export const KeywordAnalyticsCharts = ({
  data
}: KeywordAnalyticsChartsProps) => {
  // Mapeamento de competitividade
  const competitivityMap: Record<string, string> = {
    'very low': 'Muito Baixa',
    'low': 'Baixa',
    'medium': 'Média',
    'high': 'Alta',
    'very high': 'Muito Alta'
  };

  // Processar dados de competitividade
  const competitivityCounts: Record<string, number> = {
    'Muito Baixa': 0,
    'Baixa': 0,
    'Média': 0,
    'Alta': 0,
    'Muito Alta': 0
  };
  data.forEach(row => {
    const compColumn = row.columns?.find((col: any) => col.field === 'competitivity');
    const comp = compColumn?.value?.toLowerCase();
    const mapped = competitivityMap[comp];
    if (mapped && competitivityCounts[mapped] !== undefined) {
      competitivityCounts[mapped]++;
    }
  });
  const competitivityData = Object.entries(competitivityCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Cores para competitividade (verde → amarelo → vermelho)
  const competitivityColors = ['hsl(var(--success))', '#86efac', '#fbbf24', '#fb923c', 'hsl(var(--destructive))'];

  // Processar dados de posição
  const positionRanges: Record<string, number> = {
    'Top 3 (1-3)': 0,
    'Top 10 (4-10)': 0,
    'Top 20 (11-20)': 0,
    'Top 50 (21-50)': 0,
    'Acima de 50': 0
  };
  data.forEach(row => {
    const posColumn = row.columns?.find((col: any) => col.field === 'position');
    const pos = Number(posColumn?.value);
    if (!isNaN(pos)) {
      if (pos <= 3) positionRanges['Top 3 (1-3)']++;else if (pos <= 10) positionRanges['Top 10 (4-10)']++;else if (pos <= 20) positionRanges['Top 20 (11-20)']++;else if (pos <= 50) positionRanges['Top 50 (21-50)']++;else positionRanges['Acima de 50']++;
    }
  });
  const positionData = Object.entries(positionRanges).filter(([_, value]) => value > 0).map(([name, value]) => ({
    name,
    value
  }));

  // Cores para posições (do melhor para o pior)
  const positionColors = ['hsl(var(--success))', '#86efac', '#fbbf24', '#fb923c', 'hsl(var(--destructive))'];

  // Calcular métricas totais
  const totalKeywords = data.length;
  const averageDifference = data.reduce((sum, row) => {
    const diffColumn = row.columns?.find((col: any) => col.field === 'difference');
    const diff = Number(diffColumn?.value);
    return sum + (isNaN(diff) ? 0 : diff);
  }, 0) / (data.length || 1);
  const trend = averageDifference > 0.1 ? 'up' : averageDifference < -0.1 ? 'down' : 'neutral';
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  return <div className="space-y-6 animate-fade-in">
      {/* Primeira linha: Resumo + Competitividade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de Keywords</p>
              <p className="text-3xl font-bold text-foreground">{totalKeywords}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Diferença Média (vs. D-1)</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${trendColor}`}>
                  {averageDifference > 0 ? '+' : ''}{averageDifference.toFixed(1)}
                </p>
                <TrendIcon className={`h-5 w-5 ${trendColor}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                posições {trend === 'up' ? 'ganhas' : trend === 'down' ? 'perdidas' : 'sem mudança'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Competitividade */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Competitividade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={competitivityData} layout="vertical" margin={{
              left: 20,
              right: 20
            }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" width={100} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {competitivityData.map((_, index) => <Cell key={`cell-${index}`} fill={competitivityColors[index]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha: Distribuição por Posição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Faixa de Posição</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={positionData} cx="50%" cy="50%" labelLine={false} label={({
                name,
                percent
              }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {positionData.map((_, index) => <Cell key={`cell-${index}`} fill={positionColors[index]} />)}
                </Pie>
                <Tooltip contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Espaço para futuro gráfico adicional */}
        
      </div>
    </div>;
};