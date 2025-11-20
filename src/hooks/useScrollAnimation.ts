import { useEffect, useState } from "react";

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
}

export const useScrollAnimation = (
    options: UseScrollAnimationOptions = {}
) => {
    const { threshold = 0.1, rootMargin = "0px", once = true } = options;
    const [isVisible, setIsVisible] = useState(false);
    const [ref, setRef] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (!ref) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.disconnect();
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(ref);

        return () => {
            observer.disconnect();
        };
    }, [ref, threshold, rootMargin, once]);

    return { ref: setRef, isVisible };
};
