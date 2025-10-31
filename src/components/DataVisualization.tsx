import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Database, Activity } from "lucide-react";

interface DataVisualizationProps {
  data: Array<{ name: string; data: any }>;
}

export const DataVisualization = ({ data }: DataVisualizationProps) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Aggregate all JSON data
    const allData = data.map(file => file.data).flat();
    
    // Try to detect numeric fields for visualization
    const sample = Array.isArray(allData) ? allData[0] : allData;
    if (!sample) return null;

    const numericFields: string[] = [];
    const categoricalFields: string[] = [];

    Object.entries(sample).forEach(([key, value]) => {
      if (typeof value === 'number') {
        numericFields.push(key);
      } else if (typeof value === 'string') {
        categoricalFields.push(key);
      }
    });

    // Prepare data for charts
    const chartData = Array.isArray(allData) 
      ? allData.slice(0, 20).map((item, index) => ({
          name: item[categoricalFields[0]] || `Item ${index + 1}`,
          value: item[numericFields[0]] || 0,
          ...item
        }))
      : [];

    return {
      chartData,
      numericFields,
      categoricalFields,
      totalRecords: Array.isArray(allData) ? allData.length : 1,
      summary: {
        files: data.length,
        records: Array.isArray(allData) ? allData.length : 1,
        fields: numericFields.length + categoricalFields.length
      }
    };
  }, [data]);

  if (!processedData) {
    return (
      <Card className="p-8 text-center bg-gradient-card">
        <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Aguardando Dados</h3>
        <p className="text-sm text-muted-foreground">
          Faça upload de arquivos JSON para visualizar os dados
        </p>
      </Card>
    );
  }

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-card hover:shadow-soft transition-shadow animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arquivos</p>
              <p className="text-2xl font-bold">{processedData.summary.files}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card hover:shadow-soft transition-shadow animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-accent/10 p-3">
              <Activity className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registros</p>
              <p className="text-2xl font-bold">{processedData.summary.records}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card hover:shadow-soft transition-shadow animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-success/10 p-3">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Campos</p>
              <p className="text-2xl font-bold">{processedData.summary.fields}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {processedData.chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Gráfico de Barras
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-gradient-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Gráfico de Linha
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {processedData.chartData.length <= 10 && (
            <Card className="p-6 bg-gradient-card animate-fade-in lg:col-span-2" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-success" />
                Distribuição
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processedData.chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {processedData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
