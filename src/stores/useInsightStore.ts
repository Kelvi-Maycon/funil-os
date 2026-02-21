import { createStore } from './main'
import { Insight } from '@/types'

export const mockInsights: Insight[] = [
  {
    id: 'i1',
    title: 'Aumentar contraste no CTA',
    content:
      'Notei que botões vermelhos convertem melhor que azuis em nossa audiência.',
    type: 'Observação',
    status: 'Aplicado',
    createdAt: new Date().toISOString(),
    isPinned: true,
  },
  {
    id: 'i2',
    title: 'Usar storytelling no Email 2',
    content: 'A história do fundador pode conectar mais com os leads frios.',
    type: 'Ideia',
    status: 'Salvo',
    createdAt: new Date().toISOString(),
    isPinned: false,
  },
  {
    id: 'i3',
    title: 'Testar Order Bump',
    content: 'Podemos adicionar uma planilha de R$27 no checkout.',
    type: 'Hipótese',
    status: 'Rascunho',
    createdAt: new Date().toISOString(),
    isPinned: false,
  },
]

export default createStore<Insight[]>('funilos_insights', mockInsights)
