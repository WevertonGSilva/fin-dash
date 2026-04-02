import { formatCurrency, formatPercent } from '@/mock/data';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
  variation?: number;
  secondaryLabel?: string;
  secondaryValue?: string;
  onClick?: () => void;
  delay?: number;
}

export default function KPICard({ title, value, subtitle, progress, variation, secondaryLabel, secondaryValue, onClick, delay = 0 }: Props) {
  return (
    <div
      className="kpi-card opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">{title}</p>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      
      {progress !== undefined && (
        <div className="mt-2">
          <div className="w-full h-1.5 rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% da meta</p>
        </div>
      )}

      {variation !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-sm ${variation >= 0 ? 'text-success' : 'text-destructive'}`}>
          {variation >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span className="font-body font-medium">{formatPercent(variation)}</span>
        </div>
      )}

      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}

      {secondaryLabel && (
        <div className="flex justify-between mt-3 pt-3 border-t border-border text-xs">
          <div>
            <span className="text-muted-foreground">Própria</span>
            <p className="text-foreground font-semibold font-display text-sm">{value}</p>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground">Terceiros</span>
            <p className="text-foreground font-semibold font-display text-sm">{secondaryValue}</p>
          </div>
        </div>
      )}
    </div>
  );
}
