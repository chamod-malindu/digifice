"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock } from "lucide-react"
import { format, parseISO, isAfter } from "date-fns"

export function UpcomingTasks() {
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('/api/lecturer/tasks');
                const data = await res.json();

                if (Array.isArray(data)) {
                    // Filter for future tasks and sort by date
                    const now = new Date();
                    const upcoming = data
                        .filter((task: any) => {
                            const taskDate = new Date(task.date);
                            // Simple check: if date is today or future. 
                            // Refinement: check if end time is passed? For now just >= today.
                            return taskDate >= new Date(now.setHours(0, 0, 0, 0));
                        })
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 5); // Take top 5

                    setTasks(upcoming);
                }
            } catch (error) {
                console.error("Failed to fetch upcoming tasks", error);
            }
        };

        fetchTasks();
    }, []);

    if (tasks.length === 0) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No upcoming tasks scheduled
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tasks.map((task, index) => (
                        <div key={task._id || index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                            <div>
                                <p className="font-medium">{task.title}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <CalendarDays className="mr-1 h-3 w-3" />
                                    {format(new Date(task.date), 'MMM d, yyyy')}
                                </div>
                            </div>
                            <div className="flex items-center text-xs font-medium bg-muted px-2 py-1 rounded-full">
                                <Clock className="mr-1 h-3 w-3" />
                                {task.startTime} - {task.endTime}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
