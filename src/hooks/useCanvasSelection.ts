import { useState } from 'react'

export function useCanvasSelection() {
    const [selectedNodes, setSelectedNodes] = useState<string[]>([])
    const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
    const [selectionBox, setSelectionBox] = useState<{
        startX: number
        startY: number
        currentX: number
        currentY: number
    } | null>(null)

    return {
        selectedNodes,
        setSelectedNodes,
        selectedEdge,
        setSelectedEdge,
        selectionBox,
        setSelectionBox,
    }
}
