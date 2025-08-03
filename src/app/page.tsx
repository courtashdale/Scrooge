'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import VoiceRecorder from '@/components/VoiceRecorder';
import TextInput from '@/components/TextInput';
import TransactionList from '@/components/TransactionList';
import { useTransactions } from '@/hooks/useTransactions';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { parseExpenseOffline } from '@/lib/offlineParser';



export default function Home() {
  const [todaysTotal, setTodaysTotal] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [mounted, setMounted] = useState(false);
  const isOnline = useNetworkStatus();
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loading } = useTransactions();

  // Calculate today's total
  useEffect(() => {
    if (mounted) {
      const today = new Date();
      const todayStr = today.toDateString();
      
      const todaysTransactions = transactions.filter(t => 
        new Date(t.date).toDateString() === todayStr
      );
      
      const total = todaysTransactions.reduce((sum, t) => sum + t.cost, 0);
      setTodaysTotal(total);
    }
  }, [transactions, mounted]);

  // Set mounted after component mounts to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse text and add transaction (works for both voice and text input)
  const handleTextInput = async (text: string) => {
    if (inputMode === 'voice') {
      setTranscription(text);
    }
    
    let amount: number;
    let item: string;
    let transactionDate: Date = new Date();
    let useOfflineFlow = false;
    
    try {
      if (isOnline) {
        // Try AI parsing first when online
        const parseResponse = await axios.post('/api/parse-expense', { text });
        const data = parseResponse.data;
        console.log('AI Parse response:', data);
        amount = data.amount;
        item = data.item;
        if (data.date) {
          transactionDate = new Date(data.date);
          console.log('Parsed date:', transactionDate);
        }
      } else {
        useOfflineFlow = true;
        throw new Error('Offline mode');
      }
    } catch {
      // Fallback to offline parsing
      console.log(isOnline ? 'AI parsing failed, using offline fallback' : 'Offline mode: using local parsing');
      
      const parsed = parseExpenseOffline(text);
      if (!parsed) {
        // Show appropriate error message
        if (inputMode === 'voice') {
          alert(`I heard: "${text}"\nCouldn't extract amount and item. Please try again.`);
          setTranscription('');
        } else {
          alert('Please include an amount and item description (e.g., "$12.50 for coffee")');
        }
        return;
      }
      
      amount = parsed.amount;
      item = parsed.item;
      transactionDate = parsed.date;
      useOfflineFlow = true;
    }
    
    try {
      if (amount > 0 && item) {
        console.log('Adding transaction with date:', transactionDate);
        await addTransaction(item, amount, transactionDate, useOfflineFlow);
        if (inputMode === 'voice') {
          setTranscription('');
        }
      } else {
        throw new Error('Invalid amount or item');
      }
    } catch (error) {
      console.error('Failed to add transaction:', error);
      alert('Failed to save transaction. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎩 Scrooge</h1>
          <p className="text-gray-600">Voice & Text Expense Tracker</p>
          {mounted && !isOnline && (
            <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full inline-block">
              🌚 Offline Mode - Data will sync when you&rsquo;re back online
            </div>
          )}
        </div>

        

        {/* Today's Total */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Today&rsquo;s Expenses</h2>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(todaysTotal)}
          </div>
        </div>


        {/* Input Mode Toggle */}
        <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
          <button
            onClick={() => setInputMode('voice')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'voice'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎤 Voice
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'text'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⌨️ Text
          </button>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {inputMode === 'voice' ? (
            <>
              <VoiceRecorder onTranscription={handleTextInput} />
              {transcription && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Heard:</strong> {transcription}
                  </p>
                </div>
              )}
            </>
          ) : (
            <TextInput onSubmit={handleTextInput} disabled={loading} />
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

        {/* Latest Transactions */}
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
