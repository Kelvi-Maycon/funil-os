import { createStore } from './main'
import { Resource } from '@/types'

export const mockResources: Resource[] = [
    {
        id: 'res1',
        projectId: 'p1',
        type: 'image',
        title: 'Banner Hero',
        content: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
        tags: ['hero', 'lançamento'],
        isPinned: true,
        createdAt: '2026-02-20T10:00:00Z',
    },
    {
        id: 'res2',
        projectId: 'p1',
        type: 'link',
        title: 'Referência de Landing Page',
        content: 'https://stripe.com',
        tags: ['referência', 'landing'],
        isPinned: false,
        createdAt: '2026-02-19T10:00:00Z',
    },
    {
        id: 'res3',
        projectId: 'p1',
        type: 'note',
        title: 'Insight: Copy que converte',
        content: 'Usar linguagem direta focada em benefício. Frases curtas. CTA acima da dobra. Prova social logo abaixo do hero.',
        tags: ['copy', 'insight'],
        isPinned: true,
        createdAt: '2026-02-18T10:00:00Z',
    },
    {
        id: 'res4',
        projectId: 'p2',
        type: 'image',
        title: 'Mockup do Produto',
        content: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600',
        tags: ['mockup', 'app'],
        isPinned: false,
        createdAt: '2026-02-17T10:00:00Z',
    },
    {
        id: 'res5',
        projectId: 'p1',
        type: 'note',
        title: 'Swipe: Headline viral',
        content: 'A fórmula "Número + Adjetivo + Resultado + Tempo" funciona muito bem. Ex: "7 formas simples de dobrar suas vendas em 30 dias".',
        tags: ['swipe', 'headline'],
        isPinned: false,
        createdAt: '2026-02-16T10:00:00Z',
    },
]

export default createStore<Resource[]>('funilos_resources', mockResources)
