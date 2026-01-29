"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

interface Result {
    grade: string;
    semester: string;
    // other fields ignored
}

interface Medical {
    status: string;
    // other fields ignored
}

interface StudentChartsProps {
    results: Result[];
    medicals: Medical[];
}

const GRADE_POINTS: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'E': 0.0, 'F': 0.0
};

export function StudentCharts({ results, medicals }: StudentChartsProps) {

    // Process GPA Data
    // Group by semester -> calculate average GPA
    const semesterGroups: Record<string, Result[]> = {};
    results.forEach(r => {
        if (!semesterGroups[r.semester]) semesterGroups[r.semester] = [];
        semesterGroups[r.semester].push(r);
    });

    const gpaData = Object.keys(semesterGroups).map(sem => {
        const semesterResults = semesterGroups[sem];
        const totalPoints = semesterResults.reduce((acc, curr) => {
            const points = GRADE_POINTS[curr.grade] || 0;
            return acc + (points * 3); // Assuming 3 credits
        }, 0);
        const gpa = semesterResults.length ? (totalPoints / (semesterResults.length * 3)) : 0;
        return {
            name: sem,
            gpa: parseFloat(gpa.toFixed(2))
        };
    }).sort((a, b) => a.name.localeCompare(b.name));


    // Process Medical Data
    const statusCounts: Record<string, number> = {
        'pending': 0,
        'approved_by_officer': 0,
        'rejected': 0,
        'forwarded_to_dept': 0
    };

    medicals.forEach(m => {
        if (statusCounts[m.status] !== undefined) {
            statusCounts[m.status]++;
        }
    });

    const medicalChartData = [
        { name: 'Pending', value: statusCounts['pending'], color: '#f59e0b' }, // Amber
        { name: 'Approved', value: statusCounts['approved_by_officer'] + statusCounts['forwarded_to_dept'], color: '#10b981' }, // Emerald
        { name: 'Rejected', value: statusCounts['rejected'], color: '#ef4444' }, // Red
    ].filter(item => item.value > 0);


    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>GPA Trend</CardTitle>
                    <CardDescription>
                        Your academic performance over semesters
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gpaData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 4]}
                                    ticks={[0, 1, 2, 3, 4]}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                />
                                <Bar dataKey="gpa" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>Medical Requests</CardTitle>
                    <CardDescription>
                        Status overview
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        {medicalChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={medicalChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {medicalChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'var(--background)', borderColor: 'var(--border)' }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                No medical data available
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
                        {medicalChartData.map((item) => (
                            <div key={item.name} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span>{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
