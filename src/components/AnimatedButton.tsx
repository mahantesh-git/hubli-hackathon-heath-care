import { ReactNode, useState, useRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, Loader2 } from "lucide-react";

interface AnimatedButtonProps extends ButtonProps {
    children: ReactNode;
    ripple?: boolean;
    magnetic?: boolean;
    loading?: boolean;
    success?: boolean;
    error?: boolean;
    loadingText?: string;
    successText?: string;
    errorText?: string;
    onAnimationComplete?: () => void;
}

export const AnimatedButton = ({
    children,
    className,
    ripple = true,
    magnetic = false,
    loading = false,
    success = false,
    error = false,
    loadingText,
    successText,
    errorText,
    onAnimationComplete,
    onClick,
    ...props
}: AnimatedButtonProps) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const [magneticStyle, setMagneticStyle] = useState({});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleIdRef = useRef(0);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (ripple && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = rippleIdRef.current++;

            setRipples((prev) => [...prev, { x, y, id }]);

            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== id));
            }, 600);
        }

        onClick?.(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!magnetic || !buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const moveX = ((x - centerX) / centerX) * 5;
        const moveY = ((y - centerY) / centerY) * 5;

        setMagneticStyle({
            transform: `translate(${moveX}px, ${moveY}px)`,
        });
    };

    const handleMouseLeave = () => {
        setMagneticStyle({});
    };

    const getContent = () => {
        if (loading) {
            return (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {loadingText && <span className="ml-2">{loadingText}</span>}
                </>
            );
        }

        if (success) {
            return (
                <>
                    <Check className="h-4 w-4 animate-bounceIn" />
                    {successText && <span className="ml-2">{successText}</span>}
                </>
            );
        }

        if (error) {
            return (
                <>
                    <X className="h-4 w-4 animate-shake" />
                    {errorText && <span className="ml-2">{errorText}</span>}
                </>
            );
        }

        return children;
    };

    return (
        <Button
            ref={buttonRef}
            className={cn(
                "relative overflow-hidden transition-all",
                magnetic && "transition-transform duration-200",
                loading && "pointer-events-none opacity-80",
                success && "bg-success hover:bg-success/90",
                error && "bg-destructive hover:bg-destructive/90",
                className
            )}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={magneticStyle}
            {...props}
        >
            {/* Ripple effects */}
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/30 pointer-events-none animate-[ripple_0.6s_ease-out]"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: 0,
                        height: 0,
                    }}
                />
            ))}

            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {getContent()}
            </span>
        </Button>
    );
};
