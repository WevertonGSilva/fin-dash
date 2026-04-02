import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DadosFilial, formatCurrency, formatCurrencyShort } from '@/mock/data';

interface Props {
  data: DadosFilial[];
  onClickFilial: (filial: string) => void;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const atual = payload.find((p: any) => p.dataKey === 'mesAtual')?.value || 0;
  const anterior = payload.find((p: any) => p.dataKey === 'mesAnterior')?.value || 0;
  const variacao = anterior > 0 ? (((atual - anterior) / anterior) * 100).toFixed(1) : '0.0';
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm font-body">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-primary">Atual: {formatCurrency(atual)}</p>
      <p className="text-muted-foreground">Anterior: {formatCurrency(anterior)}</p>
      <p className={`${Number(variacao) >= 0 ? 'text-success' : 'text-destructive'}`}>Variação: {variacao}%</p>
    </div>
  );
}

export default function FilialGroupedChart({ data, onClickFilial }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">Faturamento por Filial</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} onClick={(e) => {
          if (e?.activePayload?.[0]) {
            onClickFilial(e.activePayload[0].payload.filial);
          }
        }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 16%)" />
          <XAxis dataKey="filial" stroke="hsl(215 15% 55%)" fontSize={12} fontFamily="DM Sans" />
          <YAxis stroke="hsl(215 15% 55%)" fontSize={12} fontFamily="DM Sans" tickFormatter={formatCurrencyShort} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
          <Bar dataKey="mesAtual" name="Mês Atual" fill="#F59E0B" radius={[4, 4, 0, 0]} cursor="pointer" />
          <Bar dataKey="mesAnterior" name="Mês Anterior" fill="#4B5563" radius={[4, 4, 0, 0]} cursor="pointer" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
