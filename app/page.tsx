import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "student") {
      redirect("/student");
    } else if (session.user.role === "lecturer") {
      redirect("/lecturer");
    } else if (session.user.role === "admin") {
      redirect("/admin");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <LandingNavbar />

      {/* Hero Section */}
      <main className="flex-1 relative flex items-center justify-center min-h-[800px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpeg"
            alt="University students collaborating"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter drop-shadow-sm">
              Future Ready Academic Management
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              Seamlessly digitize every aspect of university administration. From instant medical requests to automated result processing—experience the next generation of campus efficiency.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
