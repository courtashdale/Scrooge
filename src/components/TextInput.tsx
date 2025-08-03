'use client';

import { useState } from 'react';

interface TextInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export default function TextInput({ onSubmit, disabled }: TextInputProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !disabled) {
      onSubmit(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="expense-input" className="block text-sm font-medium text-gray-700 mb-2">
            Type your expense
          </label>
          <textarea
            id="expense-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder="e.g., I spent $12.50 on coffee"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={!inputText.trim() || disabled}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            !inputText.trim() || disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {disabled ? 'Processing...' : 'Add Expense'}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Include the amount and item description (e.g., "$15 lunch at cafe")
      </p>
    </div>
  );
}