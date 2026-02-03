"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type User = {
    _id: string
    name: string
    email: string
    role: "admin" | "lecturer" | "student"
    adminType?: "super_admin" | "medical_officer" | "exam_admin"
    image?: string
    createdAt: string
}

interface UserColumnsProps {
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export const createUserColumns = ({ onEdit, onDelete }: UserColumnsProps): ColumnDef<User>[] => [
    {
        accessorKey: "image",
        header: "",
        cell: ({ row }) => {
            const user = row.original
            return (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
            )
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const user = row.original
            const role = user.role
            const variant = role === 'admin' ? 'destructive' : role === 'lecturer' ? 'default' : 'secondary'

            return (
                <div className="flex flex-col gap-1 items-start">
                    <Badge variant={variant} className="capitalize">{role}</Badge>
                    {user.adminType && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {user.adminType.replace('_', ' ')}
                        </span>
                    )}
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600 focus:text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
