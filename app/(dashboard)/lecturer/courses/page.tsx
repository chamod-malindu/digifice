"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, ArrowRight } from "lucide-react";
import { EnrolledStudentsDialog } from "@/components/dashboard/EnrolledStudentsDialog";

export default function LecturerCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog State
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/lecturer/courses');
                const data = await res.json();
                if (data.modules && Array.isArray(data.modules)) {
                    setCourses(data.modules);
                }
            } catch (err) {
                console.error("Failed to fetch courses:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (isLoading) return <div>Loading courses...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
                <p className="text-muted-foreground">Manage your assigned modules and student communications.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map(course => (
                    <Card key={course._id} className="hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                {course.code}
                                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                    {course.semester}
                                </span>
                            </CardTitle>
                            <CardDescription className="font-semibold text-lg text-foreground">
                                {course.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{course.credits} Credits</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <Button asChild className="w-full">
                                <Link href={`/lecturer/courses/${course._id}`}>
                                    Manage Course <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setSelectedCourse(course);
                                    setIsDialogOpen(true);
                                }}
                            >
                                <Users className="mr-2 h-4 w-4" /> View Students
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full text-center py-10">
                        <p className="text-muted-foreground">No courses assigned to you yet.</p>
                    </div>
                )}
            </div>

            {selectedCourse && (
                <EnrolledStudentsDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    courseId={selectedCourse._id}
                    courseName={selectedCourse.name}
                    courseCode={selectedCourse.code}
                />
            )}
        </div>
    );
}
