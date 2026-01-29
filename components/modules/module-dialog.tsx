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

// Define Module Type locally for now
export interface Module {
    _id: string
    name: string
    code: string
    credits: number
    semester: string
    degreeProgram?: string // ID
    createdAt: string
}

const moduleSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    code: z.string().min(2, "Code must be at least 2 characters").toUpperCase(),
    credits: z.coerce.number().min(1, "Credits must be at least 1"),
    semester: z.string().min(1, "Semester is required"),
    degreeProgram: z.string().min(1, "Degree Program is required"),
})

interface ModuleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    module: Module | null
    onSuccess: () => void
}

export function ModuleDialog({ open, onOpenChange, module, onSuccess }: ModuleDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [faculties, setFaculties] = useState<any[]>([])
    const [departments, setDepartments] = useState<any[]>([])
    const [degrees, setDegrees] = useState<any[]>([])

    // Selection states for filtering
    const [selectedFaculty, setSelectedFaculty] = useState<string>("")
    const [selectedDept, setSelectedDept] = useState<string>("")

    const form = useForm<z.infer<typeof moduleSchema>>({
        resolver: zodResolver(moduleSchema) as any,
        defaultValues: {
            name: "",
            code: "",
            credits: 3,
            semester: "Sem 1",
            degreeProgram: "",
        },
    })

    // Load Faculties
    useEffect(() => {
        if (open) {
            fetch('/api/hierarchy?type=faculty')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setFaculties(data);
                })
                .catch(err => console.error("Failed to load hierarchy", err));
        }
    }, [open]);

    // Handle Faculty Change -> Fetch Departments
    useEffect(() => {
        if (selectedFaculty) {
            fetch(`/api/hierarchy?type=department&parentId=${selectedFaculty}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setDepartments(data);
                    else setDepartments([]);
                })
                .catch(err => console.error("Failed to load departments", err));
        } else {
            setDepartments([]);
        }
    }, [selectedFaculty]);

    // Handle Dept Change -> Fetch Degrees
    useEffect(() => {
        if (selectedDept) {
            fetch(`/api/hierarchy?type=degree&parentId=${selectedDept}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setDegrees(data);
                    else setDegrees([]);
                })
                .catch(err => console.error("Failed to load degrees", err));
        } else {
            setDegrees([]);
        }
    }, [selectedDept]);

    useEffect(() => {
        if (module) {
            // Extract hierarchy from populated module object if available
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
            form.reset({
                name: "",
                code: "",
                credits: 3,
                semester: "Sem 1",
                degreeProgram: "",
            })
            setSelectedFaculty("")
            setSelectedDept("")
        }
    }, [module, form, open])

    const onSubmit = async (values: z.infer<typeof moduleSchema>) => {
        setIsLoading(true);
        try {
            // Updated API endpoint
            const url = module ? `/api/admin/modules?id=${module._id}` : '/api/admin/modules';
            const method = module ? 'PUT' : 'POST';

            const body = module ? { id: module._id, ...values } : {
                ...values,
                degreeId: values.degreeProgram // API expects degreeId
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Something went wrong');
            }

            toast.success(module ? "Module updated" : "Module created");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{module ? "Edit Module" : "Add Module"}</DialogTitle>
                    <DialogDescription>
                        {module ? "Update module details." : "Create a new learning module."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Hierarchy Selectors - Always shown now */}
                        <div className="grid grid-cols-2 gap-4 border-b pb-4">
                            <div className="col-span-2">
                                <p className="text-sm text-muted-foreground mb-2">Select Degree Program</p>
                            </div>
                            <FormItem>
                                <FormLabel>Faculty</FormLabel>
                                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Faculty" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {faculties.map((f) => (
                                            <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select value={selectedDept} onValueChange={setSelectedDept} disabled={!selectedFaculty}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Dept" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        </div>

                        <FormField
                            control={form.control}
                            name="degreeProgram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Degree Program</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!selectedDept && !module}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Degree" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {degrees.length > 0 ? degrees.map((dp) => (
                                                <SelectItem key={dp._id} value={dp._id}>{dp.name}</SelectItem>
                                            )) : module && (
                                                <SelectItem value={field.value}>Current Degree</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Module Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Introduction to Programming" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Module Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="CS101" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="credits"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Credits</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="3" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="semester"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select semester" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map((sem) => (
                                                <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
