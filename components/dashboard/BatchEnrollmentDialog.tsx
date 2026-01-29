"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface BatchEnrollmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentCount: number;
    studentIds: string[];
    onSuccess: () => void;
}

export function BatchEnrollmentDialog({
    open,
    onOpenChange,
    studentCount,
    studentIds,
    onSuccess
}: BatchEnrollmentDialogProps) {
    const [modules, setModules] = useState<{ _id: string, name: string, code: string }[]>([]);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetch('/api/admin/modules')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setModules(data);
                    }
                })
                .catch(err => toast.error("Failed to load modules"));
        } else {
            setSelectedModules([]);
        }
    }, [open]);

    const handleSave = async () => {
        if (selectedModules.length === 0) {
            toast.warning("Please select at least one module");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/students/batch-enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentIds,
                    moduleIds: selectedModules
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Successfully enrolled in ${data.createdCount} new assignments.`);
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error("Failed to enroll students");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const toggleModule = (moduleId: string) => {
        setSelectedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Batch Module Assignment</DialogTitle>
                    <DialogDescription>
                        Assigning modules to <strong>{studentCount}</strong> selected students.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <h4 className="text-sm font-medium mb-2">Select Modules</h4>
                    <div className="h-[300px] overflow-y-auto border rounded-md bg-background p-2">
                        <div className="space-y-1">
                            {modules.map(module => (
                                <div
                                    key={module._id}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors",
                                        selectedModules.includes(module._id) && "bg-primary/5 border-primary/20"
                                    )}
                                    onClick={() => toggleModule(module._id)}
                                >
                                    <div className={cn(
                                        "h-4 w-4 border rounded-sm flex items-center justify-center transition-colors",
                                        selectedModules.includes(module._id) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                    )}>
                                        {selectedModules.includes(module._id) && <Check className="h-3 w-3" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">{module.code}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{module.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                        Students will be enrolled in the selected modules if they aren't already. Existing enrollments are preserved.
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading || selectedModules.length === 0}>
                        {loading ? "Assigning..." : "Assign Modules"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
