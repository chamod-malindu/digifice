"use client"

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContactRequest {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function ContactRequestsPage() {
    const [requests, setRequests] = useState<ContactRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await fetch("/api/contact");
                const data = await res.json();
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch requests", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Contact Requests</h2>
                <p className="text-muted-foreground">View messages from the contact form.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Loading requests...</div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">No contact requests found</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Message</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request._id}>
                                        <TableCell className="whitespace-nowrap">
                                            {format(new Date(request.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {request.firstName} {request.lastName}
                                        </TableCell>
                                        <TableCell>{request.email}</TableCell>
                                        <TableCell className="max-w-md truncate" title={request.message}>
                                            {request.message}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
