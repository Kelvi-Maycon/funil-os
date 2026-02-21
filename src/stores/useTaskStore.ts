import { createStore } from './main'
import { Task } from '@/types'

export const mockTasks: Task[] = [
  {
    id: 't1',
    title: 'Refactor Auth',
    projectId: 'p1',
    priority: 'Baixa',
    status: 'Concluído',
    deadline: new Date(Date.now() - 86400000).toISOString(),
    assignee: 'John Doe',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    description:
      'Refactor the authentication flow to use the new API endpoints.',
    subtasks: [
      { id: 'st1', title: 'Update login endpoint', isCompleted: true },
      { id: 'st2', title: 'Update register endpoint', isCompleted: true },
    ],
    comments: [
      {
        id: 'c1',
        author: 'Jane Smith',
        content: 'Looks good!',
        createdAt: new Date().toISOString(),
      },
    ],
    attachmentCount: 2,
  },
  {
    id: 't2',
    title: 'Design Home',
    projectId: 'p3',
    priority: 'Baixa',
    status: 'Em Progresso',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    assignee: 'Alice',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
    subtasks: [
      { id: 'st3', title: 'Wireframes', isCompleted: true },
      { id: 'st4', title: 'High fidelity UI', isCompleted: false },
    ],
    attachmentCount: 1,
    comments: [],
  },
  {
    id: 't3',
    title: 'SEO Audit',
    projectId: 'p2',
    priority: 'Baixa',
    status: 'A Fazer',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    assignee: 'Bob',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
    subtasks: [],
    attachmentCount: 0,
    comments: [],
  },
  {
    id: 't4',
    title: 'Setup CI/CD',
    projectId: 'p1',
    priority: 'Média',
    status: 'A Fazer',
    deadline: new Date(Date.now() + 86400000 * 1).toISOString(),
    assignee: 'Charlie',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
    subtasks: [{ id: 'st5', title: 'GitHub Actions', isCompleted: false }],
    attachmentCount: 0,
    comments: [],
  },
  {
    id: 't5',
    title: 'Fix Navigation Bug',
    projectId: 'p3',
    priority: 'Alta',
    status: 'Em Revisão',
    deadline: new Date(Date.now() + 86400000 * 0).toISOString(),
    assignee: 'Dave',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=5',
    subtasks: [
      { id: 'st6', title: 'Identify issue', isCompleted: true },
      { id: 'st7', title: 'Write test', isCompleted: true },
      { id: 'st8', title: 'Fix code', isCompleted: true },
    ],
    attachmentCount: 3,
    comments: [
      {
        id: 'c2',
        author: 'Charlie',
        content: 'Almost there.',
        createdAt: new Date().toISOString(),
      },
    ],
  },
]

export default createStore<Task[]>('funilos_tasks', mockTasks)
