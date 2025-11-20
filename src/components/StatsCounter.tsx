import { useEffect, useRef, useState } from "react";

interface StatsCounterProps {
    end: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export const StatsCounter = ({
    end,
    duration = 2000,
    prefix = "",
    suffix = "",
    className = "",
}: StatsCounterProps) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const elementRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && countRef.current === 0) {
                        // Start counting
                        const startTime = Date.now();
                        const startValue = 0;

                        const updateCount = () => {
                            const now = Date.now();
                            const progress = Math.min((now - startTime) / duration, 1);
                            const easeOutQuad = 1 - Math.pow(1 - progress, 3);
                            const currentCount = Math.floor(easeOutQuad * end);

                            setCount(currentCount);
                            countRef.current = currentCount;

                            if (progress < 1) {
                                requestAnimationFrame(updateCount);
                            } else {
                                setCount(end);
                                countRef.current = end;
                            }
                        };

                        updateCount();
                    }
                });
            },
            { threshold: 0.5 }
        );

        observerRef.current.observe(element);

        return () => {
            if (observerRef.current && element) {
                observerRef.current.unobserve(element);
            }
        };
    }, [end, duration]);

    return (
        <span ref={elementRef} className={className}>
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </span>
    );
};
