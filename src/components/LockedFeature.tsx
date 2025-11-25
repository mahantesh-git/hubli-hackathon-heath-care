import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { PremiumBadge } from "./PremiumBadge";
import { ReactNode } from "react";

interface LockedFeatureProps {
    children: ReactNode;
    isLocked: boolean;
    onUnlock: () => void;
    featureName?: string;
    blurAmount?: "sm" | "md" | "lg";
}

export const LockedFeature = ({
    children,
    isLocked,
    onUnlock,
    featureName = "this feature",
    blurAmount = "md",
}: LockedFeatureProps) => {
    const blurClasses = {
        sm: "blur-[2px]",
        md: "blur-[4px]",
        lg: "blur-[8px]",
    };

    if (!isLocked) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            {/* Blurred content preview */}
            <div className={`${blurClasses[blurAmount]} pointer-events-none select-none`}>
                {children}
            </div>

            {/* Overlay with unlock button */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center p-6 max-w-sm">
                    <div className="mb-4 flex justify-center">
                        <div className="w-16 h-16 rounded-full gradient-rainbow flex items-center justify-center animate-pulse">
                            <Lock className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    <div className="mb-3 flex justify-center">
                        <PremiumBadge size="lg" />
                    </div>

                    <h3 className="text-xl font-bold mb-2">
                        Unlock {featureName}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4">
                        Upgrade to Premium to access detailed health insights, doctor recommendations, and more!
                    </p>

                    <Button
                        onClick={onUnlock}
                        className="gradient-primary hover-scale"
                    >
                        <Lock className="mr-2 h-4 w-4" />
                        Unlock Premium
                    </Button>
                </div>
            </div>
        </div>
    );
};
