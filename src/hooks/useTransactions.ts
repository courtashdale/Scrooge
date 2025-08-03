'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Transaction } from '@/types/transaction';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch recent transactions (cached locally)
  const fetchRecentTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions');
      const recent = response.data.slice(0, 10); // Keep only 10 most recent
      setTransactions(recent);
      localStorage.setItem('recentTransactions', JSON.stringify(recent));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback to localStorage
      const cached = localStorage.getItem('recentTransactions');
      if (cached) {
        setTransactions(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new transaction
  const addTransaction = async (item: string, cost: number, date: Date = new Date()) => {
    try {
      setLoading(true);
      
      // First categorize the item
      const categoryResponse = await axios.post('/api/categorize', { item });
      const categories = categoryResponse.data;
      
      // Create transaction with categories
      const transactionData = {
        item,
        cost,
        date,
        ...categories
      };
      
      const response = await axios.post('/api/transactions', transactionData);
      
      // Update local state
      const newTransaction = response.data;
      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]); // Keep 10 most recent
      
      // Update localStorage
      const updated = [newTransaction, ...transactions.slice(0, 9)];
      localStorage.setItem('recentTransactions', JSON.stringify(updated));
      
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      setLoading(true);
      await axios.put(`/api/transactions/${id}`, updates);
      
      // Update local state
      setTransactions(prev => 
        prev.map(t => t._id === id ? { ...t, ...updates } : t)
      );
      
      // Update localStorage
      const updated = transactions.map(t => t._id === id ? { ...t, ...updates } : t);
      localStorage.setItem('recentTransactions', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/transactions/${id}`);
      
      // Update local state
      setTransactions(prev => prev.filter(t => t._id !== id));
      
      // Update localStorage
      const updated = transactions.filter(t => t._id !== id);
      localStorage.setItem('recentTransactions', JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load cached transactions on mount
  useEffect(() => {
    const cached = localStorage.getItem('recentTransactions');
    if (cached) {
      setTransactions(JSON.parse(cached));
    }
    fetchRecentTransactions();
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchRecentTransactions
  };
}