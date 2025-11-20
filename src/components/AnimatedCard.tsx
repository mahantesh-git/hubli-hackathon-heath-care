import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ReactNode, CSSProperties } from "react";

interface AnimatedCardProps {
    children?: ReactNode;
    title?: string;
    description?: string;
    icon?: ReactNode;
    className?: string;
    onClick?: () => void;
    gradient?: "primary" | "secondary" | "accent" | "rainbow";
    hover?: "lift" | "glow" | "scale";
    style?: CSSProperties;
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
    ...props
}: AnimatedCardProps) => {
    const hoverClasses = {
        lift: "hover-lift",
        glow: "hover-glow",
        scale: "hover-scale",
    };

    const gradientClasses = {
        primary: "gradient-primary text-white",
        secondary: "gradient-secondary text-white",
        accent: "gradient-accent text-white",
        rainbow: "gradient-rainbow text-white",
    };

    return (
        <Card
            className={`transition-smooth ${hoverClasses[hover]} ${gradient ? gradientClasses[gradient] : ""} ${onClick ? "cursor-pointer" : ""} ${className}`}
            onClick={onClick}
            {...props}
        >
            {(title || description || icon) && (
                <CardHeader>
                    {icon && <div className="mb-4">{icon}</div>}
                    {title && <CardTitle className={gradient ? "text-white" : ""}>{title}</CardTitle>}
                    {description && (
                        <CardDescription className={gradient ? "text-white/90" : ""}>
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
            )}
            {children && <CardContent>{children}</CardContent>}
        </Card>
    );
};
