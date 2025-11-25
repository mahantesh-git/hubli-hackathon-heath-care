import { Crown } from "lucide-react";
import { Badge } from "./ui/badge";

interface PremiumBadgeProps {
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    className?: string;
}

export const PremiumBadge = ({
    size = "md",
    showText = true,
    className = ""
}: PremiumBadgeProps) => {
    const sizeClasses = {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    const textSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };

    return (
        <Badge
            className={`gradient-rainbow text-white px-2 py-1 ${textSizeClasses[size]} ${className}`}
        >
            <Crown className={`${sizeClasses[size]} ${showText ? 'mr-1' : ''}`} />
            {showText && "Premium"}
        </Badge>
    );
};
