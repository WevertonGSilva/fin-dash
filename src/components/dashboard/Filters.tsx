import { FILIAIS_LIST, MESES_LABELS_LIST } from '@/mock/data';
import type { ClienteStatus, Filial, TipoFrota } from '@/mock/data';

interface Props {
  mesIndex: number;
  filial: Filial | 'Todas';
  tipoFrota: TipoFrota | 'todos';
  statusFilter: ClienteStatus | 'todos';
  onMesChange: (index: number) => void;
  onFilialChange: (filial: Filial | 'Todas') => void;
  onFrotaChange: (tipo: TipoFrota | 'todos') => void;
  onStatusChange: (status: ClienteStatus | 'todos') => void;
}

export default function Filters({ mesIndex, filial, tipoFrota, statusFilter, onMesChange, onFilialChange, onFrotaChange, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <select
        value={mesIndex}
        onChange={e => onMesChange(Number(e.target.value))}
        className="bg-secondary text-secondary-foreground border border-border rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {MESES_LABELS_LIST.map((m, i) => (
          <option key={i} value={i}>{m}</option>
        ))}
      </select>

      <select
        value={filial}
        onChange={e => onFilialChange(e.target.value as Filial | 'Todas')}
        className="bg-secondary text-secondary-foreground border border-border rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="Todas">Todas as Filiais</option>
        {FILIAIS_LIST.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <select
        value={tipoFrota}
        onChange={e => onFrotaChange(e.target.value as TipoFrota | 'todos')}
        className="bg-secondary text-secondary-foreground border border-border rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="todos">Todos os Tipos</option>
        <option value="propria">Frota Própria</option>
        <option value="terceiros">Terceiros</option>
      </select>

      <select
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value as ClienteStatus | 'todos')}
        className="bg-secondary text-secondary-foreground border border-border rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="todos">Todos os Status</option>
        <option value="acima">Acima da meta</option>
        <option value="esperado">No esperado</option>
        <option value="abaixo">Abaixo da meta</option>
      </select>
    </div>
  );
}
