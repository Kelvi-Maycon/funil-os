import { useState, useCallback, useRef } from 'react'
import { Funnel } from '@/types'

const MAX_HISTORY = 50

export function useCanvasHistory(initialFunnel: Funnel) {
    const pastRef = useRef<string[]>([])
    const futureRef = useRef<string[]>([])
    const [, forceUpdate] = useState(0)

    const pushState = useCallback((funnel: Funnel) => {
        const snapshot = JSON.stringify({ nodes: funnel.nodes, edges: funnel.edges })
        pastRef.current.push(snapshot)
        if (pastRef.current.length > MAX_HISTORY) {
            pastRef.current.shift()
        }
        futureRef.current = []
        forceUpdate((c) => c + 1)
    }, [])

    const undo = useCallback((currentFunnel: Funnel, onChange: (f: Funnel) => void) => {
        if (pastRef.current.length === 0) return
        const currentSnapshot = JSON.stringify({ nodes: currentFunnel.nodes, edges: currentFunnel.edges })
        futureRef.current.push(currentSnapshot)
        const prev = pastRef.current.pop()!
        const parsed = JSON.parse(prev)
        onChange({ ...currentFunnel, nodes: parsed.nodes, edges: parsed.edges })
        forceUpdate((c) => c + 1)
    }, [])

    const redo = useCallback((currentFunnel: Funnel, onChange: (f: Funnel) => void) => {
        if (futureRef.current.length === 0) return
        const currentSnapshot = JSON.stringify({ nodes: currentFunnel.nodes, edges: currentFunnel.edges })
        pastRef.current.push(currentSnapshot)
        const next = futureRef.current.pop()!
        const parsed = JSON.parse(next)
        onChange({ ...currentFunnel, nodes: parsed.nodes, edges: parsed.edges })
        forceUpdate((c) => c + 1)
    }, [])

    const canUndo = pastRef.current.length > 0
    const canRedo = futureRef.current.length > 0

    return { pushState, undo, redo, canUndo, canRedo }
}
