import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    callback: () => void;
    description?: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            shortcuts.forEach((shortcut) => {
                const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const matchesCtrl = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;

                if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
                    event.preventDefault();
                    shortcut.callback();
                }
            });
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    return shortcuts;
};
