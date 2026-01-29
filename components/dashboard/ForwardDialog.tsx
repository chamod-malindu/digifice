"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Info, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Lecturer {
    _id: string;
    name: string;
    email: string;
    department?: {
        _id: string;
        name: string;
    }
}

interface Department {
    _id: string;
    name: string;
}

interface Faculty {
    _id: string;
    name: string;
    departments: Department[];
}

interface ForwardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requestId: string;
    studentDepartmentId?: string;
    onSuccess: () => void;
}

export function ForwardDialog({ open, onOpenChange, requestId, studentDepartmentId, onSuccess }: ForwardDialogProps) {
    // Hierarchy State
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [deptLecturers, setDeptLecturers] = useState<Lecturer[]>([]);
    const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [selectedLecturer, setSelectedLecturer] = useState<string | null>(null);

    // Popover States
    const [openFaculty, setOpenFaculty] = useState(false);
    const [openDepartment, setOpenDepartment] = useState(false);
    const [openLecturer, setOpenLecturer] = useState(false);

    // All Lecturers State
    const [allLecturers, setAllLecturers] = useState<Lecturer[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAllLecturer, setSelectedAllLecturer] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [hierarchyLoading, setHierarchyLoading] = useState(true);

    // Tab State
    const [activeTab, setActiveTab] = useState("department");

    // Reset on Open
    useEffect(() => {
        if (open) {
            // Helper to fetch hierarchy
            const fetchHierarchy = async () => {
                setHierarchyLoading(true);
                try {
                    const res = await fetch('/api/hierarchy');
                    const data = await res.json();
                    setFaculties(data);

                    if (studentDepartmentId) {
                        const deptId = studentDepartmentId;
                        const foundFaculty = data.find((f: Faculty) =>
                            f.departments.some(d => d._id === deptId)
                        );

                        if (foundFaculty) {
                            setSelectedFaculty(foundFaculty._id);
                            setSelectedDepartment(deptId);
                            setActiveTab("department");
                        }
                    }
                } catch (err) {
                    toast.error("Failed to load hierarchy");
                } finally {
                    setHierarchyLoading(false);
                }
            };
            fetchHierarchy();

            // Clear selections
            setSelectedFaculty(null);
            setSelectedDepartment(null);
            setSelectedLecturer(null);
            setSelectedAllLecturer(null);
            setDeptLecturers([]);
            setAllLecturers([]);
            setSearchQuery("");
        }
    }, [open, studentDepartmentId]);

    // Fetch Lecturers for Department
    useEffect(() => {
        if (selectedDepartment) {
            setDeptLecturers([]);
            fetch(`/api/admin/lecturers?departmentId=${selectedDepartment}`)
                .then(res => res.json())
                .then(data => setDeptLecturers(data))
                .catch(err => toast.error("Failed to load lecturers"));
        } else {
            setDeptLecturers([]);
        }
    }, [selectedDepartment]);

    // Fetch All Lecturers (Debounced search could be better, but simple effect for now)
    useEffect(() => {
        if (activeTab === "all") {
            const timer = setTimeout(() => {
                const url = searchQuery
                    ? `/api/admin/lecturers?search=${encodeURIComponent(searchQuery)}`
                    : `/api/admin/lecturers`;

                fetch(url)
                    .then(res => res.json())
                    .then(data => setAllLecturers(data))
                    .catch(err => console.error(err));
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeTab, searchQuery]);

    const currentDepartments = selectedFaculty
        ? faculties.find(f => f._id === selectedFaculty)?.departments || []
        : [];

    const handleForward = async () => {
        const lecturerId = activeTab === "department" ? selectedLecturer : selectedAllLecturer;

        if (!lecturerId) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/medical/${requestId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: requestId,
                    status: 'forwarded_to_dept',
                    forwardedTo: lecturerId
                })
            });

            if (res.ok) {
                toast.success("Medical request forwarded successfully");
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error("Failed to forward request");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Forward to Lecturer</DialogTitle>
                    <DialogDescription>
                        Select the academic staff member to route this request to.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="department">By Department</TabsTrigger>
                        <TabsTrigger value="all">All Lecturers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="department" className="space-y-4 py-4">
                        {studentDepartmentId && selectedDepartment === studentDepartmentId && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md flex items-center text-green-600 dark:text-green-400 text-xs mb-2">
                                <Info className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                Suggested based on Student's Department
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Faculty</Label>
                            <Popover open={openFaculty} onOpenChange={setOpenFaculty}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openFaculty}
                                        className="w-full justify-between"
                                    >
                                        {selectedFaculty
                                            ? faculties.find((f) => f._id === selectedFaculty)?.name
                                            : "Select faculty..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search faculty..." />
                                        <CommandList>
                                            <CommandEmpty>No faculty found.</CommandEmpty>
                                            <CommandGroup>
                                                {faculties.map((faculty) => (
                                                    <CommandItem
                                                        key={faculty._id}
                                                        value={faculty.name}
                                                        onSelect={() => {
                                                            setSelectedFaculty(faculty._id);
                                                            setSelectedDepartment(null);
                                                            setSelectedLecturer(null);
                                                            setOpenFaculty(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedFaculty === faculty._id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {faculty.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <Label>Department</Label>
                            <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openDepartment}
                                        className="w-full justify-between"
                                        disabled={!selectedFaculty}
                                    >
                                        {selectedDepartment
                                            ? currentDepartments.find((d) => d._id === selectedDepartment)?.name
                                            : "Select department..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search department..." />
                                        <CommandList>
                                            <CommandEmpty>No department found.</CommandEmpty>
                                            <CommandGroup>
                                                {currentDepartments.map((dept) => (
                                                    <CommandItem
                                                        key={dept._id}
                                                        value={dept.name}
                                                        onSelect={() => {
                                                            setSelectedDepartment(dept._id);
                                                            setSelectedLecturer(null);
                                                            setOpenDepartment(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedDepartment === dept._id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {dept.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <Label>Lecturer</Label>
                            <Popover open={openLecturer} onOpenChange={setOpenLecturer}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openLecturer}
                                        className="w-full justify-between"
                                        disabled={!selectedDepartment}
                                    >
                                        {selectedLecturer
                                            ? deptLecturers.find((l) => l._id === selectedLecturer)?.name
                                            : "Select lecturer..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search lecturer..." />
                                        <CommandList>
                                            <CommandEmpty>No lecturer found.</CommandEmpty>
                                            <CommandGroup>
                                                {deptLecturers.map((lecturer) => (
                                                    <CommandItem
                                                        key={lecturer._id}
                                                        value={lecturer.name}
                                                        onSelect={() => {
                                                            setSelectedLecturer(lecturer._id);
                                                            setOpenLecturer(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedLecturer === lecturer._id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span>{lecturer.name}</span>
                                                            <span className="text-xs text-muted-foreground">{lecturer.email}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </TabsContent>

                    <TabsContent value="all" className="space-y-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="h-[200px] border rounded-md">
                            <div className="p-2 space-y-1">
                                {allLecturers.map((lecturer) => (
                                    <div
                                        key={lecturer._id}
                                        className={cn(
                                            "flex items-center justify-between p-2 rounded-sm cursor-pointer hover:bg-muted",
                                            selectedAllLecturer === lecturer._id && "bg-muted"
                                        )}
                                        onClick={() => setSelectedAllLecturer(lecturer._id)}
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{lecturer.name}</p>
                                            <p className="text-xs text-muted-foreground">{lecturer.email}</p>
                                            {lecturer.department && (
                                                <p className="text-[10px] text-muted-foreground">{lecturer.department.name}</p>
                                            )}
                                        </div>
                                        {selectedAllLecturer === lecturer._id && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                ))}
                                {allLecturers.length === 0 && (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                        No lecturers found
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleForward}
                        disabled={loading || (activeTab === "department" ? !selectedLecturer : !selectedAllLecturer)}
                    >
                        {loading ? "Forwarding..." : "Forward"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
