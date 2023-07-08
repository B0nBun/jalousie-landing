import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import Next from "../icons/Next";
import useIntersectionObserver from "./use-intersection-observer";
import useSwipe from "./use-swipe";

export type CarousellItem = {
    title?: string;
    imageSource?: string;
    className?: string;
    onImageClick?: () => unknown
}

const CarousellItemImage = ({ title, imageSource, className, onImageClick } : CarousellItem) => {
    if (!title && !imageSource) {
        return <div className={`w-full h-52 md:h-96 ${className}`}></div>
    }
    if (!imageSource) {
        return (
            <div className={`w-full h-52 md:h-96 flex items-center text-center p-4 text-2xl md:text-4xl ${className}`}>
                {title}
            </div>
        )
    }
    return (
        <div onClick={onImageClick} role="img" aria-label={"Image with title: " + title} className={`w-full h-52 md:h-96 bg-contain bg-no-repeat bg-center cursor-pointer ${className}`} style={{
            backgroundImage: `url("${imageSource}")`
        }}></div>
    )
}

type Props = {
    items: CarousellItem[];
    autoscrollIntervalMs?: number;
    header?: string;
}

const getItemFromIndex = (items: CarousellItem[], index: number) : CarousellItem => {
    const mod = index % items.length;
    const currentItem = items[mod < 0 ? items.length + mod : mod]!;
    return currentItem;
}

export default function Carousell({ items, autoscrollIntervalMs = 3000, header = '' }: Props) {
    const carousellElement = useRef<HTMLDivElement | null>(null);
    const isIntersected = useIntersectionObserver(carousellElement);

    const [currentItemIdx, setCurrentItemIDx] = useState(0);
    const [imageAnimationClass, setImageAnimationClass] = useState('');
    const [titleAnimationClass, setTitleAnimationClass] = useState('');
    const [animationTimeoutes, setAnimationTimeouts] = useState<ReturnType<typeof setTimeout>[]>([]);
    const [autoscrollTimeout, setAutoscrollTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const titleWithMaximumLength = useMemo(() => {
        const itemsWithImages = items.filter(item => item.imageSource !== undefined && item.title);
        let withMaxLength = '';
        for (let { title } of itemsWithImages) {
            if (title && title.length > withMaxLength.length) {
                withMaxLength = title;
            }
        }
        return withMaxLength;
    }, [items]);
    
    
    const currentItem = getItemFromIndex(items, currentItemIdx);
    const circles = items.map(item => ({
        selected: item === currentItem
    }));

    const nextImageSource = useMemo(() => {
        const mod = (currentItemIdx + 1) % items.length;
        const nextItem = items[mod < 0 ? items.length + mod : mod]!;
        return nextItem.imageSource;
    }, [items, currentItemIdx]);

    useEffect(() => {
        clearTimeout(autoscrollTimeout || 0);
        if (!isIntersected) return; 
        const timeout = setTimeout(() => {
            switchItem(currentItemIdx + 1);
        }, autoscrollIntervalMs);
        setAutoscrollTimeout(timeout);
        return () => clearTimeout(timeout);
    }, [currentItemIdx, isIntersected]);
    
    // useCallback is pretty much useless, because this functions
    // depends on almost every state property
    const fadeTransitionDuration = 500
    const switchItem = async (newIndex: number) => {
        if (currentItemIdx === newIndex) return;
        
        animationTimeoutes.forEach(clearTimeout);
        setAnimationTimeouts([]);

        let carousellTranslate = "[--carousell-translate:20px]";
        if (newIndex < currentItemIdx) {
            carousellTranslate = "[--carousell-translate:-20px]";
        }

        const newItem = getItemFromIndex(items, newIndex)
        const titleChanges = newItem.title !== currentItem.title        
        setImageAnimationClass(`animate-carousell-out ${carousellTranslate}`);
        if (titleChanges) {
            setTitleAnimationClass(`animate-carousell-out ${carousellTranslate}`);
        }

        const timer1 = setTimeout(() => {
            setCurrentItemIDx(newIndex);
            const timer2 = setTimeout(() => {
                setImageAnimationClass(`animate-carousell-in ${carousellTranslate}`);
                if (titleChanges) {
                    setTitleAnimationClass(`animate-carousell-in ${carousellTranslate}`);
                }
            }, fadeTransitionDuration + 10);
            setAnimationTimeouts([...animationTimeoutes, timer2]);
        }, fadeTransitionDuration + 10);
        setAnimationTimeouts([...animationTimeoutes, timer1]);
    };

    const swipeHandlers = useSwipe(coords => {
        if (coords.x > 50) {
            switchItem(currentItemIdx - 1);
        }
        if (coords.x < -50) {
            switchItem(currentItemIdx + 1);
        }
    });

    const [modalItem, setModalItem] = useState<CarousellItem | undefined>(undefined);
    const [modalOpacity, setModalOpacity] = useState(0);
    
    const onImageClick = useCallback(() => {
        if (!currentItem.imageSource) return;
        setModalItem(currentItem);
        setModalOpacity(1);
    }, [currentItem, setModalOpacity, setModalItem])
    
    const backdropTransitionDuration = 500
    const onBackdropClick = useCallback(() => {
        setModalOpacity(0);
        setTimeout(() => {
            setModalItem(undefined);
        }, backdropTransitionDuration + 20);
    }, [setModalOpacity, setModalItem])

    return (
        <div ref={carousellElement} className="flex justify-center bg-black text-white py-8 md:py-16 px-2 w-full overflow-hidden">
            {/* Modal */}
            <div
                class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex flex-col gap-2 items-center justify-center z-10 transition-opacity cursor-pointer"
                style={{
                    pointerEvents: modalOpacity !== 0 ? 'all' : 'none',
                    opacity: modalOpacity,
                    transitionDuration: `${backdropTransitionDuration}ms`,
                }}
                onClick={onBackdropClick}
            >
                <img onClick={e => e.stopPropagation()} src={modalItem?.imageSource} class="max-h-[80vh] max-w-[80vw] cursor-default"></img>
                <p class="text-xl lg:text-2xl p-2 text-center">{modalItem?.title}</p>
            </div>
            
            {/* Preloading the next image */}
            <div className="hidden">
                <img src={nextImageSource}></img>
            </div>
            <div className="flex flex-col items-center gap-4 mx-auto max-w-3xl">
                <h2 class="text-center text-2xl lg:text-3xl font-light">{header}</h2>
                <div className="flex flex-row gap-3">
                    {circles.map((circle, idx) => (
                        <button key={idx} onClick={() => switchItem(idx)} className={`w-3 h-3 rounded-full bg-white ${circle.selected ? '' : 'opacity-50'} transition-opacity duration-200`}></button>
                    ))}
                </div>
                <div {...swipeHandlers} className="flex w-full flex-row items-center gap-2 md:gap-8">
                    <button className="-scale-x-100 hover:-scale-x-[115%] hover:scale-y-[115%] transition-transform" onClick={() => switchItem(currentItemIdx - 1)}>
                        <Next />
                    </button>
                    <CarousellItemImage onImageClick={onImageClick} className={imageAnimationClass} key="carousell-item-image" {...currentItem} />
                    <button className="hover:scale-[115%] transition-transform" onClick={() => switchItem(currentItemIdx + 1)}>
                        <Next />
                    </button>
                </div>
                <div className={`relative w-full text-center text-xl md:text-2xl duration-200 ${titleAnimationClass}`} key="carousell-item-title">
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