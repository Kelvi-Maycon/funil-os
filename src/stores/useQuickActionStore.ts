import { createStore } from './main'

export type EntityType =
  | 'task'
  | 'canvas'
  | 'document'
  | 'asset'
  | 'insight'
  | 'swipe'

export type QuickActionState = {
  type: EntityType
  mode: 'create' | 'edit'
  itemId?: string
  defaultProjectId?: string | null
} | null

export default createStore<QuickActionState>('funilos_quick_action', null)
