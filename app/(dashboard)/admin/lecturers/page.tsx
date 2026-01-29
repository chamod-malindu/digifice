"use client"

import { useState, useEffect } from "react"
import { Search, UserCog, Building2, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AssignmentDialog } from "@/components/dashboard/AssignmentDialog"
import { AddLecturerDialog } from "@/components/dashboard/AddLecturerDialog"

interface Lecturer {
    _id: string;
    name: string;
    email: string;
    image?: string;
    department?: {
        _id: string;
        name: string;
        faculty?: {
            _id: string;
            name: string;
        }
    };
    modules?: {
        code: string;
        name: string;
    }[];
}

export default function LecturerManagementPage() {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Assignment Dialog State
    const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

    const fetchLecturers = async () => {
        setLoading(true);
        try {
            const url = searchQuery
                ? `/api/admin/lecturers?search=${encodeURIComponent(searchQuery)}`
                : `/api/admin/lecturers`;

            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
                setLecturers(data);
            } else {
                console.error("API returned non-array:", data);
                setLecturers([]);
            }
        } catch (error) {
            console.error("Failed to fetch lecturers");
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLecturers();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleManage = (lecturer: Lecturer) => {
        setSelectedLecturer(lecturer);
        setIsAssignmentDialogOpen(true);
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Lecturer Management</h2>
                    <p className="text-muted-foreground">
                        Manage academic staff assignments and departments.
                    </p>
                </div>
                <AddLecturerDialog onSuccess={fetchLecturers} />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Academic Staff</CardTitle>
                            <CardDescription>
                                List of all registered lecturers. Assign them to their respective faculties and departments.
                            </CardDescription>
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search lecturers..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            {lecturers.map((lecturer) => (
                                <div
                                    key={lecturer._id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage src={lecturer.image} />
                                            <AvatarFallback>{lecturer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{lecturer.name}</p>
                                            <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        <div className="flex flex-col items-end min-w-[150px]">
                                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                                                <Building2 className="w-3 h-3 mr-1" />
                                                <span className="text-xs uppercase font-semibold tracking-wider">Faculty</span>
                                            </div>
                                            {lecturer.department?.faculty ? (
                                                <span className="text-sm font-medium">{lecturer.department.faculty.name}</span>
                                            ) : (
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Not Assigned</Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end min-w-[150px]">
                                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                                                <GraduationCap className="w-3 h-3 mr-1" />
                                                <span className="text-xs uppercase font-semibold tracking-wider">Department</span>
                                            </div>
                                            {lecturer.department ? (
                                                <span className="text-sm font-medium">{lecturer.department.name}</span>
                                            ) : (
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Not Assigned</Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end max-w-[200px]">
                                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                                                <span className="text-xs uppercase font-semibold tracking-wider">Modules</span>
                                            </div>
                                            {lecturer.modules && lecturer.modules.length > 0 ? (
                                                <div className="flex flex-wrap justify-end gap-1">
                                                    {lecturer.modules.map((m: any) => (
                                                        <Badge key={m.code} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                                            {m.code}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">None</span>
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleManage(lecturer)}
                                        >
                                            <UserCog className="w-4 h-4 mr-2" />
                                            Manage
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {lecturers.length === 0 && !loading && (
                                <div className="text-center py-10 text-muted-foreground">
                                    No lecturers found.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {selectedLecturer && (
                <AssignmentDialog
                    open={isAssignmentDialogOpen}
                    onOpenChange={setIsAssignmentDialogOpen}
                    lecturerId={selectedLecturer._id}
                    lecturerName={selectedLecturer.name}
                    currentFacultyId={selectedLecturer.department?.faculty?._id}
                    currentDepartmentId={selectedLecturer.department?._id}
                    onSuccess={fetchLecturers}
                />
            )}
        </div>
    )
}
