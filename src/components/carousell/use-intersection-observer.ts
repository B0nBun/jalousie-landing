import { MutableRef, useEffect, useState } from "preact/hooks";

export default function useIntersectionObserver(element: MutableRef<Element | null>) {
    const [intersected, setIntersected] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver((entries, obs) => {
            for (let entry of entries) {
                if (entry.isIntersecting) {
                    setIntersected(true)
                    obs.disconnect();
                };
            }
        }, {
            threshold: .8
        });
        if (!element.current) return;
        observer.observe(element.current);
        return () => observer.disconnect();
    }, [element]);
    
    return intersected;
}