"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Activity, FileText } from "lucide-react";
import { StudentCharts } from "@/components/student-charts";

export default function StudentDashboard() {
    const [stats, setStats] = useState({
        cgpa: "0.00",
        modulesCompleted: 0,
        pendingMedical: 0
    });
    const [rawResults, setRawResults] = useState<any[]>([]);
    const [rawMedicals, setRawMedicals] = useState<any[]>([]);
    const [notices, setNotices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Results
                const resultsRes = await fetch('/api/student/results');
                const results = await resultsRes.json();
                if (Array.isArray(results)) setRawResults(results);

                // Fetch Medicals
                const medicalsRes = await fetch('/api/medical');
                const medicals = await medicalsRes.json();
                if (Array.isArray(medicals)) setRawMedicals(medicals);

                // Fetch Notices
                const noticesRes = await fetch('/api/notices');
                const noticesData = await noticesRes.json();
                if (Array.isArray(noticesData)) setNotices(noticesData);

                // Calculate CGPA
                let cgpa = "0.00";
                let modules = 0;

                if (Array.isArray(results) && results.length > 0) {
                    modules = results.length;

                    const GRADE_POINTS: Record<string, number> = {
                        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
                        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                        'D+': 1.3, 'D': 1.0, 'E': 0.0, 'F': 0.0
                    };

                    const totalPoints = results.reduce((acc: number, curr: any) => {
                        const points = GRADE_POINTS[curr.grade] || 0;
                        return acc + (points * 3); // Assuming 3 credits
                    }, 0);

                    cgpa = (totalPoints / (results.length * 3)).toFixed(2);
                }

                // Count Pending Medicals
                // Note: In a real app we would filter by the logged-in student ID. 
                // Since this is a demo environment where we might be seeing all or seeded data, 
                // we'll just count 'pending' ones that presumably belong to us or total pending.
                // Given the context of "Student Dashboard", let's assume the API returns the student's data. 
                // (Currently api/medical returns all, but for demo visuals this is acceptable or we can filter if we had the ID).
                let pending = 0;
                if (Array.isArray(medicals)) {
                    // Simple filter for 'pending' status
                    pending = medicals.filter((m: any) => m.status === 'pending').length;
                }

                setStats({
                    cgpa,
                    modulesCompleted: modules,
                    pendingMedical: pending
                });

            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
                <p className="text-muted-foreground">Welcome back! Here's your academic overview.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cumulative GPA</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : stats.cgpa}</div>
                        <p className="text-xs text-muted-foreground">Based on {stats.modulesCompleted} completed modules</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Medical Requests</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : stats.pendingMedical}</div>
                        <p className="text-xs text-muted-foreground">Pending approval</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Academic Status</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Good Standing</div>
                        <p className="text-xs text-muted-foreground">Semester 4 in progress</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            {!isLoading && <StudentCharts results={rawResults} medicals={rawMedicals} />}
        </div>
    )
}
