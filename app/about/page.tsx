import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <LandingNavbar />
            <main className="flex-1 container mx-auto px-4 pt-32 pb-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-center">About Digifice</h1>

                    <div className="prose prose-lg dark:prose-invert mx-auto">
                        <p className="text-xl text-muted-foreground text-center mb-12">
                            Empowering educational institutions with next-generation management technology.
                        </p>

                        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                            <div className="bg-muted aspect-video rounded-xl flex items-center justify-center">
                                <span className="text-muted-foreground">Our Mission Image</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                                <p className="text-muted-foreground">
                                    To streamline academic administration through intuitive, secure, and efficient digital solutions, allowing educators to focus on what matters most—teaching.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">The Digifice Story</h2>
                            <p className="text-muted-foreground">
                                Born from the need to modernize legacy university systems, Digifice was built by a team of educators and developers who understood the pain points of academic administration. We believe in a future where campus logistics are invisible, and learning is limitless.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
