import { createStore } from './main'
import { FunnelFolder } from '@/types'

export const mockFunnelFolders: FunnelFolder[] = [
  {
    id: 'ff1',
    name: 'Lançamentos',
    parentId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ff2',
    name: '2026',
    parentId: 'ff1',
    createdAt: new Date().toISOString(),
  },
]

export default createStore<FunnelFolder[]>(
  'funilos_funnel_folders',
  mockFunnelFolders,
)
