import { useEffect, useState } from "preact/hooks";
import Next from "./icons/Next";

export type CarousellItem = {
    title?: string;
    imageSource?: string;
    onClick?: () => void;
    className?: string;
}

const CarousellItemImage = ({ title, imageSource, className, onClick } : CarousellItem) => {
    if (!title && !imageSource) {
        return <div onClick={onClick} key="carousell-image" className={`w-full h-96 ${className}`}></div>
    }
    if (!imageSource) {
        return (
            <div onClick={onClick} key="carousell-image" className={`w-full h-96 flex items-center text-center p-4 text-2xl md:text-4xl ${className}`}>
                {title}
            </div>
        )
    }
    return (
        <div onClick={onClick} key="carousell-image" className={`w-full h-96 bg-cover bg-center ${className}`} style={{backgroundImage: `url("${imageSource}")`}}></div>
    )
}

type Props = {
    items: CarousellItem[],
    autoscrollIntervalMs?: number;
}
export default function Carousell({ items, autoscrollIntervalMs = 3000 }: Props) {
    const [currentItemIdx, setCurrentItemIDx] = useState(0);
    const [animationClass, setAnimationClass] = useState('');
    const [animationTimeoutes, setAnimationTimeouts] = useState<number[]>([]);
    const [autoscrollTimeout, setAutoscrollTimeout] = useState<number>(0);

    const mod = (currentItemIdx % items.length)
    const currentItem = items[mod < 0 ? items.length + mod : mod];
    const circles = items.map(item => ({
        selected: item === currentItem
    }));

    useEffect(() => {
        clearTimeout(autoscrollTimeout);
        setAutoscrollTimeout(setTimeout(() => {
            switchItem(currentItemIdx + 1);
        }, autoscrollIntervalMs));
    }, [currentItemIdx]);
    
    // useCallback is pretty much useless, because this functions
    // depends on almost every state property
    const switchItem = async (newIndex: number) => {
        if (currentItemIdx === newIndex) return;
        
        animationTimeoutes.forEach(clearTimeout);
        setAnimationTimeouts([]);

        let carousellTranslate = "[--carousell-translate:20px]";
        if (newIndex < currentItemIdx) {
            carousellTranslate = "[--carousell-translate:-20px]";
        }
        setAnimationClass(`animate-carousell-out ${carousellTranslate}`);

        const timer1 = setTimeout(() => {
            setCurrentItemIDx(newIndex);
            const timer2 = setTimeout(() => {
                setAnimationClass(`animate-carousell-in ${carousellTranslate}`);
            }, 210);
            setAnimationTimeouts([...animationTimeoutes, timer2]);
        }, 210);
        setAnimationTimeouts([...animationTimeoutes, timer1]);
    };

    return (
        <div className="flex justify-center bg-black text-white py-8 md:py-16 px-2 w-full overflow-hidden">
            <div className="flex flex-col items-center gap-4 mx-auto max-w-3xl">
                <div className="flex flex-row gap-3">
                    {circles.map((circle, idx) => (
                        <button key={idx} onClick={() => switchItem(idx)} className={`w-3 h-3 rounded-full bg-white ${circle.selected ? '' : 'opacity-50'} transition-opacity duration-200`}></button>
                    ))}
                </div>
                <div className="flex w-full flex-row items-center gap-2 md:gap-8">
                    {/* TODO: Animate buttons */}
                    <button className="-scale-x-100" onClick={() => switchItem(currentItemIdx - 1)}>
                        <Next />
                    </button>
                    <CarousellItemImage onClick={() => switchItem(currentItemIdx + 1)} className={animationClass} key="carousell-item-image" {...currentItem} />
                    <button onClick={() => switchItem(currentItemIdx + 1)}>
                        <Next />
                    </button>
                </div>
                <div className={`w-full text-center text-xl md:text-2xl h-20 md:h-24 duration-200 ${animationClass}`} key="carousell-item-title">
                    {currentItem.imageSource ? currentItem.title || '' : ''}
                </div>
            </div>
        </div>
    )
}