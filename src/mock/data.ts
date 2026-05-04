
const FILIAIS = ['SP', 'RJ', 'MG', 'ES', 'BA'] as const;
export type Filial = typeof FILIAIS[number];
export type ClienteStatus = 'acima' | 'esperado' | 'abaixo';
export type TipoFrota = 'propria' | 'terceiros';

export interface Operacao {
  data: string;
  rota: string;
  valor: number;
}

export interface Cliente {
  id: string;
  nome: string;
  filial: Filial;
  metaMensal: number;
  faturamentoMes: number;
  variacaoAnterior: number;
  ticketMedio: number;
  quantidadeEntregas: number;
  status: ClienteStatus;
  historico12Meses: number[];
  topRotas: { rota: string; valor: number }[];
  ultimasOperacoes: Operacao[];
}

export interface DadosDiarios {
  dia: number;
  data: string;
  valor: number;
  frotaPropria: number;
  terceiros: number;
}

export interface DadosMensais {
  mes: string;
  mesNum: number;
  ano: number;
  valor: number;
  meta: number;
  frotaPropria: number;
  terceiros: number;
  porFilial: Record<Filial, number>;
}

export interface DadosFilial {
  filial: Filial;
  mesAtual: number;
  mesAnterior: number;
}

const NOMES_CLIENTES = [
  'Coca-Cola', 'Ambev', 'Nestlé', 'Unilever', 'P&G',
  'JBS', 'BRF', 'Mondelez', 'Danone', 'Kraft Heinz',
  'PepsiCo', 'Colgate', 'Johnson & Johnson', 'Kimberly-Clark', 'Whirlpool'
];

const ROTAS = [
  'SP → RJ', 'SP → MG', 'RJ → ES', 'MG → BA', 'SP → BA',
  'RJ → MG', 'ES → BA', 'SP → ES', 'MG → RJ', 'BA → SP',
  'SP → PR', 'RJ → SP', 'MG → SP', 'ES → RJ', 'BA → MG'
];

const MESES_LABELS = [
  'Abr/24', 'Mai/24', 'Jun/24', 'Jul/24', 'Ago/24', 'Set/24',
  'Out/24', 'Nov/24', 'Dez/24', 'Jan/25', 'Fev/25', 'Mar/25'
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seedRandom(42);
function srand(min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// Generate 12 months of data
export const dadosMensais: DadosMensais[] = MESES_LABELS.map((mes, i) => {
  const base = srand(10000000, 15000000);
  const propria = Math.floor(base * (0.55 + rng() * 0.15));
  const terceiros = base - propria;
  const porFilial: Record<Filial, number> = {} as any;
  let remaining = base;
  FILIAIS.forEach((f, fi) => {
    if (fi === FILIAIS.length - 1) {
      porFilial[f] = remaining;
    } else {
      const share = Math.floor(remaining * (0.15 + rng() * 0.2));
      porFilial[f] = share;
      remaining -= share;
    }
  });
  
  const mesNum = ((3 + i) % 12) + 1;
  const ano = i < 9 ? 2024 : 2025;
  
  return {
    mes,
    mesNum,
    ano,
    valor: base,
    meta: 15000000,
    frotaPropria: propria,
    terceiros,
    porFilial,
  };
});

// Current month (March 2025 = last item)
const MES_ATUAL = dadosMensais[11];
const MES_ANTERIOR = dadosMensais[10];

// Generate daily data for current month (30 days)
export const dadosDiarios: DadosDiarios[] = Array.from({ length: 30 }, (_, i) => {
  const valor = srand(300000, 600000);
  const propria = Math.floor(valor * (0.5 + rng() * 0.2));
  return {
    dia: i + 1,
    data: `${String(i + 1).padStart(2, '0')}/03/2025`,
    valor,
    frotaPropria: propria,
    terceiros: valor - propria,
  };
});

// Generate clients
export const clientes: Cliente[] = NOMES_CLIENTES.map((nome, i) => {
  const filial = FILIAIS[i % FILIAIS.length];
  const metaMensal = srand(600000, 1500000);
  const faturamentoMes = srand(Math.floor(metaMensal * 0.7), Math.floor(metaMensal * 1.3));
  const variacaoAnterior = parseFloat(((rng() - 0.4) * 30).toFixed(1));
  const quantidadeEntregas = srand(50, 300);
  const ticketMedio = Math.floor(faturamentoMes / quantidadeEntregas);
  
  let status: ClienteStatus = 'esperado';
  const pctMeta = faturamentoMes / metaMensal;
  if (pctMeta > 1.1) status = 'acima';
  else if (pctMeta < 0.85) status = 'abaixo';

  const historico12Meses = Array.from({ length: 12 }, () => srand(Math.floor(metaMensal * 0.6), Math.floor(metaMensal * 1.4)));
  
  const topRotas = Array.from({ length: 3 }, (_, ri) => ({
    rota: ROTAS[(i * 3 + ri) % ROTAS.length],
    valor: srand(50000, 300000),
  })).sort((a, b) => b.valor - a.valor);

  const ultimasOperacoes: Operacao[] = Array.from({ length: 5 }, (_, oi) => ({
    data: `${String(srand(1, 28)).padStart(2, '0')}/03/2025`,
    rota: ROTAS[(i + oi) % ROTAS.length],
    valor: srand(5000, 50000),
  }));

  return {
    id: `cli-${i}`,
    nome,
    filial,
    metaMensal,
    faturamentoMes,
    variacaoAnterior,
    ticketMedio,
    quantidadeEntregas,
    status,
    historico12Meses,
    topRotas,
    ultimasOperacoes,
  };
});

// Filial data
export const dadosFiliais: DadosFilial[] = FILIAIS.map(f => ({
  filial: f,
  mesAtual: MES_ATUAL.porFilial[f],
  mesAnterior: MES_ANTERIOR.porFilial[f],
}));

// Helpers
export const META_MENSAL = 15000000;
export const DIAS_UTEIS_MES = 22;
export const META_DIARIA = META_MENSAL / DIAS_UTEIS_MES;
export const FILIAIS_LIST = [...FILIAIS];
export const MESES_LABELS_LIST = MESES_LABELS;

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatCurrencyShort(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace('.', ',')}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Computed KPIs
export const faturamentoTotalMes = MES_ATUAL.valor;
export const metaMes = META_MENSAL;
export const mediaDiaria = Math.floor(dadosDiarios.reduce((s, d) => s + d.valor, 0) / dadosDiarios.length);
export const diasRestantes = 30 - dadosDiarios.length;
export const previsaoFechamento = dadosDiarios.reduce((s, d) => s + d.valor, 0) + mediaDiaria * Math.max(0, diasRestantes);
export const variacaoMesAnterior = parseFloat((((MES_ATUAL.valor - MES_ANTERIOR.valor) / MES_ANTERIOR.valor) * 100).toFixed(1));
export const frotaPropriaMes = MES_ATUAL.frotaPropria;
export const terceirosMes = MES_ATUAL.terceiros;

// CTEs Faturados
export interface CTE {
  numero: string;
  cliente: string;
  origem: string;
  destino: string;
  valor: number;
  dataFaturamento: string;
}

const CIDADES = [
  'São Paulo/SP', 'Rio de Janeiro/RJ', 'Belo Horizonte/MG', 'Vitória/ES', 'Salvador/BA',
  'Curitiba/PR', 'Campinas/SP', 'Santos/SP', 'Uberlândia/MG', 'Juiz de Fora/MG',
  'Niterói/RJ', 'Vila Velha/ES', 'Feira de Santana/BA', 'Ribeirão Preto/SP', 'Sorocaba/SP',
];

export const ctesFaturados: CTE[] = Array.from({ length: 50 }, (_, i) => {
  const cliente = NOMES_CLIENTES[srand(0, NOMES_CLIENTES.length - 1)];
  let origem = CIDADES[srand(0, CIDADES.length - 1)];
  let destino = CIDADES[srand(0, CIDADES.length - 1)];
  while (destino === origem) destino = CIDADES[srand(0, CIDADES.length - 1)];
  const dia = srand(1, 30);
  const hora = srand(0, 23);
  const min = srand(0, 59);
  return {
    numero: String(100000 + srand(1, 899999)),
    cliente,
    origem,
    destino,
    valor: srand(1500, 85000),
    dataFaturamento: `${String(dia).padStart(2, '0')}/03/2025 ${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
  };
}).sort((a, b) => b.dataFaturamento.localeCompare(a.dataFaturamento));

export const totalCtesFaturados = ctesFaturados.length;
export const valorTotalCtes = ctesFaturados.reduce((s, c) => s + c.valor, 0);


// ============ VEÍCULOS / FROTA ============
export interface VeiculoClassificacao {
  classificacao: 'Frota Própria' | 'Agregado' | 'Terceiro';
  valor: number;
  percentual: number;
  mediaFaturamento: number;
  projecao: number;
}

export interface TipoVeiculo {
  tipo: string;
  quantidade: number;
  percentual: number;
  valor: number;
}

export interface MediaMensalVeiculo {
  mes: string;
  valor: number; // em milhares
}

export const veiculosTotal = 451;
export const valorMedioPorVeiculo = 121304;

export const veiculosPorClassificacao: VeiculoClassificacao[] = [
  { classificacao: 'Frota Própria', valor: 38050312, percentual: 57.47, mediaFaturamento: 195129, projecao: 47342420 },
  { classificacao: 'Agregado',      valor: 7232093,  percentual: 10.92, mediaFaturamento: 160713, projecao: 9008305  },
  { classificacao: 'Terceiro',      valor: 5366763,  percentual: 8.11,  mediaFaturamento: 25434,  projecao: 6657946  },
];

export const tiposVeiculo: TipoVeiculo[] = [
  { tipo: 'Cavalo Trucado',   quantidade: 233, percentual: 51.66, valor: 42030778 },
  { tipo: 'Cavalo Simples',   quantidade: 181, percentual: 40.13, valor: 4371511  },
  { tipo: 'Cavalo Traçado',   quantidade: 14,  percentual: 3.10,  valor: 3917607  },
  { tipo: 'Veículo Toco',     quantidade: 12,  percentual: 2.66,  valor: 217796   },
  { tipo: 'Veículo Truck',    quantidade: 6,   percentual: 1.33,  valor: 54373    },
  { tipo: 'Carreta Sider LS', quantidade: 3,   percentual: 0.66,  valor: 41747    },
  { tipo: 'Veículo VUC',      quantidade: 2,   percentual: 0.46,  valor: 15353    },
];

export const mediaMensalVeiculo: MediaMensalVeiculo[] = [
  { mes: 'Jan', valor: 57000 },
  { mes: 'Fev', valor: 60000 },
  { mes: 'Mar', valor: 66000 },
  { mes: 'Abr', valor: 50000 },
  { mes: 'Mai', valor: 12000 },
];

// Últimos veículos faturados (drill-down)
export interface VeiculoFaturado {
  placa: string;
  tipo: string;
  classificacao: 'Frota Própria' | 'Agregado' | 'Terceiro';
  cliente: string;
  rota: string;
  valor: number;
  data: string;
}

const PLACAS_LETRAS = ['ABC', 'DEF', 'GHJ', 'KLM', 'NPQ', 'RST', 'UVW', 'XYZ', 'BRA', 'SPL'];
const CLASSIFS: VeiculoFaturado['classificacao'][] = ['Frota Própria', 'Agregado', 'Terceiro'];

export const ultimosVeiculosFaturados: VeiculoFaturado[] = Array.from({ length: 60 }, (_, i) => {
  const tipo = tiposVeiculo[srand(0, tiposVeiculo.length - 1)].tipo;
  const classificacao = CLASSIFS[srand(0, 2)];
  const letras = PLACAS_LETRAS[srand(0, PLACAS_LETRAS.length - 1)];
  const placa = `${letras}-${srand(1000, 9999)}`;
  const cliente = NOMES_CLIENTES[srand(0, NOMES_CLIENTES.length - 1)];
  const rota = ROTAS[srand(0, ROTAS.length - 1)];
  const dia = srand(1, 30);
  const hora = srand(0, 23);
  const min = srand(0, 59);
  return {
    placa,
    tipo,
    classificacao,
    cliente,
    rota,
    valor: srand(3000, 95000),
    data: `${String(dia).padStart(2, '0')}/03/2025 ${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
  };
}).sort((a, b) => b.data.localeCompare(a.data));
