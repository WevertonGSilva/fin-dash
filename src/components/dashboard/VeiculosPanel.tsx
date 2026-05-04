import { useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, LineChart, Line,
} from 'recharts';
import {
  veiculosTotal, valorMedioPorVeiculo,
  veiculosPorClassificacao, tiposVeiculo, mediaMensalVeiculo,
  ultimosVeiculosFaturados,
  formatCurrency, formatCurrencyShort,
} from '@/mock/data';
import { Truck, ArrowLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-green))',
  'hsl(var(--chart-amber))',
  'hsl(var(--accent))',
  'hsl(var(--chart-red))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--secondary-foreground))',
];

type DrillState =
  | { level: 'overview' }
  | { level: 'classificacao'; key: string }
  | { level: 'tipo'; key: string };

export default function VeiculosPanel() {
  const [drill, setDrill] = useState<DrillState>({ level: 'overview' });
  const [showAll, setShowAll] = useState(false);

  const totalFat = veiculosPorClassificacao.reduce((s, v) => s + v.valor, 0);

  const filteredVeics = useMemo(() => {
    if (drill.level === 'classificacao') return ultimosVeiculosFaturados.filter(v => v.classificacao === drill.key);
    if (drill.level === 'tipo') return ultimosVeiculosFaturados.filter(v => v.tipo === drill.key);
    return ultimosVeiculosFaturados;
  }, [drill]);

  const listVisible = showAll ? filteredVeics : filteredVeics.slice(0, 8);

  return (
    <section className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Painel de Veículos</h2>
            <p className="text-sm text-muted-foreground font-body">Resumo da frota — clique nos gráficos para detalhar</p>
          </div>
        </div>
        {drill.level !== 'overview' && (
          <button
            onClick={() => { setDrill({ level: 'overview' }); setShowAll(false); }}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline font-body cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à visão geral
          </button>
        )}
      </div>

      {/* KPIs resumo (clicáveis) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Veículos Ativos</p>
          <p className="text-3xl font-display font-bold text-primary">{veiculosTotal}</p>
          <p className="text-xs text-muted-foreground mt-1">Frota total</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Médio / Veículo</p>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrencyShort(valorMedioPorVeiculo)}</p>
          <p className="text-xs text-muted-foreground mt-1">Faturamento médio</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Faturamento</p>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrencyShort(totalFat)}</p>
          <p className="text-xs text-[hsl(var(--chart-green))] mt-1">Própria lidera 57,5%</p>
        </div>
        <button
          onClick={() => setDrill({ level: 'tipo', key: 'Cavalo Trucado' })}
          className="kpi-card text-left cursor-pointer hover:border-primary transition-colors"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Veículo Top</p>
          <p className="text-2xl font-display font-bold text-foreground">Cavalo Trucado</p>
          <p className="text-xs text-primary mt-1 flex items-center gap-1">Detalhar <ChevronRight className="w-3 h-3" /></p>
        </button>
      </div>

      {drill.level === 'overview' && (
        <>
          {/* Resumos em gráficos — clicáveis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pizza por classificação */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-foreground">Faturamento por Classificação</h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">clique para detalhar</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={veiculosPorClassificacao}
                    dataKey="valor"
                    nameKey="classificacao"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={2}
                    onClick={(d: any) => setDrill({ level: 'classificacao', key: d.classificacao })}
                    className="cursor-pointer"
                  >
                    {veiculosPorClassificacao.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    formatter={(v: any, _n: any, p: any) => [`${formatCurrency(v)} (${p.payload.percentual.toFixed(1)}%)`, p.payload.classificacao]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                {veiculosPorClassificacao.map((c, i) => (
                  <button
                    key={c.classificacao}
                    onClick={() => setDrill({ level: 'classificacao', key: c.classificacao })}
                    className="flex items-center gap-1.5 hover:bg-secondary rounded px-2 py-1 cursor-pointer text-left"
                  >
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] }} />
                    <span className="text-muted-foreground truncate">{c.classificacao}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Barras horizontais por tipo */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-foreground">Faturamento por Tipo de Veículo</h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">clique para detalhar</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tiposVeiculo} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => formatCurrencyShort(v)} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="tipo" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                    formatter={(v: any) => formatCurrency(v as number)}
                  />
                  <Bar
                    dataKey="valor"
                    radius={[0, 6, 6, 0]}
                    onClick={(d: any) => setDrill({ level: 'tipo', key: d.tipo })}
                    className="cursor-pointer"
                  >
                    {tiposVeiculo.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                    <LabelList dataKey="valor" position="right" formatter={(v: number) => formatCurrencyShort(v)} fill="hsl(var(--foreground))" fontSize={11} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tendência mensal */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">Tendência — Média Mensal por Veículo</h3>
            <p className="text-xs text-muted-foreground font-body mb-3">Pico em <span className="text-foreground font-semibold">Mar</span> · queda em Abr/Mai</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mediaMensalVeiculo}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  formatter={(v: any) => formatCurrency(v as number)}
                />
                <Line type="monotone" dataKey="valor" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5, fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Painel drill-down (resumo do filtro) */}
      {drill.level !== 'overview' && (
        <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/30 rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-wider text-primary font-body mb-1">Detalhamento</p>
          <h3 className="text-xl font-display font-bold text-foreground">
            {drill.level === 'classificacao' ? `Classificação: ${drill.key}` : `Tipo: ${drill.key}`}
          </h3>
          <p className="text-sm text-muted-foreground font-body mt-1">
            {filteredVeics.length} veículos faturados · {formatCurrency(filteredVeics.reduce((s, v) => s + v.valor, 0))}
          </p>
        </div>
      )}

      {/* Listagem de últimos veículos faturados */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Últimos Veículos Faturados
            </h3>
            <p className="text-xs text-muted-foreground font-body mt-1">
              {drill.level === 'overview' ? 'Operações recentes da frota' : `Filtrado por ${drill.level}: ${drill.key}`}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-secondary rounded-lg px-4 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Operações</p>
              <p className="text-base font-display font-bold text-foreground leading-tight">{filteredVeics.length}</p>
            </div>
            <div className="bg-secondary rounded-lg px-4 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Total</p>
              <p className="text-base font-display font-bold text-primary leading-tight">
                {formatCurrencyShort(filteredVeics.reduce((s, v) => s + v.valor, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-body">Placa</TableHead>
                <TableHead className="font-body">Tipo</TableHead>
                <TableHead className="font-body">Classificação</TableHead>
                <TableHead className="font-body">Cliente</TableHead>
                <TableHead className="font-body">Rota</TableHead>
                <TableHead className="font-body">Data</TableHead>
                <TableHead className="font-body text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listVisible.map((v, i) => (
                <TableRow key={`${v.placa}-${i}`} className="border-border hover:bg-secondary/50 cursor-pointer">
                  <TableCell className="font-mono text-sm text-primary font-semibold">{v.placa}</TableCell>
                  <TableCell className="font-body text-foreground text-sm">{v.tipo}</TableCell>
                  <TableCell className="font-body text-muted-foreground text-sm">{v.classificacao}</TableCell>
                  <TableCell className="font-body text-foreground text-sm">{v.cliente}</TableCell>
                  <TableCell className="font-body text-muted-foreground text-sm">{v.rota}</TableCell>
                  <TableCell className="font-body text-muted-foreground text-xs">{v.data}</TableCell>
                  <TableCell className="font-body text-right font-semibold text-foreground">
                    {formatCurrency(v.valor)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredVeics.length > 8 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary hover:underline font-body cursor-pointer"
            >
              {showAll ? 'Mostrar menos' : `Ver todos (${filteredVeics.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
