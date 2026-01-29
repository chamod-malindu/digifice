import { GraduationCap } from "lucide-react";

export function LandingFooter() {
    return (
        <footer className="border-t bg-muted/40 backdrop-blur">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-5 w-5" />
                        <span className="font-semibold text-foreground">Digifice</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center md:text-right">
                        &copy; {new Date().getFullYear()} Digifice University Management System. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
