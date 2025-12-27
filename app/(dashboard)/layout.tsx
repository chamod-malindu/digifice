"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { LayoutDashboard, Users, BookOpen, FileText } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // We can determine items based on role or simple unified sidebar for now.
    // Since we have role-based protection, showing all links or filtering is fine.
    // For now simple admin links.
    const items = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/results", label: "Results", icon: FileText },
        { href: "/admin/results/modules", label: "Modules", icon: BookOpen },
    ]
    // For student/lecturer we might need different logic or checking path.
    // But for restoration, let's just make it functional for Admin.

    return (
        <div className="flex min-h-screen w-full">
            <DashboardSidebar items={items} />
            <div className="flex-1 p-8 overflow-auto">
                {children}
            </div>
        </div>
    )
}
