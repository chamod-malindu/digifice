"use client";

import { Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function FontSizeToggle({ className }: { className?: string }) {
    const [isLarge, setIsLarge] = useState(false);

    useEffect(() => {
        // Check initial state
        const isLargeMode = document.documentElement.classList.contains("text-lg-mode");
        setIsLarge(isLargeMode);
    }, []);

    const toggleFontSize = () => {
        const root = document.documentElement; // using root (html) as it's often better for rem scaling
        if (isLarge) {
            root.classList.remove("text-lg-mode");
            localStorage.setItem("fontSize", "normal");
            setIsLarge(false);
        } else {
            root.classList.add("text-lg-mode");
            localStorage.setItem("fontSize", "large");
            setIsLarge(true);
        }
    };

    // Optional: persist on load (usually needs script in head to avoid flicker, but effect is okay here)
    useEffect(() => {
        const stored = localStorage.getItem("fontSize");
        if (stored === "large") {
            document.documentElement.classList.add("text-lg-mode");
            setIsLarge(true);
        }
    }, []);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleFontSize}
            className={`${isLarge ? "bg-accent text-accent-foreground" : ""} ${className || ""}`}
            title="Toggle Font Size"
        >
            <Type className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Toggle font size</span>
        </Button>
    );
}
