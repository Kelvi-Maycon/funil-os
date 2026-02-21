import { useState, useEffect } from 'react'

export function createStore<T>(key: string, initialData: T) {
  let memoryState: T = initialData
  const listeners = new Set<React.Dispatch<React.SetStateAction<T>>>()

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

  function setState(newState: T | ((prev: T) => T)) {
    memoryState =
      typeof newState === 'function'
        ? (newState as (prev: T) => T)(memoryState)
        : newState
    localStorage.setItem(key, JSON.stringify(memoryState))
    listeners.forEach((l) => l(memoryState))
  }

  return function useStore() {
    const [state, setLocalState] = useState<T>(memoryState)
    useEffect(() => {
      listeners.add(setLocalState)
      return () => {
        listeners.delete(setLocalState)
      }
    }, [])
    return [state, setState] as const
  }
}
