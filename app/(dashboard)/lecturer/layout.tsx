import LogOutButton from "@/components/LogOutButton";
import { ThemeToggleRow } from "@/components/ThemeToggleRow";
import { BookOpen } from "lucide-react";
import { LecturerTaskReminder } from "@/components/LecturerTaskReminder";
import { UserProfile } from "@/components/UserProfile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LecturerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions);

    return (
        <div className="flex h-screen bg-background text-foreground">
            <aside className="w-64 border-r border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:flex flex-col relative justify-between">
                <div>
                    <div className="p-6 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Digifice</h1>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Lecturer</p>
                        </div>
                    </div>
                    <nav className="px-4 space-y-1">
                        <a href="/lecturer" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">Dashboard</a>
                        <a href="/lecturer/courses" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">My Courses</a>
                        <a href="/lecturer/schedules" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">Schedule</a>
                        <a href="/lecturer/medicals" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">Medical Requests</a>
                        <a href="/lecturer/notifications" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">Notifications</a>
                    </nav>
                </div>

                <div className="p-4 space-y-2 border-t border-border bg-background/50">
                    <UserProfile
                        name={session?.user?.name}
                        email={session?.user?.email}
                        image={session?.user?.image}
                        href="/lecturer/profile"
                        className="mb-2"
                    />
                    <ThemeToggleRow className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive" />
                    <LogOutButton className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive" />
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-8 bg-muted/20">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
            <LecturerTaskReminder />
        </div>
    )
}
