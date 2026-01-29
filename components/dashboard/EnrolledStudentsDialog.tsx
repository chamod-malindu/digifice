"use client"

import { useState, useEffect } from "react"
import { Users, Search, Mail } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Student {
    _id: string;
    name: string;
    email: string;
    image?: string;
}

interface EnrolledStudentsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseName: string;
    courseCode: string;
}

export function EnrolledStudentsDialog({
    open,
    onOpenChange,
    courseId,
    courseName,
    courseCode
}: EnrolledStudentsDialogProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (open && courseId) {
            setLoading(true);
            fetch(`/api/lecturer/courses/${courseId}/students`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setStudents(data);
                    }
                })
                .catch(err => console.error("Failed to load students", err))
                .finally(() => setLoading(false));
        }
    }, [open, courseId]);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Enrolled Students
                    </DialogTitle>
                    <DialogDescription>
                        Students currently enrolled in <span className="font-medium text-foreground">{courseCode} - {courseName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    <div className="relative mb-4">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <ScrollArea className="h-[300px] pr-4">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                Loading students...
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                <Users className="h-8 w-8 opacity-20" />
                                <p className="text-sm">No students found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student._id}
                                        className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={student.image} />
                                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium leading-none">{student.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{student.email}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-normal">Active</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                        <span>Total Enrolled: {students.length}</span>
                        {/* More stats or actions can go here */}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
