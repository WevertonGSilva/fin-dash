import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import { DadosMensais, formatCurrency, formatCurrencyShort, META_MENSAL } from '@/mock/data';

interface Props {
  data: DadosMensais[];
  currentMonthIndex: number;
  onClickMonth: (index: number) => void;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DadosMensais;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm font-body">
      <p className="font-semibold text-foreground">{d.mes}</p>
      <p className="text-primary">{formatCurrency(d.valor)}</p>
    </div>
  );
}

export default function MonthlyBarChart({ data, currentMonthIndex, onClickMonth }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">Faturamento Mensal — Últimos 12 Meses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} onClick={(e) => {
          if (e?.activeTooltipIndex !== undefined) {
            onClickMonth(e.activeTooltipIndex);
          }
        }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 16%)" />
          <XAxis dataKey="mes" stroke="hsl(215 15% 55%)" fontSize={11} fontFamily="DM Sans" />
          <YAxis stroke="hsl(215 15% 55%)" fontSize={12} fontFamily="DM Sans" tickFormatter={formatCurrencyShort} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={META_MENSAL} stroke="#3B82F6" strokeDasharray="5 5" />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]} cursor="pointer">
            {data.map((_, i) => (
              <Cell key={i} fill={i === currentMonthIndex ? '#F59E0B' : '#4B5563'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
