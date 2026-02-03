import { LandingNavbar } from "@/components/landing-navbar";
import { LandingFooter } from "@/components/landing-footer";

export default function NewsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <LandingNavbar />
            <main className="flex-1 container mx-auto px-4 pt-32 pb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">University News</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mb-12">
                    Stay updated with the latest announcements, events, and academic notices.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <NewsCard
                        date="October 24, 2025"
                        title="Fall Semester Registration Open"
                        excerpt="Registration for the upcoming Fall semester begins next week. Ensure your profile is updated."
                        category="Academic"
                    />
                    <NewsCard
                        date="October 15, 2025"
                        title="New Library Wing Opening"
                        excerpt="Join us for the inauguration of the new state-of-the-art library wing this Friday."
                        category="Campus"
                    />
                    <NewsCard
                        date="October 01, 2025"
                        title="Campus Safety Protocols Update"
                        excerpt="Please review the updated safety guidelines effective immediately for all students and staff."
                        category="Announcement"
                    />
                    <NewsCard
                        date="September 20, 2025"
                        title="Student Research Symposium"
                        excerpt="Call for papers is now open for the annual student research symposium."
                        category="Events"
                    />
                    <NewsCard
                        date="September 10, 2025"
                        title="System Maintenance"
                        excerpt="Digifice will undergo scheduled maintenance this Sunday from 2 AM to 4 AM."
                        category="Tech"
                    />
                    <NewsCard
                        date="September 01, 2025"
                        title="Welcome Freshmen"
                        excerpt="A warm welcome to the incoming batch of 2025. Orientation details inside."
                        category="Community"
                    />
                </div>
            </main>
            <LandingFooter />
        </div>
    );
}

function NewsCard({ date, title, excerpt, category }: { date: string; title: string; excerpt: string; category: string }) {
    return (
        <div className="flex flex-col p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {category}
                </span>
                <span className="text-xs text-muted-foreground">{date}</span>
            </div>
            <h2 className="text-xl font-semibold mb-3 tracking-tight group-hover:text-primary transition-colors">{title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{excerpt}</p>
            <button className="text-primary text-sm font-medium hover:underline self-start mt-auto">Read full story &rarr;</button>
        </div>
    )
}
