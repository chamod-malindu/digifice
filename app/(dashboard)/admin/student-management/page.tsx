"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Upload, Layers, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { UserDialog } from "@/components/users/user-dialog";
import { StudentAssignmentDialog } from "@/components/dashboard/StudentAssignmentDialog";
import { BulkUploadDialog } from "@/components/dashboard/BulkUploadDialog";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "@/components/users/columns";

interface Student extends User {
    department?: {
        _id: string;
        name: string;
        faculty?: {
            _id: string;
            name: string;
        }
    };
    degreeProgram?: {
        _id: string;
        name: string;
    };
    academicYear?: number;
    semester?: number;
}

export default function StudentManagementPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);

    // Dialog States
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const fetchStudents = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            params.append('page', page.toString());
            params.append('limit', '25');

            const res = await fetch(`/api/admin/students?${params.toString()}`);
            const data = await res.json();

            if (data.activeStudents || Array.isArray(data)) {
                // Handle legacy array response just in case
                setStudents(Array.isArray(data) ? data : data.students || []);
                setTotalPages(1);
            } else if (data.students) {
                // New paginated response
                setStudents(data.students);
                setTotalPages(data.pagination.pages);
                setCurrentPage(data.pagination.current);
                setTotalStudents(data.pagination.total);
            }
        } catch (error) {
            console.error("Failed to load students", error);
            toast.error("Failed to load students");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents(1); // Reset to page 1 on search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchStudents(newPage);
        }
    };

    const handleCreate = () => {
        setSelectedStudent(null);
        setUserDialogOpen(true);
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setUserDialogOpen(true);
    };

    const handleManage = (student: Student) => {
        setSelectedStudent(student);
        setAssignmentDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const res = await fetch(`/api/users/${itemToDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Student deleted");
            fetchStudents();
        } catch (error) {
            toast.error("Failed to delete student");
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
                        <p className="text-muted-foreground">Manage student accounts and academic placements.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsBulkDialogOpen(true)} variant="secondary">
                            <Upload className="mr-2 h-4 w-4" />
                            Bulk Upload
                        </Button>
                        <Button onClick={handleCreate}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Student
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or email..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Degree Program</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Faculty</TableHead>
                            <TableHead>Year/Sem</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Loading students...
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student._id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={student.image} />
                                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{student.name}</span>
                                                <span className="text-xs text-muted-foreground">{student.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell title={student.degreeProgram?.name}>
                                        {student.degreeProgram?.name ? (
                                            <span className="cursor-help border-b border-dotted border-muted-foreground/50">
                                                {student.degreeProgram.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell title={student.department?.name}>
                                        {student.department?.name ? (
                                            <span className="cursor-help border-b border-dotted border-muted-foreground/50">
                                                {student.department.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell title={student.department?.faculty?.name}>
                                        {student.department?.faculty?.name ? (
                                            <span className="cursor-help border-b border-dotted border-muted-foreground/50">
                                                {student.department.faculty.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Badge variant="secondary" className="text-xs">
                                                Y{student.academicYear || 1}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                S{student.semester || 1}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                title="Assign Modules"
                                                onClick={() => handleManage(student)}
                                            >
                                                <Layers className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                title="Edit Student"
                                                onClick={() => handleEdit(student)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                title="Delete Student"
                                                onClick={() => handleDeleteClick(student._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                    Showing {students.length > 0 ? ((currentPage - 1) * 25) + 1 : 0} to {Math.min(currentPage * 25, totalStudents)} of {totalStudents} students
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                        Page {currentPage} of {totalPages || 1}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || isLoading}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <UserDialog
                open={userDialogOpen}
                onOpenChange={setUserDialogOpen}
                onSuccess={() => fetchStudents(currentPage)}
                user={selectedStudent}
                defaultRole="student"
            />

            {selectedStudent && (
                <StudentAssignmentDialog
                    open={assignmentDialogOpen}
                    onOpenChange={setAssignmentDialogOpen}
                    studentId={selectedStudent._id}
                    studentName={selectedStudent.name}
                    currentDepartmentId={selectedStudent.department?._id}
                    currentFacultyId={selectedStudent.department?.faculty?._id}
                    currentAcademicYear={selectedStudent.academicYear}
                    currentSemester={selectedStudent.semester}
                    onSuccess={() => fetchStudents(currentPage)}
                />
            )}

            <BulkUploadDialog
                open={isBulkDialogOpen}
                onOpenChange={setIsBulkDialogOpen}
                onSuccess={() => {
                    fetchStudents(currentPage);
                    setIsBulkDialogOpen(false);
                }}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the student account for
                            <span className="font-medium text-foreground"> {students.find(s => s._id === itemToDelete)?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
