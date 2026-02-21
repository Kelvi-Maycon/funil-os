export type Project = {
  id: string
  name: string
  description: string
  status: 'Ativo' | 'Pausado' | 'Concluído'
  createdAt: string
  folderId?: string | null
}
export type NodeData = {
  name: string
  status: string
  notes?: string
  subtitle?: string
  description?: string
  isTaskMode?: boolean
  isCompleted?: boolean
}
export type Node = {
  id: string
  type: string
  x: number
  y: number
  data: NodeData
}
export type Edge = { id: string; source: string; target: string }
export type FunnelFolder = {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}
export type Funnel = {
  id: string
  projectId?: string | null
  folderId?: string | null
  name: string
  status: 'Rascunho' | 'Ativo' | 'Pausado' | 'Concluído'
  createdAt: string
  nodes: Node[]
  edges: Edge[]
}
export type Subtask = {
  id: string
  title: string
  isCompleted: boolean
}
export type Comment = {
  id: string
  author: string
  avatar?: string
  content: string
  createdAt: string
}
export type Task = {
  id: string
  title: string
  projectId?: string | null
  funnelId?: string
  blockId?: string
  priority: 'Baixa' | 'Média' | 'Alta'
  status: 'A Fazer' | 'Em Progresso' | 'Em Revisão' | 'Concluído'
  deadline: string
  description?: string
  assignee?: string
  avatar?: string
  subtasks?: Subtask[]
  comments?: Comment[]
  attachmentCount?: number
}
export type Folder = {
  id: string
  projectId?: string | null
  module: 'project' | 'asset' | 'swipe' | 'insight' | 'funnel'
  name: string
  parentId: string | null
  createdAt: string
  isExpanded?: boolean
}
export type Document = {
  id: string
  projectId?: string | null
  title: string
  content: string
  updatedAt: string
  folderId?: string | null
}
export type Asset = {
  id: string
  projectId?: string | null
  name: string
  url: string
  type: 'image' | 'pdf' | 'link'
  category: string
  tags: string[]
  folderId?: string | null
}
export type Insight = {
  id: string
  projectId?: string | null
  title: string
  content: string
  type: string
  status: 'Rascunho' | 'Salvo' | 'Aplicado' | 'Descartado'
  createdAt: string
  isPinned: boolean
  folderId?: string | null
}
export type Swipe = {
  id: string
  projectId?: string | null
  title: string
  imageUrl: string
  category: string
  isFavorite: boolean
  notes: string
  folderId?: string | null
}
