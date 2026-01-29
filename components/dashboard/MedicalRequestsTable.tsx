"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { toast } from "sonner"
import { Check, X, FileText, MessageSquare } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function MedicalRequestsTable() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Action Dialog State
    const [actionOpen, setActionOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'approved_by_dept' | 'rejected' | null>(null);
    const [comment, setComment] = useState("");

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/lecturer/medical');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRequests(data);
            }
        } catch (error) {
            toast.error("Failed to load medical requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const openActionDialog = (id: string, type: 'approved_by_dept' | 'rejected') => {
        setSelectedRequest(id);
        setActionType(type);
        setComment("");
        setActionOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedRequest || !actionType) return;

        try {
            const res = await fetch('/api/lecturer/medical', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedRequest,
                    status: actionType,
                    adminComments: comment
                })
            });

            if (res.ok) {
                toast.success(`Request ${actionType === 'approved_by_dept' ? 'approved' : 'rejected'}`);
                fetchRequests(); // Refresh list
                setActionOpen(false);
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const filteredRequests = requests.filter(request =>
        request.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div>Loading requests...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center">
                <input
                    type="text"
                    placeholder="Search by student or reason..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border rounded-md">
                    {searchQuery ? "No matching requests found." : "No pending medical requests found."}
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map((request) => (
                                <TableRow key={request._id}>
                                    <TableCell className="font-medium">
                                        <div>{request.student?.name || "Unknown"}</div>
                                        <div className="text-xs text-muted-foreground">{request.student?.email}</div>
                                    </TableCell>
                                    <TableCell>{request.reason}</TableCell>
                                    <TableCell>
                                        {Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                            Needs Review
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View details (Todo)">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => openActionDialog(request._id, 'approved_by_dept')}
                                                title="Approve"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => openActionDialog(request._id, 'rejected')}
                                                title="Reject"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={actionOpen} onOpenChange={setActionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approved_by_dept' ? 'Approve Request' : 'Reject Request'}
                        </DialogTitle>
                        <DialogDescription>
                            Add a message to the student regarding this decision. This will be sent as a notification.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Enter your message here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionOpen(false)}>Cancel</Button>
                        <Button
                            variant={actionType === 'approved_by_dept' ? 'default' : 'destructive'}
                            onClick={handleConfirmAction}
                        >
                            Confirm {actionType === 'approved_by_dept' ? 'Approval' : 'Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
