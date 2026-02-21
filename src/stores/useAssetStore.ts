import { createStore } from './main'
import { Asset } from '@/types'

export const mockAssets: Asset[] = [
  {
    id: 'a1',
    projectId: 'p1',
    name: 'Banner Hero',
    url: 'https://img.usecurling.com/p/600/400?q=creative%20banner&color=purple',
    type: 'image',
    category: 'Design',
    tags: ['hero', 'lançamento'],
  },
  {
    id: 'a2',
    projectId: 'p1',
    name: 'Ad Criativo 1',
    url: 'https://img.usecurling.com/p/600/600?q=digital%20marketing&color=blue',
    type: 'image',
    category: 'Ads',
    tags: ['criativo', 'meta'],
  },
  {
    id: 'a3',
    projectId: 'p2',
    name: 'Mockup do Produto',
    url: 'https://img.usecurling.com/p/800/600?q=smartphone%20app&color=black',
    type: 'image',
    category: 'Mockups',
    tags: ['app'],
  },
]

export default createStore<Asset[]>('funilos_assets', mockAssets)
