
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface BaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    mode: 'create' | 'edit';
    initialData?: any;
    parentId?: string; // For creating children (e.g. creating dept under specific faculty)
}

export function FacultyDialog({ open, onOpenChange, onSuccess, mode, initialData }: BaseDialogProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && mode === 'edit' && initialData) {
            setName(initialData.name);
        } else {
            setName("");
        }
    }, [open, mode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = '/api/admin/faculties';
            const method = mode === 'create' ? 'POST' : 'PUT';
            const body = mode === 'create' ? { name } : { id: initialData._id, name };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Failed to save faculty");
            toast.success(`Faculty ${mode === 'create' ? 'created' : 'updated'} successfully`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create Faculty' : 'Edit Faculty'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Faculty Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Faculty of Engineering" required />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function DepartmentDialog({ open, onOpenChange, onSuccess, mode, initialData, parentId }: BaseDialogProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && mode === 'edit' && initialData) {
            setName(initialData.name);
        } else {
            setName("");
        }
    }, [open, mode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = '/api/admin/departments';
            const method = mode === 'create' ? 'POST' : 'PUT';
            const body = mode === 'create' ? { name, facultyId: parentId } : { id: initialData._id, name };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Failed to save department");
            toast.success(`Department ${mode === 'create' ? 'created' : 'updated'} successfully`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create Department' : 'Edit Department'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Department Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Science" required />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function DegreeDialog({ open, onOpenChange, onSuccess, mode, initialData, parentId }: BaseDialogProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && mode === 'edit' && initialData) {
            setName(initialData.name);
        } else {
            setName("");
        }
    }, [open, mode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = '/api/admin/degrees';
            const method = mode === 'create' ? 'POST' : 'PUT';
            const body = mode === 'create' ? { name, departmentId: parentId } : { id: initialData._id, name };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Failed to save degree");
            toast.success(`Degree ${mode === 'create' ? 'created' : 'updated'} successfully`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create Degree Program' : 'Edit Degree Program'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Degree Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BSc in Software Engineering" required />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function ModuleDialog({ open, onOpenChange, onSuccess, mode, initialData, parentId }: BaseDialogProps) {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [credits, setCredits] = useState(3);
    const [semester, setSemester] = useState("Sem 1");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && mode === 'edit' && initialData) {
            setName(initialData.name);
            setCode(initialData.code);
            setCredits(initialData.credits);
            setSemester(initialData.semester);
        } else {
            setName("");
            setCode("");
            setCredits(3);
            setSemester("Sem 1");
        }
    }, [open, mode, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = '/api/admin/modules';
            const method = mode === 'create' ? 'POST' : 'PUT';
            const body = mode === 'create'
                ? { name, code, credits, semester, degreeId: parentId }
                : { id: initialData._id, name, code, credits, semester };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Failed to save updated module");
            toast.success(`Module ${mode === 'create' ? 'created' : 'updated'} successfully`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? 'Create Module' : 'Edit Module'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS101" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Credits</Label>
                            <Input type="number" min="1" max="10" value={credits} onChange={e => setCredits(Number(e.target.value))} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Module Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Introduction to Programming" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Semester</Label>
                        <Select value={semester} onValueChange={setSemester}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
