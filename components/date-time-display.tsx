"use client";

import { useEffect, useState } from "react";

export function DateTimeDisplay({ className }: { className?: string }) {
    const [date, setDate] = useState<Date | null>(null);

    useEffect(() => {
        setDate(new Date());
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!date) return null; // Avoid hydration mismatch

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(date);
    };

    return (
        <div className={`text-sm font-medium tabular-nums ${className || ""}`}>
            {formatDate(date)}
        </div>
    );
}
