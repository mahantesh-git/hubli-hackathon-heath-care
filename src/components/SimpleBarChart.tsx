import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Activity } from "lucide-react";

interface SimpleChartProps {
    data: { label: string; value: number }[];
    title: string;
    description?: string;
}

export const SimpleBarChart = ({ data, title, description }: SimpleChartProps) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <Card className="hover-lift">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{item.label}</span>
                                <span className="text-muted-foreground">{item.value}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full gradient-primary transition-all duration-500 ease-out"
                                    style={{
                                        width: `${(item.value / maxValue) * 100}%`,
                                        animationDelay: `${index * 100}ms`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
