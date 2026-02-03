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
import { Eye, EyeOff } from "lucide-react"
import { User } from "./columns" // Import User type

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "lecturer", "student"]),
    adminType: z.enum(["super_admin", "medical_officer", "exam_admin"]).optional(),
    academicYear: z.number().optional(),
    semester: z.number().optional(),
    password: z.string().optional(),
})
    .refine((data) => {
        return true;
    });

interface UserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    onSuccess: (savedUser?: User) => void
    defaultRole?: "admin" | "lecturer" | "student"
}

export function UserDialog({ open, onOpenChange, user, onSuccess, defaultRole }: UserDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            role: defaultRole || "student",
            adminType: undefined,
            academicYear: 1,
            semester: 1,
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
                academicYear: user.academicYear || 1,
                semester: user.semester || 1,
                password: "", // Password always empty on edit
            })
        } else {
            form.reset({
                name: "",
                email: "",
                role: defaultRole || "student",
                adminType: undefined,
                academicYear: 1,
                semester: 1,
                password: "",
            })
        }
    }, [user, form, open, defaultRole])

    const onSubmit = async (values: z.infer<typeof userSchema>) => {
        // ... (onSubmit logic unchanged)
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

            const savedUser = await res.json();

            toast.success(user ? "User updated" : "User created");
            onSuccess(savedUser);
            onOpenChange(false);
        } catch (error: any) {
            // ...
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
                                        <Input placeholder="Amal Perera" {...field} />
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
                                        <Input placeholder="amal@gmail.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {!defaultRole && (
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
                        )}

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

                        {form.watch("role") === "student" && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="academicYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Academic Year</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(parseInt(val))}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Year" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">Year 1</SelectItem>
                                                    <SelectItem value="2">Year 2</SelectItem>
                                                    <SelectItem value="3">Year 3</SelectItem>
                                                    <SelectItem value="4">Year 4</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="semester"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Semester</FormLabel>
                                            <Select
                                                onValueChange={(val) => field.onChange(parseInt(val))}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Semester" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">Semester 1</SelectItem>
                                                    <SelectItem value="2">Semester 2</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{user ? "New Password (Optional)" : "Password"}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder={user ? "Leave blank to keep current" : "Secure password"}
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">
                                                    {showPassword ? "Hide password" : "Show password"}
                                                </span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading} className="hover:cursor-pointer">
                                {isLoading ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
