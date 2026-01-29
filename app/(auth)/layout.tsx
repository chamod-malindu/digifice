import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Left Panel - Visuals */}
            <div className="relative hidden lg:flex flex-col justify-between p-10 text-white dark:border-r animate-slide-in-left">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/hero-bg.jpeg"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-zinc-900/50 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="relative z-10 flex items-center gap-2">
                    {/* Placeholder for Logo if needed, or keep text */}
                    <span className="text-xl font-medium tracking-tight">Digifice</span>
                </div>

                <div className="relative z-10 space-y-4">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium leading-relaxed">
                            "Digifice has completely transformed how we handle academic administration. It's seamless, efficient, and truly next-gen."
                        </p>
                        <footer className="text-sm text-white/80">
                            Dr. Emily Carter, Dean of Academic Affairs
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex items-center justify-center p-8 bg-background animate-fade-in-up delay-200">
                <div className="w-full max-w-sm space-y-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
