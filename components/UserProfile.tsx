"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserProfileProps {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    className?: string;
    href?: string;
}

export function UserProfile({ name, email, image, className, href }: UserProfileProps) {
    const initials = name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    const content = (
        <>
            <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={image || ""} alt={name || "User"} />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden text-left">
                <p className="text-sm font-medium leading-none truncate text-foreground">
                    {name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate" title={email || ""}>
                    {email}
                </p>
            </div>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer", className)}
            >
                {content}
            </Link>
        );
    }

    return (
        <div className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors", className)}>
            {content}
        </div>
    );
}
