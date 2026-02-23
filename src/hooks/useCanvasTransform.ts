import { useState, useRef, useEffect } from 'react'

export function useCanvasTransform(initialScale = 1, hideHeader = false) {
    const [transform, setTransform] = useState({
        x: hideHeader ? 300 : 400,
        y: 150,
        scale: initialScale,
    })
    const [isPanning, setIsPanning] = useState(false)
    const lastPan = useRef({ x: 0, y: 0 })

    const zoomIn = () => setTransform((p) => ({ ...p, scale: Math.min(3, p.scale + 0.1) }))
    const zoomOut = () => setTransform((p) => ({ ...p, scale: Math.max(0.1, p.scale - 0.1) }))
    const resetZoom = () => setTransform({ x: 400, y: 150, scale: 1 })

    return {
        transform,
        setTransform,
        isPanning,
        setIsPanning,
        lastPan,
        zoomIn,
        zoomOut,
        resetZoom,
    }
}
