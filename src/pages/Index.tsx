import { useReducer, useMemo } from 'react';
import BreadcrumbNav, { BreadcrumbItem } from '@/components/dashboard/BreadcrumbNav';
import KPICard from '@/components/dashboard/KPICard';
import DailyLineChart from '@/components/dashboard/DailyLineChart';
import MonthlyBarChart from '@/components/dashboard/MonthlyBarChart';
import ClientRankingChart from '@/components/dashboard/ClientRankingChart';
import FilialGroupedChart from '@/components/dashboard/FilialGroupedChart';
import DataTable from '@/components/dashboard/DataTable';
import ClientDrawer from '@/components/dashboard/ClientDrawer';
import Filters from '@/components/dashboard/Filters';
import CTEList from '@/components/dashboard/CTEList';
import VeiculosPanel from '@/components/dashboard/VeiculosPanel';
import {
  dadosMensais, dadosDiarios, clientes, dadosFiliais,
  formatCurrency, formatCurrencyShort, formatPercent,
  META_MENSAL, META_DIARIA, DIAS_UTEIS_MES,
  faturamentoTotalMes, mediaDiaria, previsaoFechamento,
  variacaoMesAnterior, frotaPropriaMes, terceirosMes,
  type Cliente, type Filial, type ClienteStatus, type TipoFrota,
  MESES_LABELS_LIST,
} from '@/mock/data';

// State
interface State {
  mesIndex: number;
  filial: Filial | 'Todas';
  tipoFrota: TipoFrota | 'todos';
  statusFilter: ClienteStatus | 'todos';
  drillLevel: 'geral' | 'mes' | 'dia' | 'cliente';
  drillMesIndex: number | null;
  drillDia: number | null;
  drillCliente: Cliente | null;
  drawerCliente: Cliente | null;
}

type Action =
  | { type: 'SET_MES'; index: number }
  | { type: 'SET_FILIAL'; filial: Filial | 'Todas' }
  | { type: 'SET_FROTA'; frota: TipoFrota | 'todos' }
  | { type: 'SET_STATUS'; status: ClienteStatus | 'todos' }
  | { type: 'DRILL_MES'; index: number }
  | { type: 'DRILL_DIA'; dia: number }
  | { type: 'DRILL_CLIENTE'; cliente: Cliente }
  | { type: 'OPEN_DRAWER'; cliente: Cliente }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'GO_BACK' }
  | { type: 'GO_HOME' };

const initialState: State = {
  mesIndex: 11,
  filial: 'Todas',
  tipoFrota: 'todos',
  statusFilter: 'todos',
  drillLevel: 'geral',
  drillMesIndex: null,
  drillDia: null,
  drillCliente: null,
  drawerCliente: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MES': return { ...state, mesIndex: action.index };
    case 'SET_FILIAL': return { ...state, filial: action.filial };
    case 'SET_FROTA': return { ...state, tipoFrota: action.frota };
    case 'SET_STATUS': return { ...state, statusFilter: action.status };
    case 'DRILL_MES': return { ...state, drillLevel: 'mes', drillMesIndex: action.index };
    case 'DRILL_DIA': return { ...state, drillLevel: 'dia', drillDia: action.dia };
    case 'DRILL_CLIENTE': return { ...state, drillLevel: 'cliente', drillCliente: action.cliente };
    case 'OPEN_DRAWER': return { ...state, drawerCliente: action.cliente };
    case 'CLOSE_DRAWER': return { ...state, drawerCliente: null };
    case 'GO_BACK':
      if (state.drillLevel === 'dia') return { ...state, drillLevel: 'mes', drillDia: null };
      if (state.drillLevel === 'mes') return { ...state, drillLevel: 'geral', drillMesIndex: null };
      if (state.drillLevel === 'cliente') return { ...state, drillLevel: 'geral', drillCliente: null };
      return state;
    case 'GO_HOME': return { ...state, drillLevel: 'geral', drillMesIndex: null, drillDia: null, drillCliente: null };
    default: return state;
  }
}

export default function Index() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Filtered clients
  const filteredClientes = useMemo(() => {
    return clientes.filter(c => {
      if (state.filial !== 'Todas' && c.filial !== state.filial) return false;
      if (state.statusFilter !== 'todos' && c.status !== state.statusFilter) return false;
      return true;
    });
  }, [state.filial, state.statusFilter]);

  const totalFatMes = filteredClientes.reduce((s, c) => s + c.faturamentoMes, 0) || faturamentoTotalMes;
  const progressPct = (totalFatMes / META_MENSAL) * 100;

  // Breadcrumb
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Geral', onClick: state.drillLevel !== 'geral' ? () => dispatch({ type: 'GO_HOME' }) : undefined }];
  if (state.drillLevel === 'mes' && state.drillMesIndex !== null) {
    breadcrumbs.push({ label: MESES_LABELS_LIST[state.drillMesIndex] });
  }
  if (state.drillLevel === 'dia' && state.drillDia !== null) {
    if (state.drillMesIndex !== null) breadcrumbs.push({ label: MESES_LABELS_LIST[state.drillMesIndex], onClick: () => dispatch({ type: 'GO_BACK' }) });
    breadcrumbs.push({ label: `Dia ${state.drillDia}` });
  }
  if (state.drillLevel === 'cliente' && state.drillCliente) {
    breadcrumbs.push({ label: state.drillCliente.nome });
  }

  // Filtered filial data
  const filteredFiliais = state.filial === 'Todas' ? dadosFiliais : dadosFiliais.filter(d => d.filial === state.filial);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight">
          Dashboard de Faturamento
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Visão geral do desempenho financeiro</p>
      </div>

      <BreadcrumbNav items={breadcrumbs} />
      <Filters
        mesIndex={state.mesIndex}
        filial={state.filial}
        tipoFrota={state.tipoFrota}
        statusFilter={state.statusFilter}
        onMesChange={i => dispatch({ type: 'SET_MES', index: i })}
        onFilialChange={f => dispatch({ type: 'SET_FILIAL', filial: f })}
        onFrotaChange={f => dispatch({ type: 'SET_FROTA', frota: f })}
        onStatusChange={s => dispatch({ type: 'SET_STATUS', status: s })}
      />

      {/* Drill-down: Cliente view */}
      {state.drillLevel === 'cliente' && state.drillCliente && (
        <div className="space-y-6">
          <button
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="text-sm text-primary hover:underline font-body cursor-pointer"
          >
            ← Voltar
          </button>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">{state.drillCliente.nome}</h2>
            <p className="text-muted-foreground font-body">Filial: {state.drillCliente.filial}</p>
            <p className="text-foreground font-body mt-2">Faturamento: {formatCurrency(state.drillCliente.faturamentoMes)}</p>
            <p className="text-muted-foreground font-body">Meta: {formatCurrency(state.drillCliente.metaMensal)}</p>
          </div>
          {/* Show historico */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">Histórico Mensal — {state.drillCliente.nome}</h3>
            <div className="space-y-2">
              {state.drillCliente.historico12Meses.map((v, i) => (
                <div key={i} className="flex justify-between items-center bg-secondary rounded-lg px-3 py-2">
                  <span className="text-sm font-body text-foreground">{MESES_LABELS_LIST[i]}</span>
                  <span className="text-sm font-body font-semibold text-primary">{formatCurrency(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drill-down: Dia view */}
      {state.drillLevel === 'dia' && state.drillDia && (
        <div className="space-y-6">
          <button
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="text-sm text-primary hover:underline font-body cursor-pointer"
          >
            ← Voltar
          </button>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              Detalhamento — Dia {state.drillDia}/03/2025
            </h2>
            {(() => {
              const dayData = dadosDiarios.find(d => d.dia === state.drillDia);
              if (!dayData) return <p className="text-muted-foreground">Sem dados</p>;
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-xs text-muted-foreground font-body">Total do Dia</p>
                    <p className="text-xl font-display font-bold text-foreground">{formatCurrency(dayData.valor)}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-xs text-muted-foreground font-body">Frota Própria</p>
                    <p className="text-xl font-display font-bold text-foreground">{formatCurrency(dayData.frotaPropria)}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-xs text-muted-foreground font-body">Terceiros</p>
                    <p className="text-xl font-display font-bold text-foreground">{formatCurrency(dayData.terceiros)}</p>
                  </div>
                </div>
              );
            })()}
          </div>
          {/* Clientes que geraram faturamento */}
          <DataTable
            clientes={filteredClientes.slice(0, 5)}
            onClickRow={c => dispatch({ type: 'OPEN_DRAWER', cliente: c })}
          />
        </div>
      )}

      {/* Drill-down: Mes view */}
      {state.drillLevel === 'mes' && state.drillMesIndex !== null && (
        <div className="space-y-6">
          <button
            onClick={() => dispatch({ type: 'GO_BACK' })}
            className="text-sm text-primary hover:underline font-body cursor-pointer"
          >
            ← Voltar
          </button>
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              {MESES_LABELS_LIST[state.drillMesIndex]}
            </h2>
            <p className="text-foreground font-body">
              Faturamento: {formatCurrency(dadosMensais[state.drillMesIndex].valor)}
            </p>
            <p className="text-muted-foreground font-body">
              Meta: {formatCurrency(dadosMensais[state.drillMesIndex].meta)}
            </p>
          </div>
          <DailyLineChart data={dadosDiarios} onClickDay={dia => dispatch({ type: 'DRILL_DIA', dia })} />
          <ClientRankingChart
            clientes={filteredClientes}
            totalMes={dadosMensais[state.drillMesIndex].valor}
            onClickCliente={c => dispatch({ type: 'DRILL_CLIENTE', cliente: c })}
          />
        </div>
      )}

      {/* Main Dashboard */}
      {state.drillLevel === 'geral' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <KPICard
              title="Faturamento Total"
              value={formatCurrency(totalFatMes)}
              progress={progressPct}
              delay={0}
            />
            <KPICard
              title="Meta do Mês"
              value={formatCurrency(META_MENSAL)}
              subtitle={`${progressPct.toFixed(1)}% atingido`}
              delay={100}
            />
            <KPICard
              title="Média Diária"
              value={formatCurrency(mediaDiaria)}
              subtitle={`${formatCurrencyShort(mediaDiaria)}/dia`}
              delay={200}
            />
            <KPICard
              title="Previsão Fechamento"
              value={formatCurrency(previsaoFechamento)}
              variation={previsaoFechamento >= META_MENSAL ? 5.2 : -3.1}
              subtitle={previsaoFechamento >= META_MENSAL ? 'Acima da meta' : 'Abaixo da meta'}
              delay={300}
            />
            <KPICard
              title="Variação vs Anterior"
              value={formatPercent(variacaoMesAnterior)}
              variation={variacaoMesAnterior}
              delay={400}
            />
            <div
              className="kpi-card opacity-0 animate-fade-in sm:col-span-2 lg:col-span-1"
              style={{ animationDelay: '500ms' }}
              onClick={() => {
                dispatch({ type: 'SET_FROTA', frota: state.tipoFrota === 'todos' ? 'propria' : state.tipoFrota === 'propria' ? 'terceiros' : 'todos' });
              }}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1">Própria vs Terceiros</p>
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Própria</p>
                  <p className="text-lg font-display font-bold text-foreground">{formatCurrencyShort(frotaPropriaMes)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Terceiros</p>
                  <p className="text-lg font-display font-bold text-foreground">{formatCurrencyShort(terceirosMes)}</p>
                </div>
              </div>
              <p className="text-xs text-primary mt-2 cursor-pointer">Clique para alternar filtro</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyLineChart data={dadosDiarios} onClickDay={dia => dispatch({ type: 'DRILL_DIA', dia })} />
            <MonthlyBarChart
              data={dadosMensais}
              currentMonthIndex={state.mesIndex}
              onClickMonth={i => dispatch({ type: 'DRILL_MES', index: i })}
            />
            <ClientRankingChart
              clientes={filteredClientes}
              totalMes={totalFatMes}
              onClickCliente={c => dispatch({ type: 'DRILL_CLIENTE', cliente: c })}
            />
            <FilialGroupedChart
              data={filteredFiliais}
              onClickFilial={f => dispatch({ type: 'SET_FILIAL', filial: f as Filial })}
            />
          </div>

          {/* Table */}
          <DataTable
            clientes={filteredClientes}
            onClickRow={c => dispatch({ type: 'OPEN_DRAWER', cliente: c })}
          />

          {/* CTEs Faturados */}
          <CTEList limit={10} />

        </div>
      )}

      {/* Drawer */}
      <ClientDrawer
        cliente={state.drawerCliente}
        onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}
      />
    </div>
  );
}
