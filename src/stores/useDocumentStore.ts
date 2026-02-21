import { createStore } from './main'
import { Document } from '@/types'

export const mockDocuments: Document[] = [
  {
    id: 'd1',
    projectId: 'p1',
    title: 'Estratégia de Lançamento',
    content:
      '<h2>Visão Geral</h2><p>Este é o rascunho inicial da estratégia.</p>',
    updatedAt: new Date().toISOString(),
    folderId: 'f1',
  },
  {
    id: 'd2',
    projectId: 'p2',
    title: 'Pesquisa de Persona',
    content:
      '<h2>Público Alvo</h2><ul><li>Idade: 25-45</li><li>Profissão: Analistas de Marketing</li></ul>',
    updatedAt: new Date().toISOString(),
    folderId: 'f2',
  },
  {
    id: 'd3',
    projectId: 'p1',
    title: 'Documento Raiz',
    content: '<p>Este documento não está em nenhuma pasta.</p>',
    updatedAt: new Date().toISOString(),
    folderId: null,
  },
]

export default createStore<Document[]>('funilos_documents', mockDocuments)
