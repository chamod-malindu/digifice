"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

interface Department {
    _id: string;
    name: string;
}

interface Faculty {
    _id: string;
    name: string;
}

interface StudentAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentId: string;
    currentFacultyId?: string;
    currentDepartmentId?: string;
    studentName: string;
    onSuccess: () => void;
}

export function StudentAssignmentDialog({
    open,
    onOpenChange,
    studentId,
    currentFacultyId,
    currentDepartmentId,
    studentName,
    onSuccess
}: StudentAssignmentDialogProps) {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Selection States
    const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

    // Popover States
    const [openFaculty, setOpenFaculty] = useState(false);
    const [openDepartment, setOpenDepartment] = useState(false);

    const [loading, setLoading] = useState(false);

    // Initial Data Fetch (Faculties)
    useEffect(() => {
        if (open) {
            fetch('/api/hierarchy?type=faculty')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setFaculties(data);
                })
                .catch(err => toast.error("Failed to load faculties"));

            if (currentFacultyId) setSelectedFaculty(currentFacultyId);
            if (currentDepartmentId) setSelectedDepartment(currentDepartmentId);
        }
    }, [open, currentFacultyId, currentDepartmentId]);

    // Fetch Departments when Faculty changes
    useEffect(() => {
        if (selectedFaculty) {
            fetch(`/api/hierarchy?type=department&parentId=${selectedFaculty}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setDepartments(data);
                    else setDepartments([]);
                })
                .catch(err => console.error("Failed to load departments"));
        } else {
            setDepartments([]);
        }
    }, [selectedFaculty]);

    const [modules, setModules] = useState<{ _id: string, name: string, code: string }[]>([]);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);

    useEffect(() => {
        if (open && studentId) {
            // 1. Fetch All Modules
            fetch('/api/admin/modules')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setModules(data);
                    }
                })
                .catch(err => toast.error("Failed to load modules"));

            // 2. Fetch Student's Enrollments
            fetch(`/api/admin/students/${studentId}/enrollments`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setSelectedModules(data);
                    }
                })
                .catch(err => console.error("Failed to load enrollments"));
        }
    }, [open, studentId]);

    const handleSave = async () => {
        setLoading(true);

        try {
            // Save Faculty/Dept
            const userRes = await fetch(`/api/users/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    department: selectedDepartment || null
                })
            });

            // Save Enrollments
            const enrollRes = await fetch(`/api/admin/students/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    moduleIds: selectedModules
                })
            });

            if (userRes.ok && enrollRes.ok) {
                toast.success("Student updated successfully");
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error("Failed to update student");
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
                    <DialogTitle>Manage Student</DialogTitle>
                    <DialogDescription>
                        Update details and course enrollments for <strong>{studentName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                        <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary p-1 rounded">1</span> Academic Details
                        </h4>

                        {/* Faculty Selection */}
                        <div className="grid gap-2">
                            <Label className="text-xs">Faculty</Label>
                            <Popover open={openFaculty} onOpenChange={setOpenFaculty}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openFaculty}
                                        className="w-full justify-between h-9 text-sm"
                                    >
                                        {selectedFaculty
                                            ? faculties.find((f) => f._id === selectedFaculty)?.name
                                            : "Select faculty..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search faculty..." />
                                        <CommandList>
                                            <CommandEmpty>No faculty found.</CommandEmpty>
                                            <CommandGroup>
                                                {faculties.map((faculty) => (
                                                    <CommandItem
                                                        key={faculty._id}
                                                        value={faculty.name}
                                                        onSelect={() => {
                                                            setSelectedFaculty(faculty._id);
                                                            setSelectedDepartment(null);
                                                            setOpenFaculty(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedFaculty === faculty._id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {faculty.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Department Selection */}
                        <div className="grid gap-2">
                            <Label className="text-xs">Department</Label>
                            <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openDepartment}
                                        className="w-full justify-between h-9 text-sm"
                                        disabled={!selectedFaculty}
                                    >
                                        {selectedDepartment
                                            ? departments.find((d) => d._id === selectedDepartment)?.name
                                            : "Select department..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search department..." />
                                        <CommandList>
                                            <CommandEmpty>No department found.</CommandEmpty>
                                            <CommandGroup>
                                                {departments.map((dept) => (
                                                    <CommandItem
                                                        key={dept._id}
                                                        value={dept.name}
                                                        onSelect={() => {
                                                            setSelectedDepartment(dept._id);
                                                            setOpenDepartment(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedDepartment === dept._id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {dept.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2 border rounded-md p-4 bg-muted/20">
                        <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary p-1 rounded">2</span> Course Enrollments
                        </h4>

                        <div className="h-[200px] overflow-y-auto border rounded-md bg-background p-2">
                            {modules.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No modules available</p>
                            ) : (
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
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
