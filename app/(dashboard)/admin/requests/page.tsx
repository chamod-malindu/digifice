import { ProfileRequestTable } from "@/components/admin/ProfileRequestTable";

export default function ProfileRequestsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Requests</h1>
                <p className="text-muted-foreground">Manage profile update requests from users.</p>
            </div>
            <ProfileRequestTable />
        </div>
    );
}
