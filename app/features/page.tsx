import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";

export default function FeaturesPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <LandingNavbar />
            <main className="flex-1 container mx-auto px-4 pt-32 pb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">System Features</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mb-12">
                    Discover the powerful tools that make Digifice the ultimate academic management solution.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        title="Student Management"
                        description="Comprehensive profiles, enrollment tracking, and academic history all in one place."
                    />
                    <FeatureCard
                        title="Result Processing"
                        description="Automated GPA calculation, result publishing, and transcript generation."
                    />
                    <FeatureCard
                        title="Medical Requests"
                        description="Streamlined submission and approval workflow for student medical certificates."
                    />
                    <FeatureCard
                        title="Lecture Scheduling"
                        description="Dynamic timetabling and room allocation to optimize campus resources."
                    />
                    <FeatureCard
                        title="Real-time Notifications"
                        description="Instant alerts for important announcements, deadlines, and status updates."
                    />
                    <FeatureCard
                        title="Secure Auth"
                        description="Role-based access control ensuring data privacy and security for all users."
                    />
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}
