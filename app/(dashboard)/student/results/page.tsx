"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Award, BookOpen } from "lucide-react";

interface Result {
    _id: string;
    moduleName: string;
    moduleCode: string;
    semester: string;
    type: string;
    marks: number;
    grade: string;
    feedback?: string;
}

// Grade Point Map
const GRADE_POINTS: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'E': 0.0, 'F': 0.0
};

export default function StudentResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/student/results')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setResults(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    // Group by Semester
    const semesters = Array.from(new Set(results.map(r => r.semester))).sort();

    // Calculate GPA
    const calculateGPA = (semesterResults: Result[]) => {
        if (!semesterResults.length) return "0.00";
        // Assuming 3 credits for all modules for now as per plan
        const totalCredits = semesterResults.length * 3;
        const totalPoints = semesterResults.reduce((acc, curr) => {
            const points = GRADE_POINTS[curr.grade] || 0;
            return acc + (points * 3);
        }, 0);
        return (totalPoints / totalCredits).toFixed(2);
    };

    const calculateCGPA = () => {
        if (!results.length) return "0.00";
        const totalCredits = results.length * 3;
        const totalPoints = results.reduce((acc, curr) => {
            const points = GRADE_POINTS[curr.grade] || 0;
            return acc + (points * 3);
        }, 0);
        return (totalPoints / totalCredits).toFixed(2);
    }

    if (isLoading) return <div>Loading results...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Academic Results</h2>
                <p className="text-muted-foreground">Your semester-wise performance and GPA.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
                        <GraduationCap className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{calculateCGPA()}</div>
                        <p className="text-xs text-muted-foreground">Across all semesters</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Semesters</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{semesters.length}</div>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6">
                {semesters.map(sem => {
                    const semResults = results.filter(r => r.semester === sem);
                    const semGPA = calculateGPA(semResults);

                    return (
                        <Card key={sem}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-xl">{sem}</CardTitle>
                                    <CardDescription>{semResults.length} Modules completed</CardDescription>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Semester GPA</span>
                                    <div className="text-2xl font-bold">{semGPA}</div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Result</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {semResults.map(result => (
                                            <TableRow key={result._id}>
                                                <TableCell className="font-medium">{result.moduleName}</TableCell>
                                                <TableCell>{result.moduleCode}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">{result.type}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-lg">{result.grade}</span>
                                                        <span className="text-xs text-muted-foreground">{result.marks} Marks</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )
                })}

                {semesters.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No results found.
                    </div>
                )}
            </div>
        </div>
    );
}
