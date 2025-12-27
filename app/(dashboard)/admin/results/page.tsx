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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Layers } from "lucide-react"

interface HierarchyNode {
    _id: string;
    name: string;
    departments?: HierarchyNode[];
    degrees?: HierarchyNode[];
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

    // Load initial hierarchy
    useEffect(() => {
        fetch('/api/hierarchy')
            .then(res => res.json())
            .then(data => setFaculties(data || []))
            .catch(err => console.error("Failed to load hierarchy", err));
    }, []);

    // Handle Faculty Change
    useEffect(() => {
        if (selectedFaculty && faculties.length > 0) {
            const fac = faculties.find(f => f._id === selectedFaculty);
            setDepartments(fac?.departments || []);
            setSelectedDept("");
            setSelectedDegree("");
            setModules([]);
        }
    }, [selectedFaculty, faculties]);

    // Handle Dept Change
    useEffect(() => {
        if (selectedDept && departments.length > 0) {
            const dept = departments.find(d => d._id === selectedDept);
            setDegrees(dept?.degrees || []);
            setSelectedDegree("");
            setModules([]);
        }
    }, [selectedDept, departments]);

    // Handle Degree Change -> Fetch Modules
    useEffect(() => {
        if (selectedDegree) {
            setIsLoadingModules(true);
            fetch(`/api/modules?degreeProgram=${selectedDegree}`)
                .then(res => res.json())
                .then(data => setModules(data))
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

            {/* Modules Grid */}
            {selectedDegree && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Modules
                        </h3>
                        <Button onClick={() => window.location.href = '/admin/results/modules'}>
                            Manage All Modules
                        </Button>
                    </div>

                    {isLoadingModules ? (
                        <div>Loading modules...</div>
                    ) : modules.length === 0 ? (
                        <div className="text-muted-foreground italic">No modules found for this degree program.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {modules.map(module => (
                                <Card key={module._id} className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/results/modules/${module._id}`)}>
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
