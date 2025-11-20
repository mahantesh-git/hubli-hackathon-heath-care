import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
    progress: number;
    size?: "sm" | "md" | "lg" | "xl";
    strokeWidth?: number;
    color?: "primary" | "secondary" | "accent" | "success" | "warning" | "destructive";
    showPercentage?: boolean;
    label?: string;
    icon?: React.ReactNode;
    animated?: boolean;
    pulse?: boolean;
}

export const ProgressRing = ({
    progress,
    size = "md",
    strokeWidth = 8,
    color = "primary",
    showPercentage = true,
    label,
    icon,
    animated = true,
    pulse = false,
}: ProgressRingProps) => {
    const [displayProgress, setDisplayProgress] = useState(0);

    const sizes = {
        sm: 64,
        md: 96,
        lg: 128,
        xl: 160,
    };

    const radius = (sizes[size] - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayProgress / 100) * circumference;

    const colorClasses = {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        destructive: "hsl(var(--destructive))",
    };

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setDisplayProgress(progress);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setDisplayProgress(progress);
        }
    }, [progress, animated]);

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={sizes[size]}
                height={sizes[size]}
                className={cn("transform -rotate-90", pulse && "animate-pulse")}
            >
                {/* Background circle */}
                <circle
                    cx={sizes[size] / 2}
                    cy={sizes[size] / 2}
                    r={radius}
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress circle */}
                <circle
                    cx={sizes[size] / 2}
                    cy={sizes[size] / 2}
                    r={radius}
                    stroke={colorClasses[color]}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn(animated && "transition-all duration-1000 ease-out")}
                    style={{
                        filter: `drop-shadow(0 0 8px ${colorClasses[color]})`,
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {icon && <div className="mb-1">{icon}</div>}
                {showPercentage && (
                    <span className={cn("font-bold text-gradient", size === "sm" && "text-sm", size === "md" && "text-xl", size === "lg" && "text-3xl", size === "xl" && "text-4xl")}>
                        {Math.round(displayProgress)}%
                    </span>
                )}
                {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
            </div>
        </div>
    );
};
