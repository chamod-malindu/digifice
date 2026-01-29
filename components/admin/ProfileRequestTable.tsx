"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useInterval } from "@/hooks/useInterval";

interface Request {
    _id: string;
    user: {
        name: string;
        email: string;
        role: string;
    };
    requestedName?: string;
    requestedPassword?: string;
    createdAt: string;
}

export function ProfileRequestTable() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Poll for new requests every 5 seconds
    useInterval(() => {
        // Only poll if we are not currently processing an action to avoid race conditions/UI jumps
        if (!processingId) {
            fetchRequests(true); // create a silent mode for fetchRequests
        }
    }, 5000);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const res = await fetch("/api/admin/profile-requests");
            const data = await res.json();
            if (res.ok) {
                // Determine if there are changes to avoid unnecessary re-renders if possible, 
                // but for now simple setRequests is fine as React handles diffing.
                // We'll just replace the data.
                setRequests(data);
            } else {
                if (!silent) toast.error("Failed to load requests");
            }
        } catch (error) {
            if (!silent) toast.error("Error loading requests");
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setProcessingId(id);
        try {
            const res = await fetch(`/api/admin/profile-requests/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                toast.success(`Request ${action}ed successfully`);
                setRequests(prev => prev.filter(r => r._id !== id));
            } else {
                toast.error(`Failed to ${action} request`);
            }
        } catch (error) {
            toast.error(`Error processing request`);
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <p>No pending profile update requests.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                    Review and approve profile update requests from users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Requested Changes</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request._id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{request.user.name}</span>
                                        <span className="text-xs text-muted-foreground">{request.user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{request.user.role}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm">
                                        {request.requestedName && (
                                            <div className="flex gap-2">
                                                <span className="text-muted-foreground">Name:</span>
                                                <span className="font-medium">{request.requestedName}</span>
                                            </div>
                                        )}
                                        {request.requestedPassword && (
                                            <div className="flex gap-2">
                                                <span className="text-muted-foreground">Password:</span>
                                                <span className="font-medium">********</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAction(request._id, 'reject')}
                                            disabled={processingId === request._id}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            {processingId === request._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <X className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAction(request._id, 'approve')}
                                            disabled={processingId === request._id}
                                        >
                                            {processingId === request._id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
