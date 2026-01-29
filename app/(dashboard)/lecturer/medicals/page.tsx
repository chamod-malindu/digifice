import { MedicalRequestsTable } from "@/components/dashboard/MedicalRequestsTable";

export default function LecturerMedicalsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Medical Requests</h2>
                <p className="text-muted-foreground">Review and approve medical requests forwarded by the department.</p>
            </div>

            <MedicalRequestsTable />
        </div>
    )
}
