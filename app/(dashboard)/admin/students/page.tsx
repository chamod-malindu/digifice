"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCog, Upload, Layers, ChevronRight, Home, ArrowLeft, PlusCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StudentAssignmentDialog } from "@/components/dashboard/StudentAssignmentDialog";
import { BulkUploadDialog } from "@/components/dashboard/BulkUploadDialog";
import { BatchEnrollmentDialog } from "@/components/dashboard/BatchEnrollmentDialog";
import { SelectionGrid } from "@/components/dashboard/SelectionTiles";
import {
    FacultyDialog,
    DepartmentDialog,
    DegreeDialog,
    ModuleDialog
} from "@/components/dashboard/AcademicStructureDialogs";
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

interface Student {
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
    degreeProgram?: {
        _id: string;
        name: string;
    };
    bulkUploadBatch?: string;
    academicYear?: number;
    semester?: number;
}

type Step = 'faculty' | 'department' | 'degree' | 'module' | 'students';

interface SelectionItem {
    _id: string;
    name: string;
    [key: string]: any;
}

export default function StudentManagementPage() {
    // Navigation State
    const [step, setStep] = useState<Step>('faculty');
    const [selectedFaculty, setSelectedFaculty] = useState<SelectionItem | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<SelectionItem | null>(null);
    const [selectedDegree, setSelectedDegree] = useState<SelectionItem | null>(null);
    const [selectedModule, setSelectedModule] = useState<SelectionItem | null>(null);

    // Data State
    const [gridItems, setGridItems] = useState<SelectionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Student List State
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    // CRUD Dialog States
    const [facultyDialogOpen, setFacultyDialogOpen] = useState(false);
    const [deptDialogOpen, setDeptDialogOpen] = useState(false);
    const [degreeDialogOpen, setDegreeDialogOpen] = useState(false);
    const [moduleDialogOpen, setModuleDialogOpen] = useState(false);

    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [editItem, setEditItem] = useState<SelectionItem | undefined>(undefined);

    // Delete Confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Other Dialogs
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [isBatchEnrollOpen, setIsBatchEnrollOpen] = useState(false);

    // Fetch Hierarchy Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            let url = '';
            if (step === 'faculty') {
                url = '/api/hierarchy?type=faculty';
            } else if (step === 'department' && selectedFaculty) {
                url = `/api/hierarchy?type=department&parentId=${selectedFaculty._id}`;
            } else if (step === 'degree' && selectedDepartment) {
                url = `/api/hierarchy?type=degree&parentId=${selectedDepartment._id}`;
            } else if (step === 'module' && selectedDegree) {
                url = `/api/hierarchy?type=module&parentId=${selectedDegree._id}`;
            } else if (step === 'students') {
                await fetchStudents(); // Handled separately
                setIsLoading(false);
                return;
            }

            if (url) {
                const res = await fetch(url);
                const data = await res.json();
                if (Array.isArray(data)) setGridItems(data);
                else setGridItems([]);
            }
        } catch (error) {
            console.error("Failed to load hierarchy data", error);
        } finally {
            if (step !== 'students') setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [step, selectedFaculty, selectedDepartment, selectedDegree]);

    // Fetch Students
    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedFaculty) params.append('facultyId', selectedFaculty._id);
            if (selectedDepartment) params.append('departmentId', selectedDepartment._id);
            if (selectedDegree) params.append('degreeId', selectedDegree._id);
            if (selectedModule) params.append('moduleId', selectedModule._id);

            const res = await fetch(`/api/admin/students?${params.toString()}`);
            const data = await res.json();
            if (Array.isArray(data)) setStudents(data);
        } catch (error) {
            console.error("Failed to load students", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Refetch students when search changes (debounce could be added here)
    useEffect(() => {
        if (step === 'students') {
            const timer = setTimeout(() => {
                fetchStudents();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchQuery]);

    // Handlers
    const handleSelect = (id: string) => {
        const item = gridItems.find(i => i._id === id);
        if (!item) return;

        if (step === 'faculty') {
            setSelectedFaculty(item);
            setStep('department');
        } else if (step === 'department') {
            setSelectedDepartment(item);
            setStep('degree');
        } else if (step === 'degree') {
            setSelectedDegree(item);
            setStep('module');
        } else if (step === 'module') {
            setSelectedModule(item);
            setStep('students');
        }
    };

    const handleCreate = () => {
        setDialogMode('create');
        setEditItem(undefined);
        if (step === 'faculty') setFacultyDialogOpen(true);
        if (step === 'department') setDeptDialogOpen(true);
        if (step === 'degree') setDegreeDialogOpen(true);
        if (step === 'module') setModuleDialogOpen(true);
    };

    const handleEdit = (id: string, item: any) => {
        setDialogMode('edit');
        setEditItem(item);
        if (step === 'faculty') setFacultyDialogOpen(true);
        if (step === 'department') setDeptDialogOpen(true);
        if (step === 'degree') setDegreeDialogOpen(true);
        if (step === 'module') setModuleDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        let url = '';
        if (step === 'faculty') url = `/api/admin/faculties?id=${itemToDelete}`;
        if (step === 'department') url = `/api/admin/departments?id=${itemToDelete}`;
        if (step === 'degree') url = `/api/admin/degrees?id=${itemToDelete}`;
        if (step === 'module') url = `/api/admin/modules?id=${itemToDelete}`;

        try {
            const res = await fetch(url, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete item");
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleBack = () => {
        if (step === 'students') {
            setStep('module');
            setSelectedModule(null);
            setStudents([]);
        } else if (step === 'module') {
            setStep('degree');
            setSelectedDegree(null);
        } else if (step === 'degree') {
            setStep('department');
            setSelectedDepartment(null);
        } else if (step === 'department') {
            setStep('faculty');
            setSelectedFaculty(null);
        }
    };

    // Breadcrumb Navigation Handler
    const handleBreadcrumbClick = (targetStep: Step) => {
        if (targetStep === 'faculty') {
            setStep('faculty');
            setSelectedFaculty(null); setSelectedDepartment(null); setSelectedDegree(null); setSelectedModule(null);
        } else if (targetStep === 'department' && selectedFaculty) {
            setStep('department');
            setSelectedDepartment(null); setSelectedDegree(null); setSelectedModule(null);
        } else if (targetStep === 'degree' && selectedDepartment) {
            setStep('degree');
            setSelectedDegree(null); setSelectedModule(null);
        } else if (targetStep === 'module' && selectedDegree) {
            setStep('module');
            setSelectedModule(null);
        }
    };

    // Student List Checkbox Logic
    const toggleSelectAll = () => {
        if (selectedStudentIds.length === students.length && students.length > 0) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map(s => s._id));
        }
    };

    const toggleSelectOne = (id: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Student & Curriculum Management</h2>
                        <p className="text-muted-foreground">Manage hierarchy, modules, and student enrollments.</p>
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md overflow-x-auto">
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleBreadcrumbClick('faculty')}>
                        <Home className="h-3 w-3 mr-1" /> Faculties
                    </Button>
                    {selectedFaculty && (
                        <>
                            <ChevronRight className="h-3 w-3" />
                            <Button variant="ghost" size="sm" className={`h-6 px-2 ${step === 'department' ? 'font-bold text-primary' : ''}`} onClick={() => handleBreadcrumbClick('department')}>
                                {selectedFaculty.name}
                            </Button>
                        </>
                    )}
                    {selectedDepartment && (
                        <>
                            <ChevronRight className="h-3 w-3" />
                            <Button variant="ghost" size="sm" className={`h-6 px-2 ${step === 'degree' ? 'font-bold text-primary' : ''}`} onClick={() => handleBreadcrumbClick('degree')}>
                                {selectedDepartment.name}
                            </Button>
                        </>
                    )}
                    {selectedDegree && (
                        <>
                            <ChevronRight className="h-3 w-3" />
                            <Button variant="ghost" size="sm" className={`h-6 px-2 ${step === 'module' ? 'font-bold text-primary' : ''}`} onClick={() => handleBreadcrumbClick('module')}>
                                {selectedDegree.name}
                            </Button>
                        </>
                    )}
                    {selectedModule && (
                        <>
                            <ChevronRight className="h-3 w-3" />
                            <span className="font-bold text-primary px-2">{selectedModule.name}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Back Button */}
            {step !== 'faculty' && (
                <Button variant="outline" size="sm" onClick={handleBack} className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to {
                        step === 'students' ? 'Modules' :
                            step === 'module' ? 'Degree Programs' :
                                step === 'degree' ? 'Departments' : 'Faculties'
                    }
                </Button>
            )}

            {/* Content Area */}
            {step !== 'students' ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">
                            Select {step === 'faculty' ? 'Faculty' : step === 'department' ? 'Department' : step === 'degree' ? 'Degree Program' : 'Module'}
                        </h3>
                        <div className="flex gap-2">
                            <Button onClick={handleCreate} className="gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Create New {step === 'faculty' ? 'Faculty' : step === 'department' ? 'Department' : step === 'degree' ? 'Degree' : 'Module'}
                            </Button>
                            {/* Allow Bulk Upload at Degree level relative to students */}
                            {(step === 'degree' || step === 'module') && (
                                <Button onClick={() => setIsBulkDialogOpen(true)} variant="secondary">
                                    <Upload className="mr-2 h-4 w-4" /> Bulk Upload Students
                                </Button>
                            )}
                        </div>
                    </div>

                    <SelectionGrid
                        items={gridItems}
                        type={step}
                        onSelect={handleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        isLoading={isLoading}
                    />
                </div>
            ) : (
                /* Student List View */
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                        <div className="flex items-center gap-2">
                            {selectedStudentIds.length > 0 && (
                                <Button variant="secondary" onClick={() => setIsBatchEnrollOpen(true)}>
                                    <Layers className="mr-2 h-4 w-4" />
                                    Assign Modules ({selectedStudentIds.length})
                                </Button>
                            )}
                            <Button onClick={() => setIsBulkDialogOpen(true)}>
                                <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                            </Button>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        {isLoading ? (
                            <div className="text-center py-10">Loading students...</div>
                        ) : students.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                <p>No students found for this selection.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                    <tr>
                                        <th className="w-[40px] px-4 py-3">
                                            <Checkbox
                                                checked={students.length > 0 && selectedStudentIds.length === students.length}
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Select all"
                                            />
                                        </th>
                                        <th className="px-4 py-3">Student</th>
                                        <th className="px-4 py-3">Department/Degree</th>
                                        <th className="px-4 py-3">Year/Sem</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {students.map((student) => (
                                        <tr key={student._id} className={`hover:bg-muted/30 transition-colors ${selectedStudentIds.includes(student._id) ? "bg-muted/50" : ""}`}>
                                            <td className="px-4 py-3">
                                                <Checkbox
                                                    checked={selectedStudentIds.includes(student._id)}
                                                    onCheckedChange={() => toggleSelectOne(student._id)}
                                                    aria-label={`Select ${student.name}`}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={student.image} />
                                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            {student.name}
                                                            {student.bulkUploadBatch && (
                                                                <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">Batch</Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">{student.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{student.department?.name || 'Unassigned'}</span>
                                                    <span className="text-xs text-muted-foreground">{student.degreeProgram?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        Y{student.academicYear || 1}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        S{student.semester || 1}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <UserCog className="mr-2 h-3.5 w-3.5" />
                                                    Manage
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <FacultyDialog
                open={facultyDialogOpen}
                onOpenChange={setFacultyDialogOpen}
                onSuccess={fetchData}
                mode={dialogMode}
                initialData={editItem}
            />
            <DepartmentDialog
                open={deptDialogOpen}
                onOpenChange={setDeptDialogOpen}
                onSuccess={fetchData}
                mode={dialogMode}
                initialData={editItem}
                parentId={selectedFaculty?._id}
            />
            <DegreeDialog
                open={degreeDialogOpen}
                onOpenChange={setDegreeDialogOpen}
                onSuccess={fetchData}
                mode={dialogMode}
                initialData={editItem}
                parentId={selectedDepartment?._id}
            />
            <ModuleDialog
                open={moduleDialogOpen}
                onOpenChange={setModuleDialogOpen}
                onSuccess={fetchData}
                mode={dialogMode}
                initialData={editItem}
                parentId={selectedDegree?._id}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected item
                            {step !== 'module' ? ' and all items nested under it (e.g. deleting a Faculty deletes its Departments).' : '.'}
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

            {selectedStudent && (
                <StudentAssignmentDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    studentId={selectedStudent._id}
                    studentName={selectedStudent.name}
                    currentDepartmentId={selectedStudent.department?._id}
                    currentFacultyId={selectedStudent.department?.faculty?._id}
                    currentAcademicYear={selectedStudent.academicYear}
                    currentSemester={selectedStudent.semester}
                    onSuccess={() => fetchStudents()}
                />
            )}

            <BulkUploadDialog
                open={isBulkDialogOpen}
                onOpenChange={setIsBulkDialogOpen}
                onSuccess={() => {
                    if (step === 'students') fetchStudents();
                    setIsBulkDialogOpen(false);
                }}
                context={{
                    facultyId: selectedFaculty?._id,
                    departmentId: selectedDepartment?._id,
                    degreeId: selectedDegree?._id
                }}
            />

            <BatchEnrollmentDialog
                open={isBatchEnrollOpen}
                onOpenChange={setIsBatchEnrollOpen}
                studentCount={selectedStudentIds.length}
                studentIds={selectedStudentIds}
                onSuccess={() => {
                    setSelectedStudentIds([]);
                }}
            />
        </div>
    );
}
