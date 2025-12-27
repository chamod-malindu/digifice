"use client"

import { useEffect, useState, use } from "react"
import { Result, createResultColumns } from "@/components/results/columns"
import { DataTable } from "@/components/users/data-table"
import { BulkUpload } from "@/components/results/bulk-upload"
import { ResultForm } from "@/components/results/result-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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

export default function ModuleResultsPage({ params }: { params: Promise<{ moduleId: string }> }) {
    const { moduleId } = use(params);
    const router = useRouter();
    const [data, setData] = useState<Result[]>([])
    const [module, setModule] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentResult, setCurrentResult] = useState<Result | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Fetch Module Info
    useEffect(() => {
        fetch(`/api/modules/${moduleId}`)
            .then(res => res.json())
            .then(data => setModule(data))
            .catch(err => console.error(err));
    }, [moduleId]);

    const fetchResults = async () => {
        try {
            setIsLoading(true)
            // TODO: Filter results by module ID
            // For now fetching all and client filtering, or update API to support filter
            const res = await fetch(`/api/results`) // Ideally: /api/results?module=${moduleId}
            const resultData = await res.json()
            // Client side filter as fallback
            const filtered = resultData.filter((r: any) => r.moduleCode === module?.code)
            setData(filtered)
        } catch (error) {
            console.error("Failed to fetch results", error)
            toast.error("Failed to fetch results")
        } finally {
            setIsLoading(false)
        }
    }

    // Refetch results when module info loads (needed for code check)
    useEffect(() => {
        if (module) fetchResults();
    }, [module]);

    const handleAddKey = () => {
        // Pre-fill result form with this module info?
        // ResultForm doesn't support pre-fill props easily for new items yet without heavy mod.
        // Let's just open dialog for now.
        setCurrentResult(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (result: Result) => {
        setCurrentResult(result)
        setIsDialogOpen(true)
    }

    const confirmDelete = (result: Result) => {
        setDeleteId(result._id)
    }

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/results/${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Result deleted successfully");
                fetchResults();
            } else {
                toast.error("Failed to delete result");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Error deleting result");
        } finally {
            setDeleteId(null)
        }
    }

    const columns = createResultColumns({ onEdit: handleEdit, onDelete: confirmDelete })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {module ? `${module.name} (${module.code})` : "Loading Module..."}
                    </h2>
                    <p className="text-muted-foreground">Manage results for this module.</p>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <BulkUpload onSuccess={fetchResults} />
                <Button onClick={handleAddKey}>
                    <Plus className="mr-2 h-4 w-4" /> Add Result
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">Loading results...</div>
            ) : (
                <DataTable columns={columns} data={data} searchKey="studentName" />
            )}

            <ResultForm
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                result={currentResult}
                onSuccess={fetchResults}
                module={module} // Auto-fill
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this result.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
