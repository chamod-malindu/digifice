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

const resultSchema = z.object({
    studentId: z.string().min(1, "Student is required"),
    moduleName: z.string().min(2),
    moduleCode: z.string().min(2),
    semester: z.string(),
    type: z.enum(["Exam", "Assignment", "Project", "Quiz"]),
    marks: z.coerce.number().min(0).max(100),
    grade: z.string().min(1),
})

export function ResultForm({ open, onOpenChange, result, onSuccess, module }: any) {
    const [isLoading, setIsLoading] = useState(false)
    const [modules, setModules] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [studentResults, setStudentResults] = useState<any[]>([])
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [isSearchingStudents, setIsSearchingStudents] = useState(false)

    const form = useForm<z.infer<typeof resultSchema>>({
        resolver: zodResolver(resultSchema),
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

    useEffect(() => {
        if (open && !module) {
            fetch('/api/modules').then(res => res.json()).then(data => setModules(data))
        }
    }, [open, module])

    useEffect(() => {
        const fetchStudents = async () => {
            if (selectedStudent && (searchTerm === selectedStudent.name || searchTerm === selectedStudent.email)) return;
            if (searchTerm.length < 2) { setStudentResults([]); return; }
            setIsSearchingStudents(true);
            try {
                const res = await fetch(`/api/users?role=student&search=${searchTerm}`);
                if (res.ok) setStudentResults(await res.json());
            } finally { setIsSearchingStudents(false); }
        };
        const timeout = setTimeout(fetchStudents, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm, selectedStudent]);

    useEffect(() => {
        if (result) {
            form.reset({
                studentId: result.studentId._id || result.studentId,
                moduleName: result.moduleName,
                moduleCode: result.moduleCode,
                semester: result.semester,
                type: result.type,
                marks: result.marks,
                grade: result.grade,
            })
            if (typeof result.studentId === 'object') {
                setSelectedStudent(result.studentId);
                setSearchTerm(result.studentId.name);
            }
        } else {
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

    const onSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            const url = result ? `/api/results/${result._id}` : '/api/results';
            const method = result ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
            if (!res.ok) throw new Error("Failed");
            toast.success("Saved");
            onSuccess();
            onOpenChange(false);
        } catch (e) { toast.error("Error"); } finally { setIsLoading(false); }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-visible">
                <DialogHeader><DialogTitle>{result ? "Edit" : "Add"} Result</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="studentId" render={({ field }) => (
                            <FormItem className="relative">
                                <FormLabel>Student</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input placeholder="Search..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); if (selectedStudent) { setSelectedStudent(null); field.onChange(""); } }} disabled={!!result} />
                                        {isSearchingStudents && <div className="absolute right-2 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                                    </div>
                                </FormControl>
                                {searchTerm.length >= 2 && !selectedStudent && studentResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-40 overflow-auto">
                                        {studentResults.map(s => (
                                            <div key={s._id} className="px-3 py-2 hover:bg-muted cursor-pointer text-sm" onClick={() => { setSelectedStudent(s); setSearchTerm(s.name); field.onChange(s._id); setStudentResults([]); }}>
                                                <div className="font-medium">{s.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormItem>
                        )} />
                        {module ? (
                            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md border">
                                <div><p className="text-xs text-muted-foreground">Module</p><p className="text-sm font-semibold">{module.name}</p></div>
                                <div><p className="text-xs text-muted-foreground">Code</p><p className="text-sm">{module.code}</p></div>
                            </div>
                        ) : (
                            <FormField control={form.control} name="moduleName" render={({ field }) => (
                                <FormItem><FormLabel>Module</FormLabel><Select onValueChange={(val) => { field.onChange(val); const sel = modules.find(m => m.name === val); if (sel) { form.setValue("moduleCode", sel.code); form.setValue("semester", sel.semester); } }} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent>{modules.map(m => <SelectItem key={m._id} value={m.name}>{m.name}</SelectItem>)}</SelectContent></Select></FormItem>
                            )} />
                        )}
                        {/* Type, Marks, Grade Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="type" render={({ field }) => <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{['Exam', 'Assignment'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></FormItem>} />
                            <FormField control={form.control} name="marks" render={({ field }) => <FormItem><FormLabel>Marks</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>} />
                            <FormField control={form.control} name="grade" render={({ field }) => <FormItem><FormLabel>Grade</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>} />
                        </div>
                        <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
