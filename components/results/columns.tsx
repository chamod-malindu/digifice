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

export type Result = {
    _id: string
    studentId: { _id: string, name: string, email: string } // Populated
    moduleName: string
    moduleCode: string
    semester: string
    type: string
    marks: number
    grade: string
    createdAt: string
}

interface ResultColumnsProps {
    onEdit: (result: Result) => void;
    onDelete: (result: Result) => void;
}

export const createResultColumns = ({ onEdit, onDelete }: ResultColumnsProps): ColumnDef<Result>[] => [
    {
        accessorKey: "studentId.name",
        id: "studentName",
        header: "Student",
        cell: ({ row }) => row.original.studentId?.name || "Unknown",
    },
    {
        accessorKey: "moduleName",
        header: "Module",
    },
    {
        accessorKey: "semester",
        header: "Semester",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        accessorKey: "marks",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Marks
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("marks")}</div>,
    },
    {
        accessorKey: "grade",
        header: "Grade",
        cell: ({ row }) => {
            const grade = row.original.grade as string
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
            if (grade === 'A' || grade === 'A+') variant = "default"
            if (grade === 'F') variant = "destructive"

            return <Badge variant={variant}>{grade}</Badge>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const result = row.original

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
                        <DropdownMenuItem onClick={() => onEdit(result)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(result)} className="text-red-600 focus:text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
