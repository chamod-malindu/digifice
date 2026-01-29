"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleRowProps {
    className?: string
}

export function ThemeToggleRow({ className }: ThemeToggleRowProps) {
    const { theme, setTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className={cn("w-full justify-start gap-2", className)}
        >
            <div className="relative w-4 h-4 mr-2">
                <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </div>
            <span>Theme</span>
        </Button>
    )
}
