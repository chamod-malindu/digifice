"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, AlertCircle, CheckCircle2, FileSpreadsheet, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import * as XLSX from 'xlsx';

interface BulkUploadProps {
    onSuccess: () => void;
}

export function BulkUpload({ onSuccess }: BulkUploadProps) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string, details?: string[] } | null>(null)

    // Module Details State
    const [moduleDetails, setModuleDetails] = useState({
        moduleName: "",
        moduleCode: "",
        semester: "Sem 1",
        type: "Exam"
    })

    // Basic Validation
    const isValid = file && moduleDetails.moduleName && moduleDetails.moduleCode;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus(null);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                "email": "student@example.com",
                "marks": 85,
                "grade": "A"
            },
            {
                "email": "another@example.com",
                "marks": 65,
                "grade": "B"
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "module_result_template.xlsx");
    };

    const handleUpload = async () => {
        if (!isValid) {
            setStatus({ type: 'error', message: "Please fill all module details and select a file." });
            return;
        }

        setUploading(true);
        setStatus(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                if (jsonData.length === 0) {
                    throw new Error("File appears to be empty.");
                }

                // Merge Global Module Details into each row
                const processedData = jsonData.map((row: any) => ({
                    ...row,
                    moduleName: moduleDetails.moduleName,
                    moduleCode: moduleDetails.moduleCode,
                    semester: moduleDetails.semester,
                    type: moduleDetails.type,
                    // Ensure marks are numbers
                    marks: Number(row.marks),
                    // Auto-calc grade if missing (simple logic)
                    grade: row.grade || (row.marks >= 50 ? 'P' : 'F')
                }));

                // Post to API
                const res = await fetch('/api/results/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(processedData),
                });

                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.error || "Upload failed");
                }

                setStatus({
                    type: 'success',
                    message: result.message
                });

                if (result.errors) {
                    setStatus({
                        type: 'error',
                        message: result.message + " Some entries failed.",
                        details: result.errors
                    });
                }

                if (!result.errors || result.errors.length === 0) {
                    setFile(null);
                    // Reset form optionally, or keep for next batch
                    setTimeout(() => {
                        onSuccess();
                        setOpen(false);
                        setStatus(null);
                    }, 1500);
                } else {
                    onSuccess();
                }

            } catch (error: any) {
                console.error("Parse error:", error);
                setStatus({ type: 'error', message: error.message || "Failed to process file." });
            } finally {
                setUploading(false);
            }
        };

        reader.onerror = () => {
            setStatus({ type: 'error', message: "Failed to read file." });
            setUploading(false);
        };

        reader.readAsBinaryString(file as Blob);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Upload (Module-wise)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Upload Module Results</DialogTitle>
                    <DialogDescription>
                        Enter module details once, then upload a student list.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    {/* Module Details Form */}
                    <div className="grid grid-cols-2 gap-4 border-b pb-4">
                        <div className="space-y-2">
                            <Label>Module Name</Label>
                            <Input
                                placeholder="e.g. Web Development"
                                value={moduleDetails.moduleName}
                                onChange={(e) => setModuleDetails({ ...moduleDetails, moduleName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Module Code</Label>
                            <Input
                                placeholder="e.g. CS2020"
                                value={moduleDetails.moduleCode}
                                onChange={(e) => setModuleDetails({ ...moduleDetails, moduleCode: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select
                                value={moduleDetails.semester}
                                onValueChange={(val) => setModuleDetails({ ...moduleDetails, semester: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'].map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={moduleDetails.type}
                                onValueChange={(val) => setModuleDetails({ ...moduleDetails, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Exam', 'Assignment', 'Project', 'Quiz'].map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-end gap-2">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="file">Student Result File</Label>
                                <Input id="file" type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                                <p className="text-xs text-muted-foreground">Columns: <strong>email, marks, grade</strong> (optional)</p>
                            </div>
                            <Button variant="secondary" size="icon" title="Download Template" onClick={downloadTemplate}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>

                        {file && (
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm text-muted-foreground">
                                <FileSpreadsheet className="h-4 w-4" />
                                <span className="truncate">{file.name}</span>
                            </div>
                        )}
                    </div>

                    {status && (
                        <Alert variant={status.type === 'error' ? "destructive" : "default"} className={status.type === 'success' ? "border-green-500 text-green-600" : ""}>
                            {status.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            <AlertTitle>{status.type === 'error' ? "Error" : "Success"}</AlertTitle>
                            <AlertDescription>
                                {status.message}
                                {status.details && (
                                    <ul className="mt-2 list-disc pl-4 text-xs max-h-32 overflow-y-auto">
                                        {status.details.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleUpload} disabled={uploading || !isValid}>
                        {uploading ? "Processing..." : "Upload & Process"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
