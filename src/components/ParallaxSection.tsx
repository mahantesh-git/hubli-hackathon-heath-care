import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ParallaxSectionProps {
    children: ReactNode;
    speed?: number;
    direction?: "up" | "down";
    className?: string;
    disabled?: boolean;
}

export const ParallaxSection = ({
    children,
    speed = 0.5,
    direction = "up",
    className,
    disabled = false,
}: ParallaxSectionProps) => {
    const [offset, setOffset] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (disabled) return;

        const handleScroll = () => {
            if (!sectionRef.current) return;

            const rect = sectionRef.current.getBoundingClientRect();
            const scrolled = window.pageYOffset;
            const elementTop = rect.top + scrolled;
            const windowHeight = window.innerHeight;

            // Calculate parallax offset when element is in viewport
            if (scrolled + windowHeight > elementTop && scrolled < elementTop + rect.height) {
                const parallax = (scrolled - elementTop + windowHeight) * speed;
                setOffset(direction === "up" ? -parallax : parallax);
            }
        };

        // Use requestAnimationFrame for smooth performance
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [speed, direction, disabled]);

    return (
        <div ref={sectionRef} className={cn("relative", className)}>
            <div
                style={{
                    transform: `translateY(${offset}px)`,
                    transition: "transform 0.1s ease-out",
                }}
            >
                {children}
            </div>
        </div>
    );
};
