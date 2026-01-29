"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, BookOpen } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        users: { total: 0, students: 0, lecturers: 0, admins: 0 },
        modules: { total: 0 },
        medical: { pending: 0, approved: 0, forwarded: 0, rejected: 0 }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setIsLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const userData = [
        { name: "Students", value: stats.users.students || 0, color: "#2563eb" },
        { name: "Lecturers", value: stats.users.lecturers || 0, color: "#16a34a" },
        { name: "Admins", value: stats.users.admins || 0, color: "#7c3aed" },
    ];

    const medicalData = [
        { name: "Pending", value: stats.medical?.pending || 0, color: "#f59e0b" },
        { name: "Approved", value: stats.medical?.approved || 0, color: "#2563eb" },
        { name: "Forwarded", value: stats.medical?.forwarded || 0, color: "#16a34a" },
        { name: "Rejected", value: stats.medical?.rejected || 0, color: "#ef4444" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Overview of the system status and activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : stats.users.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.users.students} Students, {stats.users.lecturers} Lecturers
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? "..." : stats.modules.total}</div>
                        <p className="text-xs text-muted-foreground">Total modules in system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Online</div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            <DashboardCharts userData={userData} medicalData={medicalData} />
        </div>
    );
}
