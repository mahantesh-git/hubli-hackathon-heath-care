import { ReactNode, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InteractiveCardProps {
    children: ReactNode;
    className?: string;
    hover?: "tilt" | "lift" | "glow" | "scale" | "magnetic";
    onClick?: () => void;
    gradient?: "primary" | "secondary" | "accent" | "rainbow";
    loading?: boolean;
    success?: boolean;
    error?: boolean;
}

export const InteractiveCard = ({
    children,
    className,
    hover = "lift",
    onClick,
    gradient,
    loading = false,
    success = false,
    error = false,
}: InteractiveCardProps) => {
    const [tiltStyle, setTiltStyle] = useState({});
    const [magneticStyle, setMagneticStyle] = useState({});
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        if (hover === "tilt") {
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            setTiltStyle({
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            });
        }

        if (hover === "magnetic") {
            const moveX = ((x - centerX) / centerX) * 10;
            const moveY = ((y - centerY) / centerY) * 10;
            setMagneticStyle({
                transform: `translate(${moveX}px, ${moveY}px)`,
            });
        }
    };

    const handleMouseLeave = () => {
        setTiltStyle({});
        setMagneticStyle({});
    };

    const hoverClasses = {
        tilt: "transform-3d transition-transform duration-300",
        lift: "hover-lift",
        glow: "hover-glow",
        scale: "hover-scale",
        magnetic: "transition-transform duration-200",
    };

    const gradientClasses = {
        primary: "gradient-primary text-white",
        secondary: "gradient-secondary text-white",
        accent: "gradient-accent text-white",
        rainbow: "gradient-rainbow text-white",
    };

    const stateClasses = cn(
        loading && "opacity-60 pointer-events-none",
        success && "border-success shadow-colored",
        error && "border-destructive shadow-colored"
    );

    return (
        <div
            ref={cardRef}
            className={cn(
                "rounded-xl border bg-card text-card-foreground shadow-soft transition-all",
                hoverClasses[hover],
                gradient && gradientClasses[gradient],
                onClick && "cursor-pointer interactive",
                stateClasses,
                className
            )}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={hover === "tilt" ? tiltStyle : hover === "magnetic" ? magneticStyle : {}}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl z-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {success && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center animate-bounceIn">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
            {error && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center animate-shake">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            )}
            {children}
        </div>
    );
};
