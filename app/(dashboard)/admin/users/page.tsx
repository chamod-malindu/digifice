"use client"

import { useEffect, useState } from "react"
import { User, createUserColumns } from "@/components/users/columns"
import { DataTable } from "@/components/users/data-table"
import { UserDialog } from "@/components/users/user-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UsersPage() {
    const [data, setData] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("all")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteName, setDeleteName] = useState<string | null>(null)

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            const res = await fetch("/api/users")
            const users = await res.json()
            setData(users)
        } catch (error) {
            console.error("Failed to fetch users", error)
            toast.error("Failed to fetch users")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleAddKey = () => {
        setCurrentUser(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (user: User) => {
        setCurrentUser(user)
        setIsDialogOpen(true)
    }

    const confirmDelete = (user: User) => {
        setDeleteId(user._id)
        setDeleteName(user.name)
    }

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`/api/users/${deleteId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success("User deleted successfully")
                // Update local state instead of refetching
                setData(prev => prev.filter(u => u._id !== deleteId))
            } else {
                toast.error("Failed to delete user")
            }
        } catch (error) {
            console.error("Error deleting user", error);
            toast.error("An error occurred while deleting")
        } finally {
            setDeleteId(null)
        }
    }

    const handleUserSaved = (savedUser?: User) => {
        if (!savedUser) {
            fetchUsers() // Fallback if no user returned
            return
        }

        setData((prev) => {
            const exists = prev.some((u) => u._id === savedUser._id)
            if (exists) {
                // Update existing user
                return prev.map((u) => (u._id === savedUser._id ? savedUser : u))
            } else {
                // Add new user to the top
                return [savedUser, ...prev]
            }
        })
    }

    // Define columns here to pass handlers
    const columns = createUserColumns({ onEdit: handleEdit, onDelete: confirmDelete })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">Manage system users, roles, and permissions.</p>
                </div>
                <Button onClick={handleAddKey}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            {isLoading && data.length === 0 ? (
                <div className="flex justify-center p-8">Loading users...</div>
            ) : (
                <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="all">All Users</TabsTrigger>
                            <TabsTrigger value="student">Students</TabsTrigger>
                            <TabsTrigger value="lecturer">Lecturers</TabsTrigger>
                            <TabsTrigger value="admin">Admins</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
                            <DataTable columns={columns} data={data} searchKey="email" />
                        </TabsContent>
                        <TabsContent value="student">
                            <DataTable columns={columns} data={data.filter(u => u.role === 'student')} searchKey="email" />
                        </TabsContent>
                        <TabsContent value="lecturer">
                            <DataTable columns={columns} data={data.filter(u => u.role === 'lecturer')} searchKey="email" />
                        </TabsContent>
                        <TabsContent value="admin">
                            <DataTable columns={columns} data={data.filter(u => u.role === 'admin')} searchKey="email" />
                        </TabsContent>
                    </Tabs>
                </div>
            )}

            <UserDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                user={currentUser}
                onSuccess={handleUserSaved}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteName}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
