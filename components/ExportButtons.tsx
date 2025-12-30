import React from 'react';
import { OptimizedResult } from '../types';
import { exportToPDF, exportToDOCX, exportToJSON } from '../utils/exportUtils';
import { DownloadIcon } from './Icons';

interface ExportButtonsProps {
    result: OptimizedResult;
    projectName: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ result, projectName }) => {
    const [exporting, setExporting] = React.useState<string | null>(null);

    const handleExport = async (format: 'pdf' | 'docx' | 'json') => {
        setExporting(format);
        try {
            if (format === 'pdf') {
                exportToPDF(result, projectName);
            } else if (format === 'docx') {
                await exportToDOCX(result, projectName);
            } else if (format === 'json') {
                exportToJSON(result, projectName);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        } finally {
            setExporting(null);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleExport('pdf')}
                disabled={exporting === 'pdf'}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to PDF"
            >
                <DownloadIcon className="w-4 h-4" />
                {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
            </button>

            <button
                onClick={() => handleExport('docx')}
                disabled={exporting === 'docx'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to DOCX"
            >
                <DownloadIcon className="w-4 h-4" />
                {exporting === 'docx' ? 'Exporting...' : 'DOCX'}
            </button>

            <button
                onClick={() => handleExport('json')}
                disabled={exporting === 'json'}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to JSON"
            >
                <DownloadIcon className="w-4 h-4" />
                {exporting === 'json' ? 'Exporting...' : 'JSON'}
            </button>
        </div>
    );
};
