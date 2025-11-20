import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
    children: ReactNode;
    animation?: "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scaleIn" | "rotateIn" | "fadeScale" | "bounceIn";
    delay?: number;
    duration?: number;
    threshold?: number;
    once?: boolean;
    className?: string;
    stagger?: boolean;
    staggerDelay?: number;
}

export const ScrollReveal = ({
    children,
    animation = "fadeIn",
    delay = 0,
    duration = 0.6,
    threshold = 0.1,
    once = true,
    className,
    stagger = false,
    staggerDelay = 0.1,
}: ScrollRevealProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
            { threshold }
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [threshold, once]);

    const animationClasses = {
        fadeIn: "animate-fadeIn",
        slideUp: "animate-slideUp",
        slideDown: "animate-slideDown",
        slideLeft: "animate-slideLeft",
        slideRight: "animate-slideRight",
        scaleIn: "animate-scaleIn",
        rotateIn: "animate-rotateIn",
        fadeScale: "animate-fadeScale",
        bounceIn: "animate-bounceIn",
    };

    return (
        <div
            ref={elementRef}
            className={cn(
                "transition-opacity",
                !isVisible && "opacity-0",
                isVisible && animationClasses[animation],
                className
            )}
            style={{
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
            }}
        >
            {stagger && isVisible
                ? Array.isArray(children)
                    ? (children as ReactNode[]).map((child, index) => (
                        <div
                            key={index}
                            className={animationClasses[animation]}
                            style={{
                                animationDelay: `${delay + index * staggerDelay}s`,
                                animationDuration: `${duration}s`,
                            }}
                        >
                            {child}
                        </div>
                    ))
                    : children
                : children}
        </div>
    );
};
