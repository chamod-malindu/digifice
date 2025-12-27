"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { LogOut, LayoutDashboard, Users, GraduationCap, ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
    items: { href: string; label: string; icon: any }[]
}

export function DashboardSidebar({ items }: SidebarProps) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className={cn("relative flex flex-col border-r bg-muted/40 transition-all duration-300", collapsed ? "w-[60px]" : "w-[240px]")}>
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] justify-between">
                {!collapsed && <Link href="/" className="flex items-center gap-2 font-semibold">
                    <GraduationCap className="h-6 w-6" />
                    <span className="">Digifice</span>
                </Link>}
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>
            <nav className="flex-1 space-y-2 p-2 font-medium">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "bg-muted text-primary",
                            collapsed && "justify-center px-0"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && item.label}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto p-4 border-t">
                <Button variant="ghost" size={collapsed ? "icon" : "default"} className="w-full justify-start gap-2" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4" />
                    {!collapsed && "Logout"}
                </Button>
            </div>
        </div>
    )
}
