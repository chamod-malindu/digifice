"use client"

import { useEffect, useState } from "react"
import { useInterval } from "@/hooks/useInterval"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Megaphone } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function StudentNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);

    const handleDelete = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n._id !== id));

        try {
            await fetch('/api/student/notifications', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        } catch (error) {
            console.error("Failed to delete notification", error);
            // Revert if needed, but for notifications it's usually fine to fail silently or retry
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/student/notifications');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNotifications(data);
                    // Mark all as read after fetching (or on view)
                    if (data.some((n: any) => !n.read)) {
                        await fetch('/api/student/notifications', { method: 'PATCH', body: JSON.stringify({}) });
                    }
                }
            } catch (error) {
                console.error("Failed to load notifications", error);
            }
        };

        fetchNotifications();
    }, []);

    // Real-time polling
    useInterval(() => {
        const refresh = async () => {
            try {
                const res = await fetch('/api/student/notifications');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNotifications(data);
                }
            } catch (error) {
                // silent
            }
        };
        refresh();
    }, 5000);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'notice': return <Megaphone className="h-5 w-5 text-blue-600 animate-pulse" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                <p className="text-muted-foreground">Stay updated with important alerts and messages.</p>
            </div>

            <div className="space-y-3 max-w-3xl">
                {notifications.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Bell className="h-10 w-10 mb-2 opacity-20" />
                            <p>No new notifications</p>
                        </CardContent>
                    </Card>
                ) : (
                    notifications.map((notification) => (
                        <Card key={notification._id} className={cn("transition-all relative group hover:shadow-md border",
                            !notification.read && "bg-muted/30",
                            // Use standard background for notices, perhaps just slightly different if unread
                            notification.type === 'notice' && !notification.read && "bg-muted/40"
                        )}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className={cn("mt-1 shrink-0 p-2 rounded-full bg-background border shadow-sm",
                                    // Use standard colors for icon container too
                                    notification.type === 'notice' && "text-foreground"
                                )}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center justify-between pr-8">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm text-foreground">
                                                {notification.title}
                                            </p>
                                            {notification.meta && (
                                                <span className="px-2 py-0.5 rounded-md bg-secondary/80 text-[10px] text-secondary-foreground font-medium uppercase tracking-wider">
                                                    {notification.meta.module}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
                                    {notification.meta?.author && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="text-[10px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                                                Posted by {notification.meta.author}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDelete(notification._id)}
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground"
                                    aria-label="Dismiss"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

        </div>
    )
}
