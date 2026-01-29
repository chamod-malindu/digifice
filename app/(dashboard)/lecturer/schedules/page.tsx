"use client"

import { useEffect, useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Timer, RotateCcw } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Generate hours for time picker (08:00 to 18:00)
const timeSlots = Array.from({ length: 24 }, (_, i) => { // 0 to 23
    const h = i.toString().padStart(2, '0');
    return [`${h}:00`, `${h}:30`];
}).flat().filter(t => {
    const h = parseInt(t.split(':')[0]);
    return h >= 7 && h <= 20; // 7 AM to 8 PM
});


export default function SchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [status, setStatus] = useState("planned");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/lecturer/tasks');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
            toast.error("Could not load tasks");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) return;
        setIsSaving(true);

        try {
            const endpoint = '/api/lecturer/tasks';
            const method = editingTask ? 'PATCH' : 'POST';
            const body = {
                title: newTaskTitle,
                date: date,
                startTime,
                endTime,
                status,
                ...(editingTask && { _id: editingTask._id })
            };

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save task");
            }

            await fetchTasks();
            toast.success(editingTask ? "Task updated" : "Task scheduled");
            setIsDialogOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Failed to save task");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setNewTaskTitle("");
        setStartTime("09:00");
        setEndTime("10:00");
        setStatus("planned");
        setEditingTask(null);
    };

    const handleEditClick = (task: any) => {
        setEditingTask(task);
        setNewTaskTitle(task.title);
        setStartTime(task.startTime);
        setEndTime(task.endTime);
        setStatus(task.status || "planned");
        setIsDialogOpen(true);
    };

    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        try {
            // Optimistic Update
            const originalTasks = [...tasks];
            setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

            const res = await fetch('/api/lecturer/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: taskId, status: newStatus })
            });

            if (!res.ok) {
                setTasks(originalTasks); // Revert on failure
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update status");
            }

            const updatedTask = await res.json();
            // Ensure we use the server's version to be safe
            setTasks(originalTasks.map(t => t._id === taskId ? updatedTask : t));
            toast.success(`Task status updated to ${newStatus}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const isPastTask = (taskDate: string | Date, endTime: string) => {
        const now = new Date();
        const [hours, minutes] = endTime.split(':').map(Number);
        const taskEnd = new Date(taskDate);
        taskEnd.setHours(hours, minutes, 0, 0);
        return now > taskEnd;
    };

    const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/lecturer/tasks?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed");
            setTasks(tasks.filter(t => t._id !== id));
            toast.success("Task removed");
        } catch (error) {
            toast.error("Failed to remove task");
        }
    };

    const selectedDateTasks = tasks.filter(task =>
        date && isSameDay(new Date(task.date), date)
    );

    const stats = {
        planned: selectedDateTasks.filter(t => t.status === 'planned' || !t.status).length,
        completed: selectedDateTasks.filter(t => t.status === 'completed').length,
        postponed: selectedDateTasks.filter(t => t.status === 'postponed').length,
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case 'postponed': return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
        }
    };

    const getCardStyles = (status: string) => {
        switch (status) {
            case 'completed': return "bg-emerald-500/5 border-emerald-500/20";
            case 'postponed': return "bg-amber-500/5 border-amber-500/20";
            case 'planned': return "bg-blue-500/5 border-blue-500/20";
            default: return "";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Schedule & Tasks</h2>
                <p className="text-muted-foreground">Manage your daily lectures and tasks.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Calendar</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center p-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">Daily Summary</CardTitle>
                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                                    {date ? format(date, "MMM do") : ""}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 border rounded-lg bg-blue-500/5 border-blue-500/10">
                                    <div className="text-xl font-bold text-blue-600">{stats.planned}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase">Planned</div>
                                </div>
                                <div className="p-2 border rounded-lg bg-emerald-500/5 border-emerald-500/10">
                                    <div className="text-xl font-bold text-emerald-600">{stats.completed}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase">Done</div>
                                </div>
                                <div className="p-2 border rounded-lg bg-amber-500/5 border-amber-500/10">
                                    <div className="text-xl font-bold text-amber-600">{stats.postponed}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium uppercase">Postponed</div>
                                </div>
                            </div>
                            <div className="pt-2 border-t flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Total for today</span>
                                <span className="text-sm font-bold">{selectedDateTasks.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            {date ? format(date, "EEEE, MMMM do") : "Select a date"}
                        </h3>
                        {date && (
                            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                                if (!open) resetForm();
                                setIsDialogOpen(open);
                            }}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" /> Add Task
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingTask ? "Edit Task" : "New Task"} for {format(date, "MMM do")}</DialogTitle>
                                        <DialogDescription>
                                            {editingTask ? "Update your scheduled task." : "Schedule a lecture, meeting, or reminder."}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddTask} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Task Title</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g., CS101 Lecture"
                                                value={newTaskTitle}
                                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Start Time</Label>
                                                <Select value={startTime} onValueChange={setStartTime}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[200px]">
                                                        {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>End Time</Label>
                                                <Select value={endTime} onValueChange={setEndTime}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[200px]">
                                                        {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={status} onValueChange={setStatus}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="planned">Planned</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="postponed">Postponed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <DialogFooter>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? "Saving..." : editingTask ? "Update Task" : "Schedule Task"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <RotateCcw className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : selectedDateTasks.length > 0 ? (
                            selectedDateTasks
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map(task => (
                                    <Card key={task._id} className={cn("group transition-all duration-300 overflow-hidden border-2", getCardStyles(task.status || "planned"))}>
                                        <div className="flex items-center p-4">
                                            <div className={cn("flex flex-col items-center justify-center w-20 p-2 rounded-md mr-4 text-center",
                                                task.status === 'completed' ? "bg-emerald-500/20" :
                                                    task.status === 'postponed' ? "bg-amber-500/20" : "bg-muted"
                                            )}>
                                                <span className="text-sm font-bold">{task.startTime}</span>
                                                <span className="text-xs text-muted-foreground">-</span>
                                                <span className="text-sm font-medium text-muted-foreground">{task.endTime}</span>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h4 className="font-semibold text-lg">{task.title}</h4>
                                                <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-2 py-0 h-5", getStatusStyles(task.status || "planned"))}>
                                                    {task.status || "planned"}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {task.status !== 'completed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-emerald-500 hover:bg-emerald-500/20"
                                                        onClick={() => handleUpdateStatus(task._id, 'completed')}
                                                        disabled={!isPastTask(task.date, task.endTime)}
                                                        title={!isPastTask(task.date, task.endTime) ? "Available after task ends" : "Mark as completed"}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {task.status !== 'postponed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-amber-500 hover:bg-amber-500/20"
                                                        onClick={() => handleUpdateStatus(task._id, 'postponed')}
                                                        title="Mark as postponed"
                                                    >
                                                        <Timer className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {task.status !== 'planned' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-blue-500 hover:bg-blue-500/20"
                                                        onClick={() => handleUpdateStatus(task._id, 'planned')}
                                                        title="Reset to planned"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" onClick={() => handleEditClick(task)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={(e) => handleDeleteTask(task._id, e)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className={cn("h-1.5 w-full mt-auto",
                                            task.status === 'completed' ? "bg-emerald-500" :
                                                task.status === 'postponed' ? "bg-amber-500" : "bg-blue-500"
                                        )} />
                                    </Card>
                                ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/10 text-muted-foreground">
                                <Clock className="h-10 w-10 mb-2 opacity-20" />
                                <p>No tasks scheduled for this day.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
