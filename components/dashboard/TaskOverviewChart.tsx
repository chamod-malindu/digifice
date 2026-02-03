"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Label } from "recharts"

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
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={5}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} className="stroke-background hover:opacity-80 transition-opacity" strokeWidth={2} />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold font-mono"
                                                    >
                                                        {data.reduce((acc, curr) => acc + curr.value, 0)}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-xs uppercase tracking-widest font-medium"
                                                    >
                                                        Total
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3 shadow-xl ring-1 ring-black/5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                                                            {payload[0].name}
                                                        </span>
                                                        <span className="font-bold text-lg text-foreground font-mono">
                                                            {payload[0].value}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-sm font-medium text-muted-foreground ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
