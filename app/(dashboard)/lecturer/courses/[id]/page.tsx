"use client"

import { useEffect, useState, use } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Bell, Plus, Send } from "lucide-react";
import Link from "next/link"; // Correct import

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function CourseManagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [course, setCourse] = useState<any>(null);
    const [notices, setNotices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Notice Form
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Course Info
                const courseRes = await fetch(`/api/lecturer/courses/${id}`);
                const courseData = await courseRes.json();
                setCourse(courseData);

                // Fetch Notices
                const noticesRes = await fetch(`/api/notices?moduleId=${id}`);
                const noticesData = await noticesRes.json();
                if (Array.isArray(noticesData)) setNotices(noticesData);

                setIsLoading(false);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load course details");
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handlePostNotice = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPosting(true);

        try {
            // Need author ID. Since we are in demo mode without full session, 
            // we'll explicitly use the leader ID from the course or "me".
            const authorId = course?.leader?._id || "demo_lecturer_id";

            const res = await fetch('/api/notices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    moduleId: id,
                    moduleCode: course.code,
                    authorId: authorId,
                    authorName: "Lecturer" // Should fetch real name
                })
            });

            if (!res.ok) throw new Error("Failed to post notice");

            toast.success("Notice posted successfully");
            setIsDialogOpen(false);
            setTitle("");
            setContent("");

            // Refresh notices
            const noticesRes = await fetch(`/api/notices?moduleId=${id}`);
            const noticesData = await noticesRes.json();
            if (Array.isArray(noticesData)) setNotices(noticesData);

        } catch (error) {
            console.error(error);
            toast.error("Failed to post notice");
        } finally {
            setIsPosting(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (!course) return <div>Course not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/lecturer/courses"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{course.code}: {course.name}</h2>
                    <p className="text-muted-foreground">{course.semester} • {course.credits} Credits</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Bell className="h-5 w-5" /> Course Notices
                        </h3>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" /> Post Notice
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Post New Notice</DialogTitle>
                                    <DialogDescription>
                                        Send an announcement to all students enrolled in this course.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handlePostNotice} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Change in Lecture Time"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Message</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="Type your announcement here..."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            required
                                            rows={5}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={isPosting}>
                                            {isPosting ? "Posting..." : "Post Notice"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-4">
                        {notices.map((notice) => (
                            <Card key={notice._id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{notice.title}</CardTitle>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(notice.createdAt), "MMM d, yyyy h:mm a")}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{notice.content}</p>
                                </CardContent>
                            </Card>
                        ))}

                        {notices.length === 0 && (
                            <div className="text-center py-10 border rounded-lg bg-muted/20 text-muted-foreground">
                                No notices posted yet.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Module Code</span>
                                <div className="font-medium">{course.code}</div>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Credits</span>
                                <div className="font-medium">{course.credits}</div>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase">Semester</span>
                                <div className="font-medium">{course.semester}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
