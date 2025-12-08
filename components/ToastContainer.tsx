
import React from 'react';
import { useToast, ToastType } from '../contexts/ToastContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'error': return <AlertCircle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getColors = (type: ToastType) => {
        switch (type) {
            case 'success': return 'bg-green-500 border-green-700 text-white';
            case 'error': return 'bg-red-500 border-red-700 text-white';
            default: return 'bg-indigo-500 border-indigo-700 text-white';
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black min-w-[300px] animate-slide-in-right ${getColors(toast.type)}`}
                >
                    {getIcon(toast.type)}
                    <p className="flex-1 font-bold font-mono text-sm">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="p-1 hover:bg-black/20 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};
