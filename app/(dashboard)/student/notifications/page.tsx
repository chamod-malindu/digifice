"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function StudentNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);

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

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                <p className="text-muted-foreground">Stay updated with important alerts and messages.</p>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Bell className="h-10 w-10 mb-2 opacity-20" />
                            <p>No new notifications</p>
                        </CardContent>
                    </Card>
                ) : (
                    notifications.map((notification) => (
                        <Card key={notification._id} className={cn("transition-all", !notification.read && "border-l-4 border-l-primary bg-muted/10")}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="mt-1 shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm text-foreground">{notification.title}</p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

        </div>
    )
}
