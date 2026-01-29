"use client"

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { parseISO, differenceInMinutes, isSameDay } from "date-fns";
import { BellRing } from "lucide-react";

export function LecturerTaskReminder() {
    const [tasks, setTasks] = useState<any[]>([]);
    const notifiedTasksRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('/api/lecturer/tasks');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTasks(data);
                }
            } catch (error) {
                console.error("Failed to fetch tasks for reminders", error);
            }
        };

        fetchTasks();
        // Refresh tasks every 5 minutes
        const intervalId = setInterval(fetchTasks, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const checkUpcomingTasks = () => {
            const now = new Date();

            tasks.forEach(task => {
                if (notifiedTasksRef.current.has(task._id)) return;
                if (task.status === 'completed') return;

                const taskDate = new Date(task.date);
                if (!isSameDay(taskDate, now)) return;

                const [hours, minutes] = task.startTime.split(':').map(Number);
                const taskStartTime = new Date(now);
                taskStartTime.setHours(hours, minutes, 0, 0);

                const diff = differenceInMinutes(taskStartTime, now);

                // If task is in exactly 30 minutes (or within a 1-minute window around it for robustness)
                if (diff > 0 && diff <= 30) {
                    toast.info("Upcoming Task Reminder", {
                        description: `"${task.title}" starts at ${task.startTime}. (In approx. ${diff} mins)`,
                        icon: <BellRing className="h-4 w-4" />,
                        duration: 10000,
                    });
                    notifiedTasksRef.current.add(task._id);
                }
            });
        };

        const intervalId = setInterval(checkUpcomingTasks, 15000); // Check every 15 seconds
        checkUpcomingTasks(); // Initial check

        return () => clearInterval(intervalId);
    }, [tasks]);

    return null; // This component doesn't render anything visually
}
