"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, ChevronRight } from "lucide-react"
import { ModuleDialog } from "@/components/modules/module-dialog"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ModulesPage() {
    const [modules, setModules] = useState<any[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedModule, setSelectedModule] = useState<any>(null)

    const fetchModules = async () => {
        const res = await fetch('/api/modules')
        const data = await res.json()
        if (Array.isArray(data)) setModules(data)
    }

    useEffect(() => {
        fetchModules()
    }, [])

    const filteredModules = modules.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.code.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Modules</h2>
                    <p className="text-muted-foreground">Manage modules and view results.</p>
                </div>
                <Button onClick={() => { setSelectedModule(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Module
                </Button>
            </div>

            <div className="flex items-center py-4">
                <Input placeholder="Search modules..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredModules.map((module) => (
                    <Card key={module._id} className="cursor-pointer hover:border-primary transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{module.code}</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold pt-2">{module.name}</div>
                            <p className="text-xs text-muted-foreground pb-4">{module.semester} • {module.credits} Credits</p>
                            <div className="flex gap-2">
                                <Link href={`/admin/results/modules/${module._id}`} className="w-full">
                                    <Button variant="secondary" className="w-full">View Results</Button>
                                </Link>
                                <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedModule(module); setIsDialogOpen(true); }}>
                                    <div className="h-4 w-4" >✎</div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ModuleDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={fetchModules} module={selectedModule} />
        </div>
    )
}
