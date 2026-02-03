import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, Bar, BarChart, Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Result {
    grade: string;
    semester: string;
    moduleName: string;
    moduleCode: string;
    marks: number;
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
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

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
            gpa: parseFloat(gpa.toFixed(2)),
            modules: semesterResults
        };
    }).sort((a, b) => a.name.localeCompare(b.name));

    // Determine active semester (default to latest if none selected)
    const activeSemester = selectedSemester || (gpaData.length > 0 ? gpaData[gpaData.length - 1].name : null);
    const selectedSemesterData = activeSemester ? semesterGroups[activeSemester] : null;


    // Process Medical Data
    const statusCounts: Record<string, number> = {
        'pending': 0,
        'approved_by_officer': 0,
        'approved_by_dept': 0,
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
        { name: 'Approved', value: statusCounts['approved_by_officer'] + statusCounts['forwarded_to_dept'] + statusCounts['approved_by_dept'], color: '#10b981' }, // Emerald
        { name: 'Rejected', value: statusCounts['rejected'], color: '#ef4444' }, // Red
    ];


    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
            <Card className="col-span-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>GPA Trend</CardTitle>
                            <CardDescription>
                                Your academic performance
                            </CardDescription>
                        </div>
                        <div className="w-[150px]">
                            <Select
                                value={activeSemester || ""}
                                onValueChange={setSelectedSemester}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gpaData.map(sem => (
                                        <SelectItem key={sem.name} value={sem.name}>
                                            {sem.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={gpaData}
                                onClick={(data: any) => {
                                    if (data && data.activePayload && data.activePayload.length > 0) {
                                        setSelectedSemester(data.activePayload[0].payload.name);
                                    }
                                }}
                                className="cursor-pointer"
                                barSize={40}
                            >
                                <defs>
                                    <linearGradient id="colorGpaBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    fontWeight={500}
                                />
                                <YAxis
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 4]}
                                    ticks={[0, 1, 2, 3, 4]}
                                    tickFormatter={(value) => `${value.toFixed(1)}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-xl border bg-background/95 backdrop-blur-sm p-3 shadow-xl ring-1 ring-black/5">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                                                            GPA Analysis
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                                            <span className="font-bold text-lg text-foreground font-mono">
                                                                {payload[0].value}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {payload[0].payload.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar
                                    dataKey="gpa"
                                    radius={[8, 8, 4, 4]}
                                    fill="url(#colorGpaBar)"
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {activeSemester && selectedSemesterData && (
                        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <h3 className="font-semibold mb-4 text-sm flex items-center justify-between">
                                <span>Results for {activeSemester}</span>
                                <span className="text-muted-foreground font-normal text-xs">GPA: {gpaData.find(d => d.name === activeSemester)?.gpa}</span>
                            </h3>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Module</TableHead>
                                            <TableHead>Grade</TableHead>
                                            <TableHead className="text-right">Marks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedSemesterData.map((result, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-xs">{result.moduleCode}</span>
                                                        <span className="text-xs text-muted-foreground">{result.moduleName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                                        ${['A+', 'A', 'A-'].includes(result.grade) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                            ['B+', 'B', 'B-'].includes(result.grade) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                                                ['C+', 'C', 'C-'].includes(result.grade) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                                        {result.grade}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">{result.marks}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
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
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={5}
                                    >
                                        {medicalChartData.map((entry, index) => (
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
                                                                {medicalChartData.reduce((acc, curr) => acc + curr.value, 0)}
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
