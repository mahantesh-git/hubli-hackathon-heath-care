import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";

interface HealthMetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    trend?: "up" | "down";
    color?: "primary" | "secondary" | "accent" | "success" | "warning";
    sparklineData?: number[];
    alert?: boolean;
    onClick?: () => void;
}

export const HealthMetricCard = ({
    title,
    value,
    change,
    icon,
    trend,
    color = "primary",
    sparklineData,
    alert = false,
    onClick,
}: HealthMetricCardProps) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        accent: "bg-accent/10 text-accent",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
    };

    const borderColors = {
        primary: "border-primary/20",
        secondary: "border-secondary/20",
        accent: "border-accent/20",
        success: "border-success/20",
        warning: "border-warning/20",
    };

    // Animated number counting
    useEffect(() => {
        if (typeof value === "number") {
            const duration = 1000;
            const steps = 60;
            const stepValue = value / steps;
            let currentStep = 0;

            const timer = setInterval(() => {
                currentStep++;
                setDisplayValue(Math.min(stepValue * currentStep, value));

                if (currentStep >= steps) {
                    clearInterval(timer);
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [value]);

    // Generate sparkline path
    const generateSparklinePath = () => {
        if (!sparklineData || sparklineData.length === 0) return "";

        const width = 100;
        const height = 30;
        const max = Math.max(...sparklineData);
        const min = Math.min(...sparklineData);
        const range = max - min || 1;

        const points = sparklineData.map((val, i) => {
            const x = (i / (sparklineData.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        });

        return `M ${points.join(" L ")}`;
    };

    return (
        <Card
            className={`hover-lift transition-smooth ${onClick ? "cursor-pointer" : ""} ${alert ? "animate-pulse border-2" : ""} ${borderColors[color]}`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`p-2 rounded-lg transition-transform ${colorClasses[color]} ${isHovered ? "scale-110" : ""}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold animate-countUp">
                    {typeof value === "number" ? Math.round(displayValue) : value}
                </div>

                {change !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        {trend === "up" ? (
                            <TrendingUp className="h-3 w-3 text-success animate-bounce" />
                        ) : trend === "down" ? (
                            <TrendingDown className="h-3 w-3 text-destructive animate-bounce" />
                        ) : null}
                        <span className={trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : ""}>
                            {change > 0 ? "+" : ""}{change}%
                        </span>
                        <span>from last month</span>
                    </div>
                )}

                {/* Sparkline */}
                {sparklineData && sparklineData.length > 0 && (
                    <div className="mt-3 opacity-50 hover:opacity-100 transition-opacity">
                        <svg width="100" height="30" className="w-full">
                            <path
                                d={generateSparklinePath()}
                                fill="none"
                                stroke={`hsl(var(--${color}))`}
                                strokeWidth="2"
                                className="transition-all"
                            />
                        </svg>
                    </div>
                )}

                {/* Hover Details */}
                {isHovered && onClick && (
                    <div className="mt-2 text-xs text-muted-foreground animate-fadeIn">
                        Click for details →
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

