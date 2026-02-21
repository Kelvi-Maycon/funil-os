import { createStore } from './main'
import { Project } from '@/types'

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Lançamento Alpha',
    description:
      'O maior lançamento do ano para a nova linha de cursos de Growth.',
    status: 'Ativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Evergreen Beta',
    description: 'Funil perpétuo de aquisição de leads B2B.',
    status: 'Ativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Campanha de Inverno',
    description: 'Campanha sazonal pausada.',
    status: 'Pausado',
    createdAt: new Date().toISOString(),
  },
]

export default createStore<Project[]>('funilos_projects', mockProjects)
