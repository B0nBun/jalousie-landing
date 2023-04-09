import { useCallback, useState } from "preact/hooks";

export type Coordinates = { x: number, y: number }
export default function useSwipe(callback: (deltaCoords: Coordinates) => void) {
    const [startCoordinates, setStartCoordinates] = useState<Coordinates | null>(null);

    const onTouchStart = useCallback((event: TouchEvent) => {
        if (event.touches.length === 0) return;
        const touch = event.touches[0]!;
        setStartCoordinates({
            x: touch.clientX,
            y: touch.clientY
        });
    }, [setStartCoordinates])
    
    const onTouchEnd = useCallback((event: TouchEvent) => {
        if (event.changedTouches.length === 0) return;
        const touch = event.changedTouches[0]!;
        if (startCoordinates === null) return;
        const x = touch.clientX;
        const y = touch.clientY;
        callback({
            x: x - startCoordinates.x,
            y: y - startCoordinates.y
        });
    }, [startCoordinates]);
    
    return {
        onTouchStart,
        onTouchEnd,
    };
}