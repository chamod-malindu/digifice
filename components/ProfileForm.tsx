"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useInterval } from "@/hooks/useInterval";

import { useSession } from "next-auth/react";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export function ProfileForm({ user }: { user: { name: string; email: string } }) {
    const { update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [pendingRequest, setPendingRequest] = useState<any>(null);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name,
            password: "",
            confirmPassword: "",
        },
    });

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/profile/request');
            const data = await res.json();

            if (res.ok) {
                // If we had a pending request and now we don't (or it's status changed)
                if (pendingRequest) {
                    // Start fresh:
                    if (!data) {
                        // It was deleted or approved/rejected and cleared from pending view?
                        // Our API currently returns the pending request object.
                        // If it returns null, it means no pending request.
                        // Wait, our API logic is:
                        // const pendingRequest = await ProfileRequest.findOne({ user: session.user.id, status: 'pending' });
                        // So if it's approved, it won't be returned by the GET endpoint.

                        // We need to know if it was approved or rejected to show a toast.
                        // But strictly based on "No pending request", we can assume it was processed.
                        // However, to be more user friendly, we might want to know WHAT happened.
                        // For now, let's just clear the pending state and let them request again if they want.
                        // And maybe refresh the page to show new name if applicable.
                        if (pendingRequest) {
                            toast.info("Your profile request has been processed!");
                            await update();
                            setPendingRequest(null);
                            router.refresh(); // Refresh to potential show new name
                        }
                    } else if (data._id !== pendingRequest._id) {
                        // Different request? unlikely in this flow but possible.
                        setPendingRequest(data);
                    }
                } else if (data) {
                    setPendingRequest(data);
                }
            }
        } catch (error) {
            console.error("Polling error", error);
        }
    };

    // Poll every 5 seconds
    useInterval(checkStatus, 5000);

    useEffect(() => {
        checkStatus();
    }, []);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!values.password && values.name === user.name) {
            toast.info("No changes to save.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/profile/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    password: values.password || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Something went wrong");
                return;
            }

            toast.success("Profile update request submitted for approval.");
            setPendingRequest(data);
            form.reset({ name: values.name, password: "", confirmPassword: "" });
        } catch (error) {
            toast.error("Failed to submit request.");
        } finally {
            setIsLoading(false);
        }
    }

    if (pendingRequest) {
        return (
            <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pending Request</AlertTitle>
                <AlertDescription>
                    You have a pending profile update request submitted on {new Date(pendingRequest.createdAt).toLocaleDateString()}.
                    <br />
                    Requested Name: {pendingRequest.requestedName || "No Change"}
                    <br />
                    Requested Password: {pendingRequest.requestedPassword ? "********" : "No Change"}
                    <br />
                    Please wait for an administrator to approve these changes.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                    Update your profile information. Changes require admin approval.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password (Optional)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Leave blank to keep current"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm new password"
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Request Update
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
