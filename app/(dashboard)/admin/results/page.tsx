"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Layers, ChevronDown, ChevronRight } from "lucide-react"

interface HierarchyNode {
    _id: string;
    name: string;
}

interface Module {
    _id: string;
    name: string;
    code: string;
    credits: number;
    semester: string;
}

export default function ResultsPage() {
    const router = useRouter();
    const [faculties, setFaculties] = useState<HierarchyNode[]>([]);
    const [departments, setDepartments] = useState<HierarchyNode[]>([]);
    const [degrees, setDegrees] = useState<HierarchyNode[]>([]);

    // Selections
    const [selectedFaculty, setSelectedFaculty] = useState<string>("");
    const [selectedDept, setSelectedDept] = useState<string>("");
    const [selectedDegree, setSelectedDegree] = useState<string>("");

    // Modules for the selected degree
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoadingModules, setIsLoadingModules] = useState(false);

    // Recent Modules
    const [recentModules, setRecentModules] = useState<Module[]>([]);
    const [isRecentCollapsed, setIsRecentCollapsed] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("digifice_recent_modules");
        if (stored) {
            try {
                setRecentModules(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse recent modules", e);
            }
        }
    }, []);

    const addToRecent = (module: Module) => {
        const updated = [module, ...recentModules.filter(m => m._id !== module._id)].slice(0, 5);
        setRecentModules(updated);
        localStorage.setItem("digifice_recent_modules", JSON.stringify(updated));
        router.push(`/admin/results/modules/${module._id}`);
    };

    // Load initial hierarchy (Faculties)
    useEffect(() => {
        fetch('/api/hierarchy?type=faculty')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setFaculties(data);
            })
            .catch(err => console.error("Failed to load hierarchy", err));
    }, []);

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

            setSelectedDept("");
            setSelectedDegree("");
            setModules([]);
            setDegrees([]);
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

            setSelectedDegree("");
            setModules([]);
        } else {
            setDegrees([]);
        }
    }, [selectedDept]);

    // Handle Degree Change -> Fetch Modules
    useEffect(() => {
        if (selectedDegree) {
            setIsLoadingModules(true);
            // Use the new GET endpoint for modules
            fetch(`/api/admin/modules?degreeId=${selectedDegree}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setModules(data);
                    else setModules([]);
                })
                .catch(err => console.error(err))
                .finally(() => setIsLoadingModules(false));
        } else {
            setModules([]);
        }
    }, [selectedDegree]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Academic Results</h2>
                <p className="text-muted-foreground">Browse modules by faculty to manage results.</p>
            </div>


            {/* Hierarchy Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Faculty</label>
                    <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Faculty" />
                        </SelectTrigger>
                        <SelectContent>
                            {faculties.map(f => (
                                <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <Select value={selectedDept} onValueChange={setSelectedDept} disabled={!selectedFaculty}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map(d => (
                                <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Degree Program</label>
                    <Select value={selectedDegree} onValueChange={setSelectedDegree} disabled={!selectedDept}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Degree" />
                        </SelectTrigger>
                        <SelectContent>
                            {degrees.map(dp => (
                                <SelectItem key={dp._id} value={dp._id}>{dp.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Recently Accessed */}
            {recentModules.length > 0 && (
                <div className="space-y-4">
                    <button
                        onClick={() => setIsRecentCollapsed(!isRecentCollapsed)}
                        className="flex items-center gap-2 text-xl font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Layers className="h-5 w-5" />
                        Recently Accessed
                        {isRecentCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                    {!isRecentCollapsed && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            {recentModules.map(module => (
                                <Card key={module._id} className="hover:bg-accent/50 transition-colors cursor-pointer border-dashed" onClick={() => addToRecent(module)}>
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-sm truncate w-3/4" title={module.name}>{module.name}</span>
                                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{module.code}</span>
                                        </div>
                                        <CardDescription className="text-xs">{module.semester}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modules Grid */}
            {selectedDegree && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Modules
                        </h3>
                    </div>

                    {isLoadingModules ? (
                        <div>Loading modules...</div>
                    ) : modules.length === 0 ? (
                        <div className="text-muted-foreground italic">No modules found for this degree program.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {modules.map(module => (
                                <Card key={module._id} className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => addToRecent(module)}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-start">
                                            <span>{module.name}</span>
                                            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">{module.code}</span>
                                        </CardTitle>
                                        <CardDescription>{module.semester} • {module.credits} Credits</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="flex justify-end">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            View Results <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
