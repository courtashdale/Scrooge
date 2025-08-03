'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import VoiceRecorder from '@/components/VoiceRecorder';
import TransactionList from '@/components/TransactionList';
import { useTransactions } from '@/hooks/useTransactions';

export default function Home() {
  const [todaysTotal, setTodaysTotal] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loading } = useTransactions();

  // Calculate today's total
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const todaysTransactions = transactions.filter(t => 
      new Date(t.date).toDateString() === todayStr
    );
    
    const total = todaysTransactions.reduce((sum, t) => sum + t.cost, 0);
    setTodaysTotal(total);
  }, [transactions]);

  // Parse transcription and add transaction
  const handleTranscription = async (text: string) => {
    setTranscription(text);
    
    // Basic parsing - look for cost patterns and extract item
    const costMatch = text.match(/\$?(\d+(?:\.\d{2})?)/);
    const cost = costMatch ? parseFloat(costMatch[1]) : 0;
    
    if (cost > 0) {
      // Extract item by removing cost-related words
      let item = text.replace(/\$?(\d+(?:\.\d{2})?)/, '').trim();
      item = item.replace(/\b(dollars?|bucks?|spent|cost|paid|for)\b/gi, '').trim();
      item = item || 'Unknown item';
      
      try {
        await addTransaction(item, cost);
        setTranscription('');
      } catch (error) {
        console.error('Failed to add transaction:', error);
      }
    } else {
      // If no cost found, show the transcription for manual entry
      alert(`I heard: "${text}"\nPlease try again with a clearer amount.`);
      setTranscription('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Scrooge</h1>
          <p className="text-gray-600">Voice-Activated Expense Tracker</p>
        </div>

        {/* Today's Total */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Today's Expenses</h2>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(todaysTotal)}
          </div>
        </div>

        {/* Voice Recorder */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <VoiceRecorder onTranscription={handleTranscription} />
          
          {transcription && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Heard:</strong> {transcription}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showTransactions ? 'Hide' : 'Show'} Recent
          </button>
          <Link 
            href="/dashboard"
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-center"
          >
            Dashboard
          </Link>
        </div>

        {/* Recent Transactions */}
        {showTransactions && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : (
              <TransactionList
                transactions={transactions}
                onEdit={updateTransaction}
                onDelete={deleteTransaction}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
