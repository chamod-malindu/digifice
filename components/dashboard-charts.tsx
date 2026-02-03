"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Sector, Label } from "recharts"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface DashboardChartsProps {
    userData: { name: string; value: number; color: string }[];
    medicalData: { name: string; value: number; color: string }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 backdrop-blur-sm border border-border p-3 rounded-xl shadow-xl ring-1 ring-black/5">
                <p className="font-semibold text-sm mb-1">{label || payload[0].name}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].color }} />
                    <p className="text-sm font-medium">
                        {payload[0].value}
                        <span className="text-muted-foreground ml-1">
                            ({payload[0].payload.percent ? (payload[0].payload.percent * 100).toFixed(0) + '%' : ''})
                        </span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-2xl font-bold font-sans">
                {value}
            </text>
            <text x={cx} y={cy + 15} dy={8} textAnchor="middle" className="fill-muted-foreground text-xs font-medium uppercase tracking-wider">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                cornerRadius={6}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={innerRadius - 6}
                outerRadius={innerRadius - 2}
                fill={fill}
                fillOpacity={0.2}
                cornerRadius={4}
            />
        </g>
    );
};

export function DashboardCharts({ userData, medicalData }: DashboardChartsProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const totalUsers = userData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8">
            {/* User Distribution - Donut Chart */}
            <Card className="col-span-4 overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all hover:shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">User Distribution</CardTitle>
                    <CardDescription>
                        Breakdown of system roles
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={userData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                    stroke="none"
                                >
                                    {userData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            className="transition-all duration-300 hover:drop-shadow-lg"
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Medical Reviews - Gradient Bar Chart */}
            <Card className="col-span-3 overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all hover:shadow-md">
                <CardHeader>
                    <CardTitle>Medical Reviews</CardTitle>
                    <CardDescription>
                        Status overview
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={medicalData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                <defs>
                                    {medicalData.map((entry, index) => (
                                        <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.3} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.2, radius: 4 }}
                                    content={<CustomTooltip />}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[8, 8, 4, 4]}
                                    animationDuration={1500}
                                    barSize={40}
                                >
                                    {medicalData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`url(#colorGradient-${index})`}
                                            stroke={entry.color}
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
