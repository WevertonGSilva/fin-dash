import { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts';
import {
  veiculosTotal, valorMedioPorVeiculo,
  veiculosPorClassificacao, tiposVeiculo, mediaMensalVeiculo,
  formatCurrency, formatCurrencyShort,
} from '@/mock/data';
import { Truck } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--accent))', 'hsl(var(--chart-4, 200 80% 60%))', 'hsl(var(--muted-foreground))', 'hsl(var(--destructive))', 'hsl(var(--warning, 40 90% 55%))'];

export default function VeiculosPanel() {
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);

  const totalFat = veiculosPorClassificacao.reduce((s, v) => s + v.valor, 0);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <Truck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">Painel de Veículos</h2>
          <p className="text-sm text-muted-foreground font-body">Faturamento gerado pela frota</p>
        </div>
      </div>

      {/* KPIs destacados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Veículos Ativos</p>
          <p className="text-3xl font-display font-bold text-primary">{veiculosTotal}</p>
          <p className="text-xs text-muted-foreground mt-1">Frota total operando</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Valor Médio / Veículo</p>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(valorMedioPorVeiculo)}</p>
          <p className="text-xs text-muted-foreground mt-1">Faturamento médio anual</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Faturamento Total</p>
          <p className="text-3xl font-display font-bold text-foreground">{formatCurrencyShort(totalFat)}</p>
          <p className="text-xs text-success mt-1">Frota Própria lidera (57,5%)</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Veículo Top</p>
          <p className="text-2xl font-display font-bold text-foreground">Cavalo Trucado</p>
          <p className="text-xs text-muted-foreground mt-1">233 unidades · 51,7% da frota</p>
        </div>
      </div>

      {/* Composição da frota */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Composição da Frota (quem fatura)</h3>
          <div className="space-y-3">
            {veiculosPorClassificacao.map((v, i) => (
              <div key={v.classificacao}>
                <div className="flex justify-between text-sm font-body mb-1">
                  <span className="text-foreground font-medium">{v.classificacao}</span>
                  <span className="text-primary font-semibold">{formatCurrency(v.valor)} <span className="text-muted-foreground font-normal">({v.percentual.toFixed(1)}%)</span></span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${v.percentual}%`, backgroundColor: COLORS[i] }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Média: {formatCurrency(v.mediaFaturamento)}</span>
                  <span>Projeção: {formatCurrencyShort(v.projecao)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground font-body">
            ➡️ Mais da metade do faturamento vem da <span className="text-foreground font-semibold">frota própria</span>.
          </div>
        </div>

        {/* Pizza de tipos */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Distribuição por Tipo de Veículo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={tiposVeiculo}
                dataKey="quantidade"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={2}
                onClick={(d: any) => setSelectedTipo(d.tipo === selectedTipo ? null : d.tipo)}
                className="cursor-pointer"
              >
                {tiposVeiculo.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke={selectedTipo === tiposVeiculo[i].tipo ? 'hsl(var(--foreground))' : 'transparent'} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                formatter={(v: any, _n: any, p: any) => [`${v} veíc. (${p.payload.percentual.toFixed(1)}%)`, p.payload.tipo]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
            {tiposVeiculo.slice(0, 4).map((t, i) => (
              <div key={t.tipo} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i] }} />
                <span className="text-muted-foreground truncate">{t.tipo}</span>
                <span className="text-foreground font-semibold ml-auto">{t.quantidade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking faturamento por tipo + Média mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">Faturamento por Tipo de Veículo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tiposVeiculo} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => formatCurrencyShort(v)} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis dataKey="tipo" type="category" width={110} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                formatter={(v: any) => formatCurrency(v as number)}
              />
              <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]}>
                <LabelList dataKey="valor" position="right" formatter={(v: number) => formatCurrencyShort(v)} fill="hsl(var(--foreground))" fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-display font-semibold text-foreground mb-1">Média Mensal por Veículo</h3>
          <p className="text-xs text-muted-foreground font-body mb-3">Pico em <span className="text-foreground font-semibold">Mar (R$ 66 mil)</span> · Mai ainda em curso</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mediaMensalVeiculo}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                formatter={(v: any) => formatCurrency(v as number)}
              />
              <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="valor" position="top" formatter={(v: number) => `${(v / 1000).toFixed(0)}k`} fill="hsl(var(--foreground))" fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight final */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/30 rounded-xl p-5">
        <h4 className="text-sm font-display font-semibold text-primary uppercase tracking-wider mb-2">Leitura Rápida</h4>
        <ul className="space-y-1.5 text-sm font-body text-foreground">
          <li>• Receita é puxada pela <strong>frota própria + Cavalo Trucado</strong> — qualquer variação nesse grupo move o resultado da empresa inteira.</li>
          <li>• <strong>Cavalo Trucado</strong> concentra 51,7% da frota e R$ 42 mi em faturamento (a maior fatia isolada).</li>
          <li>• Tendência mensal mostra <strong>pico em março</strong> e queda forte em abril/maio.</li>
        </ul>
      </div>
    </section>
  );
}
