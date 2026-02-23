import { createStore } from './main'
import { ResourceFolder } from '@/types'

export default createStore<ResourceFolder[]>('funilos_resource_folders', [])
