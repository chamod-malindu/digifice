"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Pencil, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { ModuleDialog } from "@/components/modules/module-dialog"
import { useRouter } from "next/navigation"

interface Module {
    _id: string
    name: string
    code: string
    credits: number
    semester: string
    degreeProgram?: {
        name: string
        department?: {
            name: string
            faculty?: {
                name: string
            }
        }
    }
}

export default function ModulesPage() {
    const [modules, setModules] = useState<Module[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedModule, setSelectedModule] = useState<any | null>(null)
    const router = useRouter()

    const fetchModules = async () => {
        try {
            const res = await fetch("/api/admin/modules");
            if (!res.ok) throw new Error("Failed to fetch modules");
            const data = await res.json();
            setModules(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load modules");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchModules();
    }, []);

    const handleDelete = async (module: Module) => {
        try {
            const res = await fetch(`/api/admin/modules?id=${module._id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success("Module deleted successfully");
                fetchModules();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to delete module");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An error occurred while deleting");
        }
    }

    const filteredModules = modules.filter(module =>
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/results')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">Modules</h2>
                    </div>
                    <p className="text-muted-foreground">
                        Manage academic modules across all faculties.
                    </p>
                </div>
                <Button onClick={() => { setSelectedModule(null); setDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Module
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Faculty</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Degree</TableHead>
                            <TableHead>Sem</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    Loading modules...
                                </TableCell>
                            </TableRow>
                        ) : filteredModules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No modules found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredModules.map((module) => (
                                <TableRow key={module._id}>
                                    <TableCell className="font-medium bg-muted/30">{module.code}</TableCell>
                                    <TableCell className="font-medium">{module.name}</TableCell>
                                    <TableCell>{module.degreeProgram?.department?.faculty?.name || "-"}</TableCell>
                                    <TableCell>{module.degreeProgram?.department?.name || "-"}</TableCell>
                                    <TableCell>{module.degreeProgram?.name || "-"}</TableCell>
                                    <TableCell>{module.semester}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => { setSelectedModule(module); setDialogOpen(true); }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Module?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the module <b>{module.name}</b>.
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(module)}
                                                            className="bg-red-500 hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ModuleDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                module={selectedModule}
                onSuccess={fetchModules}
            />
        </div>
    )
}
