import { createStore } from './main'
import { Swipe } from '@/types'

export const mockSwipes: Swipe[] = [
  {
    id: 's1',
    title: 'Apple Landing Page',
    imageUrl:
      'https://img.usecurling.com/p/800/1200?q=minimalist%20website&color=white',
    category: 'Landing Page',
    isFavorite: true,
    notes: 'Design super limpo.',
  },
  {
    id: 's2',
    title: 'Notion Ads',
    imageUrl:
      'https://img.usecurling.com/p/600/600?q=productivity%20ad&color=white',
    category: 'Anúncio',
    isFavorite: false,
    notes: 'Boa copy.',
  },
  {
    id: 's3',
    title: 'Checkout Stripe',
    imageUrl:
      'https://img.usecurling.com/p/600/800?q=credit%20card%20form&color=blue',
    category: 'Checkout',
    isFavorite: true,
    notes: 'Checkout fluído.',
  },
  {
    id: 's4',
    title: 'Email Welcome',
    imageUrl:
      'https://img.usecurling.com/p/600/900?q=email%20newsletter&color=gray',
    category: 'Email',
    isFavorite: false,
    notes: 'Ótima estruturação.',
  },
]

export default createStore<Swipe[]>('funilos_swipes', mockSwipes)
