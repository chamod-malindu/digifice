"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folder, ChevronRight, ArrowLeft, BookOpen, GraduationCap, Building2 } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function ResultsBrowserPage() {
    const [level, setLevel] = useState<0 | 1 | 2 | 3>(0) // 0: Faculty, 1: Dept, 2: Degree, 3: Modules

    // Data
    const [hierarchies, setHierarchies] = useState<{ faculties: any[], departments: any[], degrees: any[] }>({ faculties: [], departments: [], degrees: [] })
    const [modules, setModules] = useState<any[]>([])

    // Selections
    const [selectedFaculty, setSelectedFaculty] = useState<any>(null)
    const [selectedDept, setSelectedDept] = useState<any>(null)
    const [selectedDegree, setSelectedDegree] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            const hRes = await fetch('/api/hierarchy');
            const hData = await hRes.json();
            setHierarchies(hData);

            const mRes = await fetch('/api/modules');
            const mData = await mRes.json();
            if (Array.isArray(mData)) setModules(mData);
        }
        fetchData();
    }, []);

    // Derived Lists
    const currentDepartments = hierarchies.departments.filter(d => d.faculty === selectedFaculty?._id);
    const currentDegrees = hierarchies.degrees.filter(d => d.department === selectedDept?._id);
    const currentModules = modules.filter(m => {
        // Module schema has degreeProgram ref.
        // My restored schema: degreeProgram: { type: ObjectId, ref: 'DegreeProgram' }
        // The API returns populated or flat? Restored API `modules/route.ts` usually populates.
        // Let's assume `m.degreeProgram._id` OR `m.degreeProgram` matches `selectedDegree._id`.
        const dId = typeof m.degreeProgram === 'object' ? m.degreeProgram._id : m.degreeProgram;
        return dId === selectedDegree?._id;
    });

    const goBack = () => {
        if (level === 0) return;
        if (level === 1) { setSelectedFaculty(null); setLevel(0); }
        if (level === 2) { setSelectedDept(null); setLevel(1); }
        if (level === 3) { setSelectedDegree(null); setLevel(2); }
    }

    const Breadcrumb = () => (
        <div className="flex items-center text-sm text-muted-foreground mb-4">
            <span className={level === 0 ? "font-bold text-primary" : "cursor-pointer hover:underline"} onClick={() => { setSelectedFaculty(null); setSelectedDept(null); setSelectedDegree(null); setLevel(0) }}>Faculties</span>
            {level > 0 && <><ChevronRight className="h-4 w-4 mx-1" /> <span className={level === 1 ? "font-bold text-primary" : "cursor-pointer hover:underline"} onClick={() => { setSelectedDept(null); setSelectedDegree(null); setLevel(1) }}>{selectedFaculty?.name}</span></>}
            {level > 1 && <><ChevronRight className="h-4 w-4 mx-1" /> <span className={level === 2 ? "font-bold text-primary" : "cursor-pointer hover:underline"} onClick={() => { setSelectedDegree(null); setLevel(2) }}>{selectedDept?.name}</span></>}
            {level > 2 && <><ChevronRight className="h-4 w-4 mx-1" /> <span className="font-bold text-primary">{selectedDegree?.name}</span></>}
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Results Management</h2>
                    <p className="text-muted-foreground">Browse modules by hierarchy to manage results.</p>
                </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
                {level > 0 && <Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>}
                <Breadcrumb />
            </div>

            {/* VIEWS */}

            {/* LEVEL 0: FACULTIES */}
            {level === 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {hierarchies.faculties.map(f => (
                        <Card key={f._id} className="cursor-pointer hover:border-primary transition-all hover:shadow-md" onClick={() => { setSelectedFaculty(f); setLevel(1); }}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xl">{f.name}</CardTitle>
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{hierarchies.departments.filter(d => d.faculty === f._id).length} Departments</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* LEVEL 1: DEPARTMENTS */}
            {level === 1 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {currentDepartments.map(d => (
                        <Card key={d._id} className="cursor-pointer hover:border-primary transition-all hover:shadow-md" onClick={() => { setSelectedDept(d); setLevel(2); }}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">{d.name}</CardTitle>
                                <Folder className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{hierarchies.degrees.filter(deg => deg.department === d._id).length} Degree Programs</p>
                            </CardContent>
                        </Card>
                    ))}
                    {currentDepartments.length === 0 && <div className="text-muted-foreground">No departments found.</div>}
                </div>
            )}

            {/* LEVEL 2: DEGREES */}
            {level === 2 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {currentDegrees.map(d => (
                        <Card key={d._id} className="cursor-pointer hover:border-primary transition-all hover:shadow-md" onClick={() => { setSelectedDegree(d); setLevel(3); }}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">{d.name}</CardTitle>
                                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {/* We could count modules if we linked them, but we fetch all modules flat, so we can filter */}
                                <p className="text-sm text-muted-foreground">
                                    {modules.filter(m => (typeof m.degreeProgram === 'object' ? m.degreeProgram._id : m.degreeProgram) === d._id).length} Modules
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                    {currentDegrees.length === 0 && <div className="text-muted-foreground">No degree programs found.</div>}
                </div>
            )}

            {/* LEVEL 3: MODULES */}
            {level === 3 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {currentModules.map(m => (
                        <Link key={m._id} href={`/admin/results/modules/${m._id}`} className="block">
                            <Card className="h-full hover:border-primary transition-all hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">{m.code}</CardTitle>
                                        <CardDescription className="line-clamp-1">{m.name}</CardDescription>
                                    </div>
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                        <span>{m.semester}</span>
                                        <span>{m.credits} Credits</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {currentModules.length === 0 && <div className="text-muted-foreground col-span-3">No modules found for this degree.</div>}
                </div>
            )}
        </div>
    )
}
