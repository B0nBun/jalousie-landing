import { useEffect, useMemo, useState } from "preact/hooks";
import Next from "./icons/Next";

export type CarousellItem = {
    title?: string;
    imageSource?: string;
    onClick?: () => void;
    className?: string;
}

const CarousellItemImage = ({ title, imageSource, className, onClick } : CarousellItem) => {
    if (!title && !imageSource) {
        return <div onClick={onClick} key="carousell-image" className={`w-full h-52 md:h-96 ${className}`}></div>
    }
    if (!imageSource) {
        return (
            <div onClick={onClick} key="carousell-image" className={`w-full h-52 md:h-96 flex items-center text-center p-4 text-2xl md:text-4xl ${className}`}>
                {title}
            </div>
        )
    }
    return (
        <div onClick={onClick} key="carousell-image" className={`w-full h-52 md:h-96 bg-cover bg-center ${className}`} style={{backgroundImage: `url("${imageSource}")`}}></div>
    )
}

type Props = {
    items: CarousellItem[];
    autoscrollIntervalMs?: number;
    header?: string;
}
// TODO: Start the autoscrollTimeout only on the appearance
// TODO: Preload all images
export default function Carousell({ items, autoscrollIntervalMs = 3000, header = '' }: Props) {
    const [currentItemIdx, setCurrentItemIDx] = useState(0);
    const [animationClass, setAnimationClass] = useState('');
    const [animationTimeoutes, setAnimationTimeouts] = useState<ReturnType<typeof setTimeout>[]>([]);
    const [autoscrollTimeout, setAutoscrollTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const titleWithMaximumLength = useMemo(() => {
        const itemsWithImages = items.filter(item => item.imageSource !== undefined && item.title);
        let withMaxLength = '';
        for (let { title } of itemsWithImages) {
            if (title.length > withMaxLength.length) {
                withMaxLength = title;
            }
        }
        return withMaxLength;
    }, [items]);

    const allImageSources = useMemo(() => {
        const result: string[] = [];
        for (const { imageSource } of items) {
            if (!imageSource) continue;
            result.push(imageSource);
        }
        return result;
    }, [items])
    
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
                <h2 class="text-center text-2xl lg:text-3xl font-light">{header}</h2>
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
                <div className={`relative w-full text-center text-xl md:text-2xl duration-200 ${animationClass}`} key="carousell-item-title">
                    {/* 
                        The invisible block is needed to make the height of the container big enough for any title,
                        so that it doesn't change it's size if the height of the title changes
                    */}
                    <span class="invisible">{titleWithMaximumLength}</span>
                    <span class="absolute top-0 left-1/2 -translate-x-1/2 text-center w-full">
                        {currentItem.imageSource ? currentItem.title || '' : ''}
                    </span>
                </div>
            </div>
        </div>
    )
}