"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useInterval } from "@/hooks/useInterval";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function StudentNav() {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(0);

    const routes = [
        {
            href: "/student",
            label: "Dashboard",
            active: pathname === "/student",
        },
        {
            href: "/student/results",
            label: "Results",
            active: pathname === "/student/results",
        },
        {
            href: "/student/medical",
            label: "Medical",
            active: pathname === "/student/medical",
        },
        {
            href: "/student/notifications",
            label: "Notifications",
            active: pathname === "/student/notifications",
            hasBadge: true,
        },
    ];

    useEffect(() => {
        const checkUnread = async () => {
            if (pathname === '/student/notifications') {
                setUnreadCount(0);
                return;
            }

            try {
                const res = await fetch('/api/student/notifications');
                const notifications = await res.json();

                if (Array.isArray(notifications)) {
                    const unread = notifications.filter((n: any) => !n.read).length;
                    setUnreadCount(unread);
                }
            } catch (error) {
                console.error("Failed to check unread notifications", error);
            }
        };

        checkUnread();
    }, [pathname]); // Check on path change too

    // Track previous count to detect new items
    const [prevUnreadCount, setPrevUnreadCount] = useState(0);

    useEffect(() => {
        // Request permission on mount
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Real-time polling every 5 seconds
    useInterval(() => {
        // Only pool if not on the notifications page itself
        if (pathname !== '/student/notifications') {
            const checkUnread = async () => {
                try {
                    const res = await fetch('/api/student/notifications');
                    const notifications = await res.json();

                    if (Array.isArray(notifications)) {
                        const unread = notifications.filter((n: any) => !n.read).length;

                        // If count increased, trigger notification
                        if (unread > prevUnreadCount) {
                            const newItems = notifications.filter((n: any) => !n.read);
                            // Just show the latest one to avoid spam
                            if (newItems.length > 0 && "Notification" in window && Notification.permission === "granted") {
                                const latest = newItems[0];
                                new Notification(latest.title, {
                                    body: latest.message,
                                    icon: '/globe.svg' // Fallback icon
                                });
                            }
                        }

                        setUnreadCount(unread);
                        setPrevUnreadCount(unread);
                    }
                } catch (error) {
                    // silent fail
                }
            };
            checkUnread();
        }
    }, 5000);

    // Helper to force refresh badge when logic updates (e.g. storage event? or just rely heavily on mount)
    // For now, simplicity is key. The page load will trigger it.

    return (
        <nav className="px-4 space-y-1">
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        "flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors",
                        route.active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                >
                    <span>{route.label}</span>
                    {route.hasBadge && unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                            {unreadCount}
                        </Badge>
                    )}
                </Link>
            ))}
        </nav>
    );
}
