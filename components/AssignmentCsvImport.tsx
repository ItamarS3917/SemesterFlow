import React, { useRef, useState } from 'react';
import { useAssignments } from '../hooks/useAssignments';
import Papa from 'papaparse';
import { Assignment, AssignmentStatus } from '../types';
import { Upload, FileUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const AssignmentCsvImport = () => {
    const fileInput = useRef<HTMLInputElement>(null);
    const { addAssignment } = useAssignments();
    const [importing, setImporting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setStatus({ type: 'idle', message: '' });

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const parsed = results.data as Array<{
                        courseId: string;
                        name: string;
                        dueDate?: string;
                        estimatedHours?: string;
                    }>;

                    // Simple validation
                    const valid = parsed.filter(a => a.courseId && a.name);

                    if (valid.length === 0) {
                        setStatus({ type: 'error', message: 'No valid assignments found. Check CSV headers: courseId, name, dueDate.' });
                        setImporting(false);
                        return;
                    }

                    let count = 0;
                    for (const item of valid) {
                        const assignment: Assignment = {
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            courseId: item.courseId,
                            name: item.name,
                            dueDate: item.dueDate || undefined,
                            estimatedHours: item.estimatedHours ? parseInt(item.estimatedHours) : 5,
                            status: AssignmentStatus.NOT_STARTED,
                            notes: '',
                            attachments: [],
                            createdAt: new Date().toISOString()
                        };
                        await addAssignment(assignment);
                        count++;
                    }

                    setStatus({ type: 'success', message: `Successfully imported ${count} assignments.` });
                } catch (error) {
                    console.error("Import error:", error);
                    setStatus({ type: 'error', message: 'Failed to import assignments. See console.' });
                } finally {
                    setImporting(false);
                    if (fileInput.current) fileInput.current.value = '';
                }
            },
            error: (error) => {
                console.error("CSV Parse error:", error);
                setStatus({ type: 'error', message: 'Failed to parse CSV file.' });
                setImporting(false);
            }
        });
    };

    return (
        <div className="retro-card p-4 border-dashed border-2 border-gray-600 bg-gray-900/50">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
                        <FileUp className="w-4 h-4 text-indigo-400" />
                        Bulk Import
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">
                        Upload CSV with columns: courseId, name, dueDate
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {status.message && (
                        <span className={`text-xs font-bold font-mono flex items-center gap-1 ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {status.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {status.message}
                        </span>
                    )}

                    <button
                        onClick={() => fileInput.current?.click()}
                        disabled={importing}
                        className="retro-btn px-3 py-1.5 bg-gray-800 text-white text-xs font-bold border border-black hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {importing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        {importing ? 'IMPORTING...' : 'UPLOAD CSV'}
                    </button>
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInput}
                        onChange={handleFile}
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
};
