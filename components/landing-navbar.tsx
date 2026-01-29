"use client";

import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { FontSizeToggle } from "@/components/font-size-toggle";
import { DateTimeDisplay } from "@/components/date-time-display";
import { usePathname } from "next/navigation";

export function LandingNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const isLanding = pathname === "/";

    const textColorClass = isLanding
        ? "text-white"
        : "text-foreground";

    const hoverColorClass = isLanding
        ? "hover:text-white/80"
        : "hover:text-primary";

    const iconButtonClass = isLanding
        ? "text-white hover:bg-white/10 hover:text-white"
        : "text-foreground hover:bg-accent hover:text-foreground";

    const links = [
        { href: "/", label: "Home" },
        { href: "/features", label: "Features" },
        { href: "/news", label: "News" },
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Us" },
    ];

    return (
        <header className="absolute top-0 w-full z-50 bg-transparent pt-4">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className={`flex items-center gap-2 ${textColorClass}`}>
                    <span className="text-xl font-medium tracking-tight">Digifice</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 ml-auto">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors ${isLanding ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className={`flex items-center gap-4 pl-4 border-l ${isLanding ? "border-white/10" : "border-border"}`}>
                        <DateTimeDisplay className={isLanding ? "text-white/90" : "text-muted-foreground"} />
                        <div className="flex items-center gap-1">
                            <ModeToggle className={iconButtonClass} />
                            <FontSizeToggle className={iconButtonClass} />
                        </div>
                    </div>
                </nav>

                {/* Mobile Nav */}
                <div className="md:hidden ml-auto">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className={isLanding ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"}>
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full h-full sm:max-w-none border-none bg-background/98 backdrop-blur-xl p-0">
                            <SheetHeader className="p-6 border-b border-border flex flex-row items-center justify-between space-y-0">
                                <SheetTitle className="text-foreground flex items-center gap-2 text-xl font-bold">
                                    Digifice
                                </SheetTitle>

                            </SheetHeader>

                            <div className="flex flex-col h-full p-6">
                                <div className="flex flex-col gap-6 mt-8">
                                    {links.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className="text-2xl font-bold text-muted-foreground hover:text-foreground transition-colors tracking-tight"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>

                                <div className="mt-auto pb-24">
                                    <Link href="/login" onClick={() => setIsOpen(false)}>
                                        <Button size="lg" className="w-full text-lg h-14 font-semibold">
                                            Sign In
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
