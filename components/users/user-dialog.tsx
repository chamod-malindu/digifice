"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { User } from "./columns" // Import User type

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "lecturer", "student"]),
    adminType: z.enum(["super_admin", "medical_officer", "exam_admin"]).optional(),
    password: z.string().optional(),
})
    .refine((data) => {
        return true;
    });

interface UserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    onSuccess: () => void
}

export function UserDialog({ open, onOpenChange, user, onSuccess }: UserDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "student",
            adminType: undefined,
            password: "",
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                role: user.role,
                adminType: user.adminType,
                password: "", // Password always empty on edit
            })
        } else {
            form.reset({
                name: "",
                email: "",
                role: "student",
                adminType: undefined,
                password: "",
            })
        }
    }, [user, form, open])

    const onSubmit = async (values: z.infer<typeof userSchema>) => {
        setIsLoading(true);
        try {
            // Validation for new user password
            if (!user && !values.password) {
                form.setError("password", { message: "Password is required for new users" });
                setIsLoading(false);
                return;
            }

            const url = user ? `/api/users/${user._id}` : '/api/users';
            const method = user ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Something went wrong');
            }

            toast.success(user ? "User updated" : "User created");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
                    <DialogDescription>
                        {user ? "Update user details." : "Create a new user account."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="lecturer">Lecturer</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch("role") === "admin" && (
                            <FormField
                                control={form.control}
                                name="adminType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Admin Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                                <SelectItem value="medical_officer">Medical Officer</SelectItem>
                                                <SelectItem value="exam_admin">Examination Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{user ? "New Password (Optional)" : "Password"}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={user ? "Leave blank to keep current" : "Secure password"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
