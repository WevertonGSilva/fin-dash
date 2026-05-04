import { ctesFaturados, formatCurrency, totalCtesFaturados, valorTotalCtes, type CTE } from '@/mock/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Receipt } from 'lucide-react';
import { useState } from 'react';

interface Props {
  limit?: number;
}

export default function CTEList({ limit = 10 }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visible: CTE[] = showAll ? ctesFaturados : ctesFaturados.slice(0, limit);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Últimos CTEs Faturados
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Conhecimentos de transporte emitidos recentemente
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-secondary rounded-lg px-4 py-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Total CTEs</p>
              <p className="text-base font-display font-bold text-foreground leading-tight">{totalCtesFaturados}</p>
            </div>
          </div>
          <div className="bg-secondary rounded-lg px-4 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body">Valor Total</p>
            <p className="text-base font-display font-bold text-primary leading-tight">{formatCurrency(valorTotalCtes)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-body">Nº CTE</TableHead>
              <TableHead className="font-body">Cliente</TableHead>
              <TableHead className="font-body">Origem</TableHead>
              <TableHead className="font-body">Destino</TableHead>
              <TableHead className="font-body">Data</TableHead>
              <TableHead className="font-body text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((cte) => (
              <TableRow key={cte.numero} className="border-border cursor-pointer">
                <TableCell className="font-mono text-sm text-primary font-semibold">{cte.numero}</TableCell>
                <TableCell className="font-body text-foreground">{cte.cliente}</TableCell>
                <TableCell className="font-body text-muted-foreground text-sm">{cte.origem}</TableCell>
                <TableCell className="font-body text-muted-foreground text-sm">{cte.destino}</TableCell>
                <TableCell className="font-body text-muted-foreground text-xs">{cte.dataFaturamento}</TableCell>
                <TableCell className="font-body text-right font-semibold text-foreground">
                  {formatCurrency(cte.valor)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {ctesFaturados.length > limit && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-primary hover:underline font-body cursor-pointer"
          >
            {showAll ? 'Mostrar menos' : `Ver todos (${ctesFaturados.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
