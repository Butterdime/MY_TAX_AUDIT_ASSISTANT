import React, { useState, useEffect } from 'react';
import { RemediationTask } from '../../logic/remediation';
import { resolveAuditGap } from '../../services/ledgerService';

interface Props {
  task: RemediationTask | null;
  onClose: () => void;
}

const RemediationPanel: React.FC<Props> = ({ task, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setSelectedCategory('');
      setUploadedUrl('');
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    if (!task) return;
    setLoading(true);
    try {
      await resolveAuditGap(task.id, { 
        category: selectedCategory, 
        docUrl: uploadedUrl 
      });
      onClose(); // Close panel on success
    } catch (err) {
      console.error("Remediation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl p-8 border-l border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-slate-900">Remediate Task</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
          &times;
        </button>
      </div>

      <div>
        <p className="text-sm font-bold text-slate-900">{task.description}</p>
        <p className="text-xs text-slate-500">Debit: RM {task.debit.toLocaleString()}</p>
        <p className="text-xs text-red-600">Simulated Savings: ~ RM {task.simulatedSavings.toLocaleString()}</p>

        <div className="mt-8">
          {task.reason === 'UNCATEGORIZED' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assign Category</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                <option>Entertainment</option>
                <option>Office Supplies</option>
                <option>Travel</option>
                <option>Other</option>
              </select>
            </div>
          )}

          {task.reason === 'MISSING_DOC' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload Receipt</label>
              <input 
                type="file" 
                className="w-full p-2 border border-slate-300 rounded-md"
                onChange={(e) => setUploadedUrl(e.target.files ? e.target.files[0].name : '')}
              />
            </div>
          )}

          <button 
            className="mt-8 w-full bg-slate-900 text-white py-3 rounded-md font-bold hover:bg-red-600 disabled:bg-slate-400"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Updating Ledger...' : 'Save & Resolve'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemediationPanel;
