"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Result } from "./columns"

const resultSchema = z.object({
    studentId: z.string().min(1, "Student is required"),
    moduleName: z.string().min(2, "Module name is required"),
    moduleCode: z.string().min(2, "Module code is required"),
    semester: z.string(),
    type: z.enum(["Exam", "Assignment", "Project", "Quiz"]),
    marks: z.coerce.number().min(0).max(100),
    grade: z.string().min(1, "Grade is required"),
})

interface ResultFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    result: Result | null
    onSuccess: () => void
    module?: any // Optional pre-selected module
}

export function ResultForm({ open, onOpenChange, result, onSuccess, module }: ResultFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [modules, setModules] = useState<{ _id: string, name: string, code: string, semester: string }[]>([])

    // Student Search State
    const [searchTerm, setSearchTerm] = useState("")
    const [studentResults, setStudentResults] = useState<{ _id: string, name: string, email: string }[]>([])
    const [selectedStudent, setSelectedStudent] = useState<{ _id: string, name: string, email: string } | null>(null)
    const [isSearchingStudents, setIsSearchingStudents] = useState(false)

    const form = useForm<z.infer<typeof resultSchema>>({
        resolver: zodResolver(resultSchema) as any,
        defaultValues: {
            studentId: "",
            moduleName: module ? module.name : "",
            moduleCode: module ? module.code : "",
            semester: module ? module.semester : "Sem 1",
            type: "Exam",
            marks: 0,
            grade: "",
        },
    })

    // Fetch modules if not provided
    useEffect(() => {
        if (open && !module) {
            fetch('/api/modules')
                .then(res => res.json())
                .then(data => setModules(data))
                .catch(err => console.error(err));
        }
    }, [open, module]);

    // Student Search Effect
    useEffect(() => {
        const fetchStudents = async () => {
            // If we have a selected student and the search term matches their name, don't search
            if (selectedStudent && (searchTerm === selectedStudent.name || searchTerm === selectedStudent.email)) return;

            if (searchTerm.length < 2) {
                setStudentResults([]);
                return;
            }

            setIsSearchingStudents(true);
            try {
                const res = await fetch(`/api/users?role=student&search=${searchTerm}`);
                if (res.ok) {
                    const data = await res.json();
                    setStudentResults(data);
                }
            } catch (error) {
                console.error("Student search failed", error);
            } finally {
                setIsSearchingStudents(false);
            }
        };

        const timeout = setTimeout(fetchStudents, 300); // Debounce
        return () => clearTimeout(timeout);
    }, [searchTerm, selectedStudent]);

    useEffect(() => {
        if (result) {
            // Handle editing
            form.reset({
                studentId: (result.studentId && typeof result.studentId === 'object' && '_id' in result.studentId) ? (result.studentId as any)._id : (result.studentId as string) || "",
                moduleName: result.moduleName,
                moduleCode: result.moduleCode,
                semester: result.semester,
                type: result.type as any,
                marks: result.marks,
                grade: result.grade,
            })
            // For editing, we ideally need to fetch the student details to show name
            // Assuming result.studentId is populated or we need to fetch it.
            // Result interface usually has populated student. 
            if (typeof result.studentId === 'object' && result.studentId !== null) {
                const s: any = result.studentId;
                setSelectedStudent(s);
                setSearchTerm(s.name);
            }
        } else {
            // New Entry
            form.reset({
                studentId: "",
                moduleName: module ? module.name : "",
                moduleCode: module ? module.code : "",
                semester: module ? module.semester : "Sem 1",
                type: "Exam",
                marks: 0,
                grade: "",
            })
            setSelectedStudent(null);
            setSearchTerm("");
        }
    }, [result, form, open, module])

    // Auto-calculate grade
    const marks = form.watch("marks");
    useEffect(() => {
        if (!result && marks !== undefined) {
            let grade = "F";
            if (marks >= 85) grade = "A+";
            else if (marks >= 75) grade = "A";
            else if (marks >= 65) grade = "B";
            else if (marks >= 55) grade = "C";
            else if (marks >= 40) grade = "S";
            form.setValue("grade", grade);
        }
    }, [marks, result, form]);

    const onSubmit = async (values: z.infer<typeof resultSchema>) => {
        setIsLoading(true);
        try {
            const url = result ? `/api/results/${result._id}` : '/api/results';
            const method = result ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save result");
            }

            toast.success(result ? "Result updated" : "Result created");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] overflow-visible">
                <DialogHeader>
                    <DialogTitle>{result ? "Edit Result" : "Add Result"}</DialogTitle>
                    <DialogDescription>
                        {module ? `Add result for ${module.code}` : "Enter result details manually."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Student Search Field */}
                        <FormField
                            control={form.control}
                            name="studentId"
                            render={({ field }) => (
                                <FormItem className="relative">
                                    <FormLabel>Student</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Search student by name..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    if (selectedStudent) {
                                                        setSelectedStudent(null);
                                                        field.onChange("");
                                                    }
                                                }}
                                                disabled={!!result} // Disable changing student on edit for now to keep it simple
                                            />
                                            {isSearchingStudents && (
                                                <div className="absolute right-2 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                            )}
                                        </div>
                                    </FormControl>

                                    {/* Search Results Dropdown */}
                                    {searchTerm.length >= 2 && !selectedStudent && studentResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-40 overflow-auto">
                                            {studentResults.map((s) => (
                                                <div
                                                    key={s._id}
                                                    className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                                                    onClick={() => {
                                                        setSelectedStudent(s);
                                                        setSearchTerm(s.name);
                                                        field.onChange(s._id);
                                                        setStudentResults([]); // Hide list
                                                    }}
                                                >
                                                    <div className="font-medium">{s.name}</div>
                                                    <div className="text-xs text-muted-foreground">{s.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {searchTerm.length >= 2 && !selectedStudent && studentResults.length === 0 && !isSearchingStudents && (
                                        <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md p-2 text-sm text-center text-muted-foreground">
                                            No students found
                                        </div>
                                    )}

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {module ? (
                            // Read-only Module Info when passed as prop
                            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md border">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Module</p>
                                    <p className="text-sm font-semibold">{module.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Code</p>
                                    <p className="text-sm">{module.code}</p>
                                </div>
                            </div>
                        ) : (
                            <FormField
                                control={form.control}
                                name="moduleName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Module</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                const selected = modules.find(m => m.name === value);
                                                if (selected) {
                                                    form.setValue("moduleCode", selected.code);
                                                    form.setValue("semester", selected.semester);
                                                }
                                            }}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Module" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {modules.map(m => (
                                                    <SelectItem key={m._id} value={m.name}>{m.name} ({m.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {!module && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="moduleCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Module Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="CS101" {...field} readOnly />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="semester"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Semester</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map(s => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="col-span-3 sm:col-span-1">
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['Exam', 'Assignment', 'Project', 'Quiz'].map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="marks"
                                render={({ field }) => (
                                    <FormItem className="col-span-3 sm:col-span-1">
                                        <FormLabel>Marks</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="grade"
                                render={({ field }) => (
                                    <FormItem className="col-span-3 sm:col-span-1">
                                        <FormLabel>Grade</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Result"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
