"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
    role: z.enum(["admin", "lecturer", "student"]),
})

export function UserForm({ open, onOpenChange, user, onSuccess }: any) {
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "student",
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({ name: user.name, email: user.email, role: user.role, password: "" })
        } else {
            form.reset({ name: "", email: "", password: "", role: "student" })
        }
    }, [user, form])

    const onSubmit = async (values: z.infer<typeof userSchema>) => {
        setIsLoading(true)
        try {
            if (!user && !values.password) {
                form.setError("password", { message: "Password required for new users" })
                return
            }

            const url = user ? `/api/users/${user._id}` : '/api/users' // Need simple api/users for POST. Edit needs ID.
            // Assuming api/users checks method. But wait, I restored `api/users/route.ts` which has POST.
            // I did NOT restore `api/users/[id]/route.ts` yet! 
            // I need to create it for PUT/DELETE.

            const method = user ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })

            if (!res.ok) throw new Error("Failed")
            toast.success("User saved")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error("Error saving user")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="lecturer">Lecturer</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password {user && "(Leave blank to keep)"}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
