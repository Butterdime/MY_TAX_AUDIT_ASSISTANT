import { UILedgerEntry } from '../types/viewModels';

export const exportToCSV = (transactions: UILedgerEntry[], fileName: string = 'forensic_ledger_export') => {
  // Define 8 headers to match the new Debit/Credit structure
  const headers = ['Date', 'Description', 'Debit', 'Credit', 'Status', 'Category', 'Flags'];

  const rows = transactions.map(t => [
    t.date || 'N/A', 
    // Clean regex to escape double quotes without extra corrupted characters
    `"${(t.description || '').replace(/"/g, '""')}"`, 
    (t.debit || 0).toString(),
    (t.credit || 0).toString(),
    t.status || 'New',
    t.category || 'Uncategorized',
    t.flags.join(';')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
