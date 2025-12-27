"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/results/data-table"
import { User, createUserColumns } from "@/components/users/columns"
import { UserForm } from "@/components/users/user-form"
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

// Force rebuild
export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    const fetchUsers = async () => {
        const res = await fetch('/api/users')
        const data = await res.json()
        if (Array.isArray(data)) setUsers(data)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!userToDelete) return
        try {
            const res = await fetch(`/api/users/${userToDelete._id}`, { method: 'DELETE' })
            if (res.ok) {
                toast.success("User deleted")
                fetchUsers()
            } else {
                toast.error("Failed to delete")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsDeleteDialogOpen(false)
        }
    }

    const columns = createUserColumns({ onEdit: handleEdit, onDelete: handleDeleteClick })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">Manage system users (students, lecturers, admins).</p>
                </div>
                <Button onClick={() => { setSelectedUser(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <DataTable columns={columns} data={users} filterColumn="name" filterPlaceholder="Filter users..." />

            <UserForm
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                user={selectedUser}
                onSuccess={fetchUsers}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This user will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
