"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { CheckCircle2, Send, XCircle, FileText, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ForwardDialog } from "@/components/dashboard/ForwardDialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Medical {
    _id: string;
    student: {
        image: string;
        name: string;
        email: string;
        department?: {
            _id: string;
            name: string;
            faculty: {
                _id: string;
                name: string;
            }
        }
    };
    status: string;
    reason: string;
    startDate: string;
    endDate: string;
    officerComments?: string;
    adminComments?: string;
    createdAt?: string;
}

export default function MedicalPage() {
    const [medicals, setMedicals] = useState<Medical[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [comments, setComments] = useState("")
    const [selectedMedical, setSelectedMedical] = useState<Medical | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)

    // New state for Forward Dialog
    const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false)
    const [forwardingRequest, setForwardingRequest] = useState<Medical | null>(null)

    const fetchMedicals = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/medical')
            if (res.ok) {
                const data = await res.json()
                // Sort by date desc
                setMedicals(data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()))
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load medical records")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMedicals()
    }, [])

    const handleAction = async () => {
        if (!selectedMedical || !actionType) return

        let newStatus = selectedMedical.status
        let updateBody: any = {}

        if (actionType === 'approve') {
            newStatus = 'approved_by_officer'
            updateBody = { status: newStatus, officerComments: comments }
        } else if (actionType === 'reject') {
            newStatus = 'rejected'
            updateBody = { status: newStatus, officerComments: comments }
        }

        try {
            const res = await fetch(`/api/medical/${selectedMedical._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateBody)
            })

            if (res.ok) {
                toast.success(`Medical request ${actionType}ed successfully`)
                setIsDialogOpen(false)
                setComments("")
                fetchMedicals()
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        }
    }

    const openDialog = (medical: Medical, type: 'approve' | 'reject') => {
        setSelectedMedical(medical)
        setActionType(type)
        setComments("")
        setIsDialogOpen(true)
    }

    const openForwardDialog = (medical: Medical) => {
        setForwardingRequest(medical)
        setIsForwardDialogOpen(true)
    }

    const MedicalCard = ({ item }: { item: Medical }) => (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={item.student.image} />
                            <AvatarFallback>{item.student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base">{item.student.name}</CardTitle>
                            <CardDescription>{item.student.email}</CardDescription>
                            {item.student.department && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {item.student.department.name}
                                </p>
                            )}
                        </div>
                    </div>
                    <Badge variant={
                        item.status === 'pending' ? 'outline' :
                            item.status === 'rejected' ? 'destructive' :
                                item.status === 'approved_by_officer' ? 'default' : 'secondary'
                    }>
                        {item.status === 'approved_by_officer' ? "Officer Approved" :
                            item.status === 'forwarded_to_dept' ? "Forwarded to Dept" :
                                item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Reason</span>
                        <span className="font-medium">{item.reason}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block text-xs uppercase tracking-wider">Duration</span>
                        <p className="text-sm">
                            <span className="font-semibold">Dates:</span> {format(new Date(item.startDate), "PPP")} - {format(new Date(item.endDate), "PPP")}
                        </p>
                        {/* Assuming medicalCertificateUrl logic here if needed */}
                    </div>
                </div>
                {item.officerComments && (
                    <div className="mt-4 bg-muted/50 p-3 rounded-md text-sm">
                        <span className="font-semibold text-xs text-muted-foreground uppercase">Medical Officer Comments</span>
                        <p className="mt-1">{item.officerComments}</p>
                    </div>
                )}
                {item.adminComments && (
                    <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md text-sm">
                        <span className="font-semibold text-xs text-blue-600 dark:text-blue-400 uppercase">Admin Note</span>
                        <p className="mt-1">{item.adminComments}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="justify-end gap-2 pt-0">
                {item.status === 'pending' && (
                    <>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => openDialog(item, 'reject')}>
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        <Button size="sm" onClick={() => openDialog(item, 'approve')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Approve (MO)
                        </Button>
                    </>
                )}
                {item.status === 'approved_by_officer' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => openForwardDialog(item)}>
                        <Send className="mr-2 h-4 w-4" /> Forward to Lecturer
                    </Button>
                )}
                {item.status === 'forwarded_to_dept' && (
                    <span className="text-xs text-muted-foreground flex items-center">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Transferred to Academic Staff
                    </span>
                )}
            </CardFooter>
        </Card>
    )

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Medical Review</h2>
                <p className="text-muted-foreground">Manage student medical submissions: Medical Officer Approval &rarr; Admin Transfer.</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">Pending Review</TabsTrigger>
                    <TabsTrigger value="ready">Ready for Transfer</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    {isLoading ? <div>Loading...</div> :
                        medicals.filter(m => m.status === 'pending').length === 0 ?
                            <div className="text-center py-10 text-muted-foreground">No pending medicals</div> :
                            medicals.filter(m => m.status === 'pending').map(m => <MedicalCard key={m._id} item={m} />)
                    }
                </TabsContent>

                <TabsContent value="ready" className="mt-6">
                    {isLoading ? <div>Loading...</div> :
                        medicals.filter(m => m.status === 'approved_by_officer').length === 0 ?
                            <div className="text-center py-10 text-muted-foreground">No approved medicals waiting for transfer</div> :
                            medicals.filter(m => m.status === 'approved_by_officer').map(m => <MedicalCard key={m._id} item={m} />)
                    }
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    {isLoading ? <div>Loading...</div> :
                        medicals.filter(m => ['forwarded_to_dept', 'rejected', 'approved_by_dept'].includes(m.status)).length === 0 ?
                            <div className="text-center py-10 text-muted-foreground">No history</div> :
                            medicals.filter(m => ['forwarded_to_dept', 'rejected', 'approved_by_dept'].includes(m.status)).map(m => <MedicalCard key={m._id} item={m} />)
                    }
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Approve Medical Request' : 'Reject Medical Request'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'approve' ? 'Add comments as the Medical Officer (optional).' : 'Reason for rejection (required).'}
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Type your comments here..."
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAction} variant={actionType === 'reject' ? 'destructive' : 'default'}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ForwardDialog
                open={isForwardDialogOpen}
                onOpenChange={setIsForwardDialogOpen}
                requestId={forwardingRequest?._id || ""}
                studentDepartmentId={forwardingRequest?.student.department?._id}
                onSuccess={fetchMedicals}
            />
        </div>
    )
}
