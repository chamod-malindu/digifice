import LogOutButton from "@/components/LogOutButton";
import { ThemeToggleRow } from "@/components/ThemeToggleRow";
import { GraduationCap } from "lucide-react";
import { UserProfile } from "@/components/UserProfile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { StudentNav } from "@/components/student-nav";

export default async function StudentLayout({
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
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Digifice</h1>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Student</p>
                        </div>
                    </div>
                    <nav className="px-4 space-y-1 mb-2">
                        {/* Profile link moved to UserProfile component */}
                    </nav>
                    <StudentNav />
                </div>

                <div className="p-4 space-y-2 border-t border-border bg-background/50">
                    <UserProfile
                        name={session?.user?.name}
                        email={session?.user?.email}
                        image={session?.user?.image}
                        href="/student/profile"
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
        </div>
    )
}
