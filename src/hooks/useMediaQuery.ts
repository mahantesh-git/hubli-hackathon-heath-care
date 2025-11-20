import { useEffect, useState } from "react";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints: Record<Breakpoint, string> = {
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
    xl: "(min-width: 1280px)",
    "2xl": "(min-width: 1536px)",
};

export const useMediaQuery = (breakpoint: Breakpoint | string): boolean => {
    const query = breakpoints[breakpoint as Breakpoint] || breakpoint;
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);

        // Set initial value
        setMatches(media.matches);

        // Create event listener
        const listener = (e: MediaQueryListEvent) => {
            setMatches(e.matches);
        };

        // Add listener
        media.addEventListener("change", listener);

        // Cleanup
        return () => {
            media.removeEventListener("change", listener);
        };
    }, [query]);

    return matches;
};

// Helper hooks for common breakpoints
export const useIsMobile = () => !useMediaQuery("md");
export const useIsTablet = () => useMediaQuery("md") && !useMediaQuery("lg");
export const useIsDesktop = () => useMediaQuery("lg");
