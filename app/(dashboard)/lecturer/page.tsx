import { StatsCards } from "@/components/dashboard/StatsCards";
import { TaskOverviewChart } from "@/components/dashboard/TaskOverviewChart";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { LecturerTaskReminder } from "@/components/LecturerTaskReminder";

export default function LecturerDashboard() {
    return (
        <div className="space-y-6">
            <LecturerTaskReminder />
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h2>
                <p className="text-muted-foreground">Manage your courses, view statistics, and track your tasks.</p>
            </div>

            <StatsCards />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <TaskOverviewChart />
                </div>
                <div className="col-span-3">
                    <UpcomingTasks />
                </div>
            </div>
        </div>
    )
}
