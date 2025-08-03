'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Transaction } from '@/types/transaction';
import ExpenseCharts from '@/components/ExpenseCharts';
import FilterControls from '@/components/FilterControls';

type DateFilter = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'all';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [mounted, setMounted] = useState(false);

  const getDateRange = (filter: DateFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday,
          end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
      case 'this_week':
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        return {
          start: thisWeekStart,
          end: now
        };
      case 'last_week':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        return {
          start: lastWeekStart,
          end: lastWeekEnd
        };
      default:
        return null;
    }
  };

  const fetchTransactions = async (filter: DateFilter) => {
    try {
      setLoading(true);
      const dateRange = getDateRange(filter);
      
      let url = '/api/transactions';
      const params = new URLSearchParams();
      
      if (dateRange) {
        params.append('date_start', dateRange.start.toISOString());
        params.append('date_end', dateRange.end.toISOString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTransactions(dateFilter);
  }, [dateFilter]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">Loading...</p>
            </div>
            <Link 
              href="/"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Tracker
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getTotalAmount = () => {
    return transactions.reduce((sum, t) => sum + t.cost, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Total: {formatCurrency(getTotalAmount())} 
              ({transactions.length} transactions)
            </p>
          </div>
          <Link 
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Tracker
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <FilterControls
            currentFilter={dateFilter}
            onFilterChange={setDateFilter}
          />
        </div>

        {/* Charts */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-gray-500">Loading charts...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-gray-500">No transactions found for the selected period</div>
          </div>
        ) : (
          <ExpenseCharts transactions={transactions} />
        )}
      </div>
    </div>
  );
}