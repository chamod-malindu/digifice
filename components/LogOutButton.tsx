"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogOutButtonProps {
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function LogOutButton({ className, variant = "ghost" }: LogOutButtonProps) {
    return (
        <Button
            variant={variant}
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn("w-full justify-start gap-2", className)}
        >
            <LogOut className="w-4 h-4" />
            Logout
        </Button>
    );
}
