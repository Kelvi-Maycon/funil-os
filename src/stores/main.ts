import { useSyncExternalStore, useCallback } from 'react'

export function createStore<T>(key: string, initialData: T) {
  let memoryState: T = initialData
  const listeners = new Set<() => void>()

  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      memoryState = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse', key)
    }
  } else {
    localStorage.setItem(key, JSON.stringify(memoryState))
  }

  function getSnapshot() {
    return memoryState
  }

  function setState(newState: T | ((prev: T) => T)) {
    memoryState =
      typeof newState === 'function'
        ? (newState as (prev: T) => T)(memoryState)
        : newState
    localStorage.setItem(key, JSON.stringify(memoryState))
    listeners.forEach((l) => l())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function useStore(): readonly [T, typeof setState]
  function useStore<S>(selector: (state: T) => S): S
  function useStore<S>(selector?: (state: T) => S) {
    if (selector) {
      const sel = selector
      return useSyncExternalStore(subscribe, () => sel(getSnapshot()))
    }
    const state = useSyncExternalStore(subscribe, getSnapshot)
    return [state, setState] as const
  }

  return useStore
}
