"use client"

import { useState, useRef } from "react"
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as XLSX from 'xlsx';

interface BulkUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    context?: {
        facultyId?: string;
        departmentId?: string;
        degreeId?: string;
    };
}

export function BulkUploadDialog({
    open,
    onOpenChange,
    onSuccess,
    context
}: BulkUploadDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [fileName, setFileName] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{
        success: number;
        failed: number;
        errors: string[];
    } | null>(null);

    const downloadTemplate = () => {
        const params = new URLSearchParams();
        if (context?.facultyId) params.append('faculty', context.facultyId);
        if (context?.departmentId) params.append('department', context.departmentId);
        if (context?.degreeId) params.append('degree', context.degreeId);

        window.open(`/api/admin/students/template?${params.toString()}`, '_blank');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setUploadResult(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            setParsedData(data);
        };
        reader.readAsBinaryString(file);
    };

    const handleUpload = async () => {
        if (parsedData.length === 0) return;

        setUploading(true);
        try {
            const res = await fetch('/api/admin/students/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: parsedData })
            });
            const result = await res.json();

            setUploadResult({
                success: result.success,
                failed: result.failed,
                errors: result.errors || []
            });

            if (result.success > 0) {
                toast.success(`Successfully uploaded ${result.success} students.`);
                onSuccess(); // Refresh parent list
            }
            if (result.failed > 0) {
                toast.warning(`${result.failed} records failed.`);
            }

        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload process failed.");
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setParsedData([]);
        setFileName("");
        setUploadResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) reset();
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Bulk Student Upload</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file to add multiple students at once.
                    </DialogDescription>
                </DialogHeader>

                {!uploadResult ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-dashed">
                            <div>
                                <h4 className="font-medium text-sm">Step 1: Get Template</h4>
                                <p className="text-xs text-muted-foreground">Download formatted template file.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </div>

                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-dashed">
                            <div>
                                <h4 className="font-medium text-sm">Step 2: Upload File</h4>
                                <p className="text-xs text-muted-foreground">
                                    {fileName ? fileName : "Select filled template file."}
                                </p>
                            </div>
                            <div>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <Button
                                    variant={fileName ? "secondary" : "default"}
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    {fileName ? "Change File" : "Select File"}
                                </Button>
                            </div>
                        </div>

                        {parsedData.length > 0 && (
                            <div className="border rounded-md">
                                <div className="bg-muted px-3 py-2 text-xs font-medium border-b flex justify-between">
                                    <span>Preview ({parsedData.length} records)</span>
                                </div>
                                <ScrollArea className="h-[200px]">
                                    <div className="p-2 space-y-1">
                                        {parsedData.slice(0, 10).map((row, i) => (
                                            <div key={i} className="text-xs grid grid-cols-3 gap-2 p-1 hover:bg-muted/50 rounded">
                                                <span className="truncate font-medium">{row.Name || 'N/A'}</span>
                                                <span className="truncate text-muted-foreground">{row.Email || 'N/A'}</span>
                                                <span className="truncate text-muted-foreground">{row.Department || 'N/A'}</span>
                                            </div>
                                        ))}
                                        {parsedData.length > 10 && (
                                            <div className="text-center text-xs text-muted-foreground p-2">
                                                ...and {parsedData.length - 10} more
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="flex gap-4">
                            <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                                <span className="text-2xl font-bold text-green-700">{uploadResult.success}</span>
                                <span className="text-xs text-green-600 uppercase tracking-wider font-semibold">Success</span>
                            </div>
                            <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                <XCircle className="h-8 w-8 text-red-600 mb-2" />
                                <span className="text-2xl font-bold text-red-700">{uploadResult.failed}</span>
                                <span className="text-xs text-red-600 uppercase tracking-wider font-semibold">Failed</span>
                            </div>
                        </div>

                        {uploadResult.errors.length > 0 && (
                            <div className="border rounded-md border-red-200 bg-red-50/50">
                                <div className="px-3 py-2 border-b border-red-100 text-red-800 text-xs font-medium">
                                    Error Log
                                </div>
                                <ScrollArea className="h-[150px]">
                                    <div className="p-2 space-y-1">
                                        {uploadResult.errors.map((err, i) => (
                                            <div key={i} className="text-xs text-red-600 flex gap-2">
                                                <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                                                <span>{err}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {!uploadResult ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleUpload} disabled={parsedData.length === 0 || uploading}>
                                {uploading ? "Uploading..." : "Start Upload"}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => onOpenChange(false)}>Close</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
