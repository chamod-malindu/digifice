"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const STATUS_COLORS: Record<string, string> = {
    'planned': '#3b82f6', // blue-500
    'completed': '#22c55e', // green-500
    'postponed': '#eab308', // yellow-500
};

export function TaskOverviewChart() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('/api/lecturer/tasks');
                const tasks = await res.json();

                if (Array.isArray(tasks)) {
                    // Process data for chart
                    const statusCounts: Record<string, number> = {};
                    tasks.forEach((task: any) => {
                        const status = task.status || 'planned';
                        statusCounts[status] = (statusCounts[status] || 0) + 1;
                    });

                    const chartData = Object.keys(statusCounts).map(status => ({
                        name: status.charAt(0).toUpperCase() + status.slice(1),
                        value: statusCounts[status],
                        color: STATUS_COLORS[status] || '#8884d8'
                    }));

                    setData(chartData);
                }
            } catch (error) {
                console.error("Failed to fetch task data", error);
            }
        };

        fetchTasks();
    }, []);

    if (data.length === 0) {
        return (
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Task Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No task data available
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Task Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
