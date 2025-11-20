import { useState } from "react";
import { Plus, X, Home, Activity, History, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FloatingAction {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
}

interface FloatingActionMenuProps {
    actions?: FloatingAction[];
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export const FloatingActionMenu = ({
    actions: customActions,
    position = "bottom-right",
}: FloatingActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const defaultActions: FloatingAction[] = [
        {
            icon: <Home className="h-5 w-5" />,
            label: "Dashboard",
            onClick: () => navigate("/dashboard"),
            color: "gradient-primary",
        },
        {
            icon: <Activity className="h-5 w-5" />,
            label: "New Check",
            onClick: () => navigate("/symptom-checker"),
            color: "gradient-secondary",
        },
        {
            icon: <History className="h-5 w-5" />,
            label: "History",
            onClick: () => navigate("/history"),
            color: "gradient-accent",
        },
        {
            icon: <User className="h-5 w-5" />,
            label: "Profile",
            onClick: () => navigate("/profile"),
            color: "gradient-primary",
        },
        {
            icon: <Settings className="h-5 w-5" />,
            label: "Settings",
            onClick: () => navigate("/settings"),
            color: "gradient-secondary",
        },
    ];

    const actions = customActions || defaultActions;

    const positionClasses = {
        "bottom-right": "bottom-8 right-8",
        "bottom-left": "bottom-8 left-8",
        "top-right": "top-8 right-8",
        "top-left": "top-8 left-8",
    };

    const handleActionClick = (action: FloatingAction) => {
        action.onClick();
        setIsOpen(false);
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-50`}>
            {/* Action Buttons */}
            <div className="relative">
                {isOpen && (
                    <div className="absolute bottom-20 right-0 flex flex-col gap-3 animate-slideUp">
                        {actions.map((action, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 group"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Label */}
                                <div className="glass px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    <span className="text-sm font-medium">{action.label}</span>
                                </div>

                                {/* Action Button */}
                                <Button
                                    size="icon"
                                    onClick={() => handleActionClick(action)}
                                    className={`w-12 h-12 rounded-full ${action.color || "gradient-primary"
                                        } hover-lift shadow-colored animate-bounceIn`}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {action.icon}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main FAB */}
                <Button
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-16 h-16 rounded-full gradient-rainbow hover-lift shadow-colored-lg transition-transform ${isOpen ? "rotate-45" : ""
                        }`}
                >
                    {isOpen ? <X className="h-6 w-6 text-white" /> : <Plus className="h-6 w-6 text-white" />}
                </Button>
            </div>
        </div>
    );
};
