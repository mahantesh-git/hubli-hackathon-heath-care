import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HealthMetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    trend?: "up" | "down";
    color?: "primary" | "secondary" | "accent" | "success" | "warning";
}

export const HealthMetricCard = ({
    title,
    value,
    change,
    icon,
    trend,
    color = "primary",
}: HealthMetricCardProps) => {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        accent: "bg-accent/10 text-accent",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
    };

    return (
        <Card className="hover-lift transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        {trend === "up" ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                        ) : trend === "down" ? (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                        ) : null}
                        <span className={trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : ""}>
                            {change > 0 ? "+" : ""}{change}%
                        </span>
                        <span>from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
