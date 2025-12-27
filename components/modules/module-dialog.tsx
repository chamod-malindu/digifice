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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const moduleSchema = z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    credits: z.coerce.number().min(1),
    semester: z.string(),
    degreeProgram: z.string().min(1, "Degree Program is required"),
})

export function ModuleDialog({ open, onOpenChange, module, onSuccess }: any) {
    const [isLoading, setIsLoading] = useState(false)
    const [faculties, setFaculties] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [degrees, setDegrees] = useState<any[]>([])

    // Hierarchy Selection State
    const [selectedFaculty, setSelectedFaculty] = useState("")
    const [selectedDept, setSelectedDept] = useState("")

    const form = useForm<z.infer<typeof moduleSchema>>({
        resolver: zodResolver(moduleSchema),
        defaultValues: {
            name: "",
            code: "",
            credits: 3,
            semester: "Sem 1",
            degreeProgram: "",
        },
    })

    // Fetch Hierarchy Data
    useEffect(() => {
        if (open) {
            fetch('/api/hierarchy')
                .then(res => res.json())
                .then(data => {
                    if (data.faculties) {
                        setFaculties(data.faculties);
                        // Store full lists to filter locally or assumes hierarchy fetch returns all. 
                        // To simplify, we'll refetch or filter if the API returns flattened lists?
                        // The API I wrote returns separate lists.
                        // Filtering logic:
                    }
                })
        }
    }, [open])

    // Fetch Departments when Faculty changes (Client-side filtering for now assuming small data or implementation needed)
    // Actually the hierarchy API I restored returns ALL depts/degrees. Optimised for small scale.
    // I need to filter `departments` by `selectedFaculty`.
    // But wait, my restored API returned ALL.
    // So I need to implement client-side filtering logic here.

    // To properly support client filtering, I'll fetch ALL and filter in render or effects.
    const [allDepts, setAllDepts] = useState<any[]>([])
    const [allDegrees, setAllDegrees] = useState<any[]>([])

    useEffect(() => {
        if (open) {
            fetch('/api/hierarchy').then(r => r.json()).then(data => {
                setFaculties(data.faculties || []);
                setAllDepts(data.departments || []);
                setAllDegrees(data.degrees || []);
            });
        }
    }, [open]);

    // Update derived lists
    useEffect(() => {
        if (selectedFaculty) {
            setDepartments(allDepts.filter(d => d.faculty === selectedFaculty));
        } else {
            setDepartments([]);
        }
    }, [selectedFaculty, allDepts]);

    useEffect(() => {
        if (selectedDept) {
            setDegrees(allDegrees.filter(d => d.department === selectedDept));
        } else {
            setDegrees([]);
        }
    }, [selectedDept, allDegrees]);

    // Pre-fill on Edit
    useEffect(() => {
        if (module) {
            const degreeInfo: any = module.degreeProgram;
            const isPopulated = typeof degreeInfo === 'object' && degreeInfo !== null;

            if (isPopulated) {
                const deptInfo = degreeInfo.department;
                const facInfo = deptInfo?.faculty;

                if (facInfo?._id) setSelectedFaculty(facInfo._id);
                if (deptInfo?._id) setSelectedDept(deptInfo._id);
            }

            form.reset({
                name: module.name,
                code: module.code,
                credits: module.credits,
                semester: module.semester,
                degreeProgram: isPopulated ? degreeInfo._id : (module.degreeProgram as string),
            })
        } else {
            form.reset({ name: "", code: "", credits: 3, semester: "Sem 1", degreeProgram: "" })
            setSelectedFaculty("")
            setSelectedDept("")
        }
    }, [module, form, open])

    const onSubmit = async (values: z.infer<typeof moduleSchema>) => {
        setIsLoading(true)
        try {
            const url = module ? `/api/modules?id=${module._id}` : '/api/modules' // Actually my API route handles ID via query or I need [id] route. I restored `api/modules/route.ts` which handles GET/POST. I probably need PUT there or `api/modules/[id]`. 
            // I haven't restored `api/modules/[id]` yet. I should handle PUT in `route.ts` or create `[id]`.
            // Standard Next.js is `[id]`. I'll assume I need to create `api/modules/[id]/route.ts`.
            // For now I'll POST/PUT to same if I handle it, but better to use `[id]`.
            // I'll stick to creating `api/modules/[id]` later.

            // For this restore, I'll assume strictly standard REST.
            const method = module ? 'PUT' : 'POST'
            const endpoint = module ? `/api/modules/${module._id}` : '/api/modules'

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })
            if (!res.ok) throw new Error("Failed");
            toast.success("Saved");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error("Error saving module");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{module ? "Edit Module" : "Add Module"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 border-b pb-4">
                            <FormItem>
                                <FormLabel>Faculty</FormLabel>
                                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Faculty" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {faculties.map(f => <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select value={selectedDept} onValueChange={setSelectedDept} disabled={!selectedFaculty}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {departments.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        </div>
                        <FormField control={form.control} name="degreeProgram" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Degree</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDept && !module}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Degree" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {degrees.length > 0 ? degrees.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>) : <SelectItem value={field.value || "temp"}>Current Degree</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                        {/* Name, Code, Credits, Semester Fields... */}
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                        )} />
                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="code" render={({ field }) => (
                                <FormItem><FormLabel>Code</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="credits" render={({ field }) => (
                                <FormItem><FormLabel>Credits</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="semester" render={({ field }) => (
                                <FormItem><FormLabel>Semester</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{['Sem 1', 'Sem 2'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></FormItem>
                            )} />
                        </div>
                        <DialogFooter><Button type="submit">Save</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
