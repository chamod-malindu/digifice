"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import LogOutButton from "@/components/LogOutButton";
import {
    ChevronLeft,
    ChevronRight,
    Settings,
    Type,
    LayoutDashboard
} from "lucide-react";

interface SidebarItem {
    icon: React.ElementType;
    label: string;
    href: string;
}

interface DashboardSidebarProps {
    role?: string;
    roleIcon?: React.ElementType;
    items: SidebarItem[];
}

export function DashboardSidebar({ role = "User", roleIcon: RoleIcon = LayoutDashboard, items }: DashboardSidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLargeText, setIsLargeText] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleTextSize = () => {
        setIsLargeText(!isLargeText);
        if (!isLargeText) {
            document.documentElement.classList.add('text-lg-mode');
        } else {
            document.documentElement.classList.remove('text-lg-mode');
        }
    };

    return (
        <aside
            className={cn(
                "bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border hidden md:flex flex-col relative transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex flex-col h-full justify-between">
                {/* Header */}
                <div>
                    <div className={cn("p-6 flex items-center gap-2", isCollapsed && "justify-center p-4")}>
                        <RoleIcon className="h-6 w-6 text-primary shrink-0" />
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">Digifice</h1>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold whitespace-nowrap">{role}</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="px-3 space-y-1 mt-2">
                        {items.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
                                        isActive
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="p-3 space-y-2 border-t border-border bg-background/50">

                    {/* Collapse Trigger & Text Size Tool */}
                    <div className={cn("flex items-center mb-2", isCollapsed ? "flex-col gap-2" : "justify-between px-2")}>
                        {!isCollapsed && <span className="text-xs font-semibold text-muted-foreground">Tools</span>}
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTextSize} title="Toggle Text Size">
                                <Type className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
                                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between px-2")}>
                        {!isCollapsed && <span className="text-xs font-semibold text-muted-foreground">Theme</span>}
                        <ModeToggle />
                    </div>

                    <LogOutButton
                        className={cn(
                            "text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-all",
                            isCollapsed && "justify-center"
                        )}
                        variant="ghost"
                    />
                </div>
            </div>
        </aside>
    );
}
