import { ProfileForm } from "@/components/ProfileForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">Manage your account settings.</p>
            </div>
            <div className="max-w-2xl">
                <ProfileForm user={{ name: session.user.name || "", email: session.user.email || "" }} />
            </div>
        </div>
    );
}
