import { createStore } from './main'
import { Funnel } from '@/types'

export const mockFunnels: Funnel[] = [
  {
    id: 'f1',
    projectId: 'p1',
    folderId: 'ff1',
    name: 'Funil de Vendas Principal',
    status: 'Ativo',
    createdAt: new Date().toISOString(),
    nodes: [
      {
        id: 'n1',
        type: 'Ad',
        x: 50,
        y: 100,
        data: { name: 'Meta Ads', status: 'Concluído' },
      },
      {
        id: 'n2',
        type: 'LandingPage',
        x: 400,
        y: 100,
        data: { name: 'Página de Captura', status: 'Em Progresso' },
      },
    ],
    edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
  },
  {
    id: 'f2',
    projectId: 'p2',
    folderId: null,
    name: 'Captação de Leads',
    status: 'Rascunho',
    createdAt: new Date().toISOString(),
    nodes: [],
    edges: [],
  },
]

export default createStore<Funnel[]>('funilos_funnels', mockFunnels)
