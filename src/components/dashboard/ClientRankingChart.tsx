import { Cliente, formatCurrency, formatCurrencyShort } from '@/mock/data';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  clientes: Cliente[];
  totalMes: number;
  onClickCliente: (cliente: Cliente) => void;
}

export default function ClientRankingChart({ clientes, totalMes, onClickCliente }: Props) {
  const top10 = [...clientes].sort((a, b) => b.faturamentoMes - a.faturamentoMes).slice(0, 10);
  const maxVal = top10[0]?.faturamentoMes || 1;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">Top 10 Clientes</h3>
      <div className="space-y-2.5">
        {top10.map((c, i) => {
          const pct = ((c.faturamentoMes / totalMes) * 100).toFixed(1);
          const barWidth = (c.faturamentoMes / maxVal) * 100;
          return (
            <div
              key={c.id}
              className="cursor-pointer group hover:bg-secondary/50 rounded-lg p-2 transition-colors"
              onClick={() => onClickCliente(c)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 font-body">{i + 1}.</span>
                  <span className="text-sm font-body font-medium text-foreground">{c.nome}</span>
                  <span className={`inline-flex items-center gap-0.5 text-xs ${c.variacaoAnterior >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {c.variacaoAnterior >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(c.variacaoAnterior).toFixed(1)}%
                  </span>
                </div>
                <div className="text-right text-xs font-body">
                  <span className="text-foreground font-semibold">{formatCurrencyShort(c.faturamentoMes)}</span>
                  <span className="text-muted-foreground ml-2">{pct}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full animate-grow-bar origin-left"
                  style={{
                    width: `${barWidth}%`,
                    background: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
