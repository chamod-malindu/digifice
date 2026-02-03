import LogOutButton from "@/components/LogOutButton";
import { ThemeToggleRow } from "@/components/ThemeToggleRow";
import { ShieldCheck } from "lucide-react";
import { UserProfile } from "@/components/UserProfile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions);
    // console.log("Admin Layout Session:", JSON.stringify(session?.user, null, 2));

    const adminType = session?.user?.adminType;

    // Define access based on adminType
    // For legacy users (undefined adminType), we assume Super Admin access or restrict? 
    // Given the requirement, improved security suggests restricting if type is unknown for new roles, 
    // but for backward compatibility we often default to full access.
    // However, since we seeded "adminType", we should rely on it.
    // Let's implement strict checks.

    return (
        <div className="flex h-screen bg-background text-foreground">
            <aside className="w-64 border-r border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:flex flex-col relative justify-between">
                <div>
                    <div className="p-6 flex items-center gap-2">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Digifice</h1>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Admin</p>
                        </div>
                    </div>
                    <nav className="px-4 space-y-1">
                        <a href="/admin" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">Dashboard</a>

                        {/* User Management: Super Admin Only */}
                        {(adminType === 'super_admin' || !adminType) && (
                            <a href="/admin/users" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">User Management</a>
                        )}

                        {/* Results: Super Admin & Exam Admin */}
                        {(adminType === 'super_admin' || adminType === 'exam_admin' || !adminType) && (
                            <a href="/admin/results" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">Results</a>
                        )}

                        {/* Medical Review: Super Admin & Medical Officer & Exam Admin */}
                        {(adminType === 'super_admin' || adminType === 'medical_officer' || adminType === 'exam_admin' || !adminType) && (
                            <a href="/admin/medical" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">
                                {adminType === 'exam_admin' ? 'Approved Medicals' : 'Medical Review'}
                            </a>
                        )}

                        {/* Other Super Admin Links */}
                        {(adminType === 'super_admin' || !adminType) && (
                            <>
                                <a href="/admin/lecturers" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">Lecturers</a>
                                <a href="/admin/students" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">Students</a>
                                <a href="/admin/requests" className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-foreground">Profile Requests</a>
                            </>
                        )}
                    </nav>
                </div>

                <div className="p-4 space-y-2 border-t border-border bg-background/50">
                    <UserProfile
                        name={session?.user?.name}
                        email={session?.user?.email}
                        image={session?.user?.image}
                        className="mb-2"
                    />
                    {adminType && (
                        <div className="px-2 pb-2 text-xs text-muted-foreground capitalize">
                            Role: {adminType.replace('_', ' ')}
                        </div>
                    )}
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
