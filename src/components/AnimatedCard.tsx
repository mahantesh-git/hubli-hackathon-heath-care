import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ReactNode, CSSProperties, useState, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AnimatedCardProps {
    children?: ReactNode;
    title?: string;
    description?: string;
    icon?: ReactNode;
    className?: string;
    onClick?: () => void;
    gradient?: "primary" | "secondary" | "accent" | "rainbow";
    hover?: "lift" | "glow" | "scale" | "tilt";
    style?: CSSProperties;
    expandable?: boolean;
    defaultExpanded?: boolean;
    loading?: boolean;
    badge?: ReactNode;
}

export const AnimatedCard = ({
    children,
    title,
    description,
    icon,
    className = "",
    onClick,
    gradient,
    hover = "lift",
    expandable = false,
    defaultExpanded = true,
    loading = false,
    badge,
    ...props
}: AnimatedCardProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [tiltStyle, setTiltStyle] = useState({});
    const cardRef = useRef<HTMLDivElement>(null);

    const hoverClasses = {
        lift: "hover-lift",
        glow: "hover-glow",
        scale: "hover-scale",
        tilt: "transform-3d transition-transform duration-300",
    };

    const gradientClasses = {
        primary: "gradient-primary text-white",
        secondary: "gradient-secondary text-white",
        accent: "gradient-accent text-white",
        rainbow: "gradient-rainbow text-white",
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (hover !== "tilt" || !cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        setTiltStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        });
    };

    const handleMouseLeave = () => {
        if (hover === "tilt") {
            setTiltStyle({});
        }
    };

    const handleToggle = (e: React.MouseEvent) => {
        if (expandable) {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <Card
            ref={cardRef}
            className={`transition-smooth relative ${hoverClasses[hover]} ${gradient ? gradientClasses[gradient] : ""} ${onClick ? "cursor-pointer" : ""} ${loading ? "overflow-hidden" : ""} ${className}`}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={hover === "tilt" ? tiltStyle : props.style}
        >
            {loading && (
                <div className="absolute inset-0 skeleton z-10" />
            )}

            {badge && (
                <div className="absolute top-3 right-3 z-20">
                    {badge}
                </div>
            )}

            {(title || description || icon) && (
                <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {icon && <div className="mb-4">{icon}</div>}
                            {title && <CardTitle className={gradient ? "text-white" : ""}>{title}</CardTitle>}
                            {description && (
                                <CardDescription className={gradient ? "text-white/90" : ""}>
                                    {description}
                                </CardDescription>
                            )}
                        </div>
                        {expandable && (
                            <button
                                onClick={handleToggle}
                                className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronUp className={`h-5 w-5 ${gradient ? "text-white" : ""}`} />
                                ) : (
                                    <ChevronDown className={`h-5 w-5 ${gradient ? "text-white" : ""}`} />
                                )}
                            </button>
                        )}
                    </div>
                </CardHeader>
            )}

            {children && (
                <div
                    className={`transition-all duration-300 overflow-hidden ${expandable && !isExpanded ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
                        }`}
                >
                    <CardContent>{children}</CardContent>
                </div>
            )}
        </Card>
    );
};

