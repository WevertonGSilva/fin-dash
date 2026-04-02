import { useState } from 'react';
import { Cliente, formatCurrency, formatPercent } from '@/mock/data';
import { ArrowUpDown } from 'lucide-react';

interface Props {
  clientes: Cliente[];
  onClickRow: (cliente: Cliente) => void;
}

type SortKey = keyof Pick<Cliente, 'nome' | 'filial' | 'quantidadeEntregas' | 'faturamentoMes' | 'variacaoAnterior' | 'ticketMedio' | 'status'>;

const STATUS_LABEL: Record<string, string> = { acima: 'Acima', esperado: 'Esperado', abaixo: 'Abaixo' };
const STATUS_BADGE: Record<string, string> = { acima: 'badge-green', esperado: 'badge-yellow', abaixo: 'badge-red' };
const STATUS_ICON: Record<string, string> = { acima: '🟢', esperado: '🟡', abaixo: '🔴' };

export default function DataTable({ clientes, onClickRow }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('faturamentoMes');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

  const sorted = [...clientes].sort((a, b) => {
    const va = a[sortKey];
    const vb = b[sortKey];
    if (typeof va === 'string') return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
    return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
  });

  const paged = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  }

  const headers: { key: SortKey; label: string }[] = [
    { key: 'nome', label: 'Cliente' },
    { key: 'filial', label: 'Filial' },
    { key: 'quantidadeEntregas', label: 'Entregas' },
    { key: 'faturamentoMes', label: 'Faturamento Mês' },
    { key: 'variacaoAnterior', label: 'Variação' },
    { key: 'ticketMedio', label: 'Ticket Médio' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-display font-semibold text-foreground">Clientes</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border">
              {headers.map(h => (
                <th
                  key={h.key}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort(h.key)}
                >
                  <span className="flex items-center gap-1">
                    {h.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map(c => {
              const aboveMeta = c.faturamentoMes / c.metaMensal > 1.1;
              return (
                <tr
                  key={c.id}
                  className={`border-b border-border cursor-pointer table-row-hover transition-colors ${aboveMeta ? 'table-row-above-meta' : ''}`}
                  onClick={() => onClickRow(c)}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{c.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.filial}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.quantidadeEntregas}</td>
                  <td className="px-4 py-3 text-foreground font-semibold">{formatCurrency(c.faturamentoMes)}</td>
                  <td className={`px-4 py-3 font-medium ${c.variacaoAnterior >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatPercent(c.variacaoAnterior)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(c.ticketMedio)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status]}`}>
                      {STATUS_ICON[c.status]} {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 text-xs rounded-md bg-secondary text-secondary-foreground disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-xs rounded-md bg-secondary text-secondary-foreground disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
