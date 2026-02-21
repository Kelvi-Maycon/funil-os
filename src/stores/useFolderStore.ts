import { createStore } from './main'
import { Folder } from '@/types'

export const mockFolders: Folder[] = [
  {
    id: 'f1',
    projectId: 'p1',
    module: 'funnel',
    name: 'Planejamento',
    parentId: null,
    createdAt: new Date().toISOString(),
    isExpanded: true,
  },
  {
    id: 'f2',
    projectId: 'p1',
    module: 'funnel',
    name: 'Pesquisas',
    parentId: 'f1',
    createdAt: new Date().toISOString(),
    isExpanded: true,
  },
  {
    id: 'f3',
    module: 'project',
    name: 'Q3 - Lançamentos',
    parentId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'f4',
    module: 'asset',
    name: 'Imagens para Meta Ads',
    parentId: null,
    createdAt: new Date().toISOString(),
  },
]

export default createStore<Folder[]>('funilos_folders', mockFolders)
