interface SkeletonLoaderProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string;
    height?: string;
    count?: number;
}

export const SkeletonLoader = ({
    className = "",
    variant = "rectangular",
    width,
    height,
    count = 1,
}: SkeletonLoaderProps) => {
    const variantClasses = {
        text: "h-4 w-full rounded",
        circular: "rounded-full",
        rectangular: "rounded-lg",
    };

    const skeletonStyle = {
        width: width || (variant === "circular" ? "40px" : "100%"),
        height: height || (variant === "circular" ? "40px" : variant === "text" ? "16px" : "100px"),
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`animate-shimmer ${variantClasses[variant]} ${className}`}
                    style={skeletonStyle}
                    aria-hidden="true"
                />
            ))}
        </>
    );
};
