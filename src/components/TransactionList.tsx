'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { formatDateForDisplay } from '@/lib/dateParser';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction._id!);
    setEditForm({
      item: transaction.item,
      cost: transaction.cost,
      date: transaction.date
    });
  };

  const saveEdit = () => {
    if (editingId && editForm.item && editForm.cost) {
      onEdit(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return formatDateForDisplay(d);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-grey-500">
        No recent transactions
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4 text-black">Recent Transactions</h3>
      {transactions.map((transaction) => (
        <div key={transaction._id} className="bg-white p-4 rounded-lg shadow border">
          {editingId === transaction._id ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editForm.item || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, item: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Item"
              />
              <input
                type="number"
                step="0.01"
                value={editForm.cost || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                className="w-full p-2 border rounded"
                placeholder="Cost"
              />
              <div className="flex space-x-2">
                <button
                  onClick={saveEdit}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-black">{transaction.item}</div>
                <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="font-bold text-green-600">
                  {formatCurrency(transaction.cost)}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEdit(transaction)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(transaction._id!)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}