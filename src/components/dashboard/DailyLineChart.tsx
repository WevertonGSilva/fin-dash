import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { DadosDiarios, formatCurrency, formatCurrencyShort, META_DIARIA } from '@/mock/data';

interface Props {
  data: DadosDiarios[];
  onClickDay: (dia: number) => void;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DadosDiarios;
  const acumulado = d.valor; // simplified
  const pctMeta = ((d.valor / META_DIARIA) * 100).toFixed(1);
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm font-body">
      <p className="font-semibold text-foreground">{d.data}</p>
      <p className="text-primary">{formatCurrency(d.valor)}</p>
      <p className="text-muted-foreground">{pctMeta}% da meta diária</p>
    </div>
  );
}

export default function DailyLineChart({ data, onClickDay }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">Faturamento Diário — Mês Atual</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} onClick={(e) => {
          if (e?.activePayload?.[0]) {
            onClickDay(e.activePayload[0].payload.dia);
          }
        }}>
          <defs>
            <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 16%)" />
          <XAxis dataKey="dia" stroke="hsl(215 15% 55%)" fontSize={12} fontFamily="DM Sans" />
          <YAxis stroke="hsl(215 15% 55%)" fontSize={12} fontFamily="DM Sans" tickFormatter={formatCurrencyShort} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={META_DIARIA} stroke="#3B82F6" strokeDasharray="5 5" label={{ value: 'Meta', fill: '#3B82F6', fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="url(#gradientArea)"
            dot={{ r: 4, fill: '#F59E0B', stroke: '#0A0C10', strokeWidth: 2, cursor: 'pointer' }}
            activeDot={{ r: 6, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
