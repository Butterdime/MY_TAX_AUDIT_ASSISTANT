import React from 'react';
import { LedgerEntry } from '../../types';

interface Props {
  onExtractionComplete: (entries: LedgerEntry[]) => void;
}

export const DocumentUploader: React.FC<Props> = ({ onExtractionComplete }) => {
  const handleSimulateUpload = () => {
    // In a real app, this would involve file parsing and API calls.
    const dummyEntries: LedgerEntry[] = [
      {
        id: '1',
        transactionDate: '2023-10-26',
        description: 'Purchase of new robot arm',
        amount: 15000,
        type: 'DEBIT',
        sourceDocUrl: 'https://example.com/doc1.pdf',
        supportingDocUrl: 'https://example.com/doc1.pdf',
        category: 'Capital Expenditure',
        confidenceScore: 0.95,
        status: 'PENDING',
        auditStatus: 'PENDING',
        eInvoiceStatus: 'MISSING',
        dieFlags: [],
        metadata: {},
      },
      {
        id: '2',
        transactionDate: '2023-10-25',
        description: 'Software license for AI-powered sorting system',
        amount: 2500,
        type: 'DEBIT',
        sourceDocUrl: 'https://example.com/doc2.pdf',
        supportingDocUrl: 'https://example.com/doc2.pdf',
        category: 'Operating Expense',
        confidenceScore: 0.8,
        status: 'PENDING',
        auditStatus: 'PENDING',
        eInvoiceStatus: 'MISSING',
        dieFlags: [],
        metadata: {},
      },
    ];
    onExtractionComplete(dummyEntries);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Document Uploader</h2>
      <button onClick={handleSimulateUpload} className="bg-blue-600 px-4 py-2 rounded">
        Simulate Document Upload
      </button>
    </div>
  );
};
