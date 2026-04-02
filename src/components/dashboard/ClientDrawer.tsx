import { useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Cliente, formatCurrency, formatCurrencyShort, MESES_LABELS_LIST } from '@/mock/data';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  cliente: Cliente | null;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = { acima: 'Acima da meta', esperado: 'No esperado', abaixo: 'Abaixo da meta' };
const STATUS_BADGE: Record<string, string> = { acima: 'badge-green', esperado: 'badge-yellow', abaixo: 'badge-red' };

export default function ClientDrawer({ cliente, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (cliente) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [cliente, onClose]);

  if (!cliente) return null;

  const historicoData = cliente.historico12Meses.map((v, i) => ({
    mes: MESES_LABELS_LIST[i],
    valor: v,
  }));

  const progressPct = Math.min((cliente.faturamentoMes / cliente.metaMensal) * 100, 100);

  // Variação últimos 3 meses
  const ultimos3 = cliente.historico12Meses.slice(-3);
  const variacoes3 = ultimos3.map((v, i) => {
    if (i === 0) return null;
    return parseFloat((((v - ultimos3[i - 1]) / ultimos3[i - 1]) * 100).toFixed(1));
  }).filter(v => v !== null) as number[];

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-card border-l border-border z-50 animate-slide-in-right overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">{cliente.nome}</h2>
              <p className="text-sm text-muted-foreground font-body">Filial: {cliente.filial}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${STATUS_BADGE[cliente.status]}`}>
                {STATUS_LABEL[cliente.status]}
              </span>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Faturamento + Meta */}
          <div className="bg-secondary rounded-lg p-4 mb-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-muted-foreground font-body">Faturamento Mês</span>
              <span className="text-lg font-display font-bold text-foreground">{formatCurrency(cliente.faturamentoMes)}</span>
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-muted-foreground font-body">Meta</span>
              <span className="text-sm font-body text-muted-foreground">{formatCurrency(cliente.metaMensal)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${progressPct >= 100 ? 'bg-success' : progressPct >= 85 ? 'bg-primary' : 'bg-destructive'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{progressPct.toFixed(1)}% da meta</p>
          </div>

          {/* Mini Chart */}
          <div className="mb-4">
            <h4 className="text-sm font-display font-semibold text-foreground mb-2">Histórico 12 Meses</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={historicoData}>
                <XAxis dataKey="mes" stroke="hsl(215 15% 55%)" fontSize={9} fontFamily="DM Sans" interval={2} />
                <YAxis stroke="hsl(215 15% 55%)" fontSize={9} fontFamily="DM Sans" tickFormatter={formatCurrencyShort} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12151C', border: '1px solid hsl(222 20% 16%)', borderRadius: '8px', fontFamily: 'DM Sans', fontSize: '12px' }}
                  formatter={(v: number) => [formatCurrency(v), 'Faturamento']}
                />
                <Line type="monotone" dataKey="valor" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Rotas */}
          <div className="mb-4">
            <h4 className="text-sm font-display font-semibold text-foreground mb-2">Top 3 Rotas</h4>
            <div className="space-y-2">
              {cliente.topRotas.map((r, i) => (
                <div key={i} className="flex justify-between items-center bg-secondary rounded-lg px-3 py-2">
                  <span className="text-sm font-body text-foreground">{r.rota}</span>
                  <span className="text-sm font-body font-semibold text-primary">{formatCurrency(r.valor)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-xs text-muted-foreground font-body">Entregas no Mês</p>
              <p className="text-lg font-display font-bold text-foreground">{cliente.quantidadeEntregas}</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-xs text-muted-foreground font-body">Ticket Médio</p>
              <p className="text-lg font-display font-bold text-foreground">{formatCurrency(cliente.ticketMedio)}</p>
            </div>
          </div>

          {/* Variação últimos meses */}
          <div className="mb-4">
            <h4 className="text-sm font-display font-semibold text-foreground mb-2">Variação Mês a Mês</h4>
            <div className="flex gap-3">
              {variacoes3.map((v, i) => (
                <div key={i} className={`flex items-center gap-1 text-sm font-body ${v >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {v >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(v).toFixed(1)}%
                </div>
              ))}
            </div>
          </div>

          {/* Últimas Operações */}
          <div>
            <h4 className="text-sm font-display font-semibold text-foreground mb-2">Últimas 5 Operações</h4>
            <div className="space-y-2">
              {cliente.ultimasOperacoes.map((op, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-body bg-secondary rounded-lg px-3 py-2">
                  <div>
                    <span className="text-foreground">{op.data}</span>
                    <span className="text-muted-foreground ml-2">{op.rota}</span>
                  </div>
                  <span className="text-foreground font-semibold">{formatCurrency(op.valor)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
