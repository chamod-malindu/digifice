import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function LandingFooter() {
    return (
        <footer className="border-t bg-muted/40 backdrop-blur">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <span className="font-semibold text-foreground">Digifice</span>
                    </Link>
                    <p className="text-sm text-muted-foreground text-center md:text-right">
                        &copy; {new Date().getFullYear()} Digifice University Management System. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
