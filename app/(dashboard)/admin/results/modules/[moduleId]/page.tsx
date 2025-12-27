"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/results/data-table"
import { createResultColumns, Result } from "@/components/results/columns"
import { ResultForm } from "@/components/results/result-form"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ModuleResultsPage() {
    const params = useParams()
    const moduleId = params.moduleId as string

    const [module, setModule] = useState<any>(null)
    const [results, setResults] = useState<Result[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedResult, setSelectedResult] = useState<Result | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [resultToDelete, setResultToDelete] = useState<Result | null>(null)

    useEffect(() => {
        if (moduleId) {
            fetch('/api/modules').then(r => r.json()).then((data: any[]) => {
                if (Array.isArray(data)) {
                    const mod = data.find(m => m._id === moduleId);
                    if (mod) setModule(mod);
                }
            });
        }
    }, [moduleId]);

    useEffect(() => {
        if (module) {
            fetch('/api/results').then(r => r.json()).then((data: any[]) => {
                if (Array.isArray(data)) {
                    const filtered = data.filter(r => r.moduleCode === module.code);
                    setResults(filtered);
                }
            });
        }
    }, [module]);

    const handleEdit = (result: Result) => {
        setSelectedResult(result)
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (result: Result) => {
        setResultToDelete(result)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!resultToDelete) return
        try {
            const res = await fetch(`/api/results/${resultToDelete._id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("Result deleted")
                if (module) {
                    fetch('/api/results').then(r => r.json()).then((data: any[]) => {
                        const filtered = data.filter(r => r.moduleCode === module.code);
                        setResults(filtered);
                    });
                }
            } else {
                toast.error("Failed to delete")
            }
        } catch (error) { toast.error("Error"); } finally { setIsDeleteDialogOpen(false); }
    }

    const columns = createResultColumns({ onEdit: handleEdit, onDelete: handleDeleteClick })

    if (!module) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{module.name} ({module.code})</h2>
                    <p className="text-muted-foreground">{module.semester} • {module.credits} Credits</p>
                </div>
                <Button onClick={() => { setSelectedResult(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Result
                </Button>
            </div>

            <DataTable columns={columns} data={results} filterColumn="studentName" filterPlaceholder="Filter students..." />

            <ResultForm
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                result={selectedResult}
                module={module} // Pass module for auto-fill
                onSuccess={() => {
                    // Refetch
                    if (module) {
                        fetch('/api/results').then(r => r.json()).then((data: any[]) => {
                            const filtered = data.filter(r => r.moduleCode === module.code);
                            setResults(filtered);
                        });
                    }
                }}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete Result?</AlertDialogTitle><AlertDialogDescription>Permenant action.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
