import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../api/apiClient';
import { CreditCard, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionsAPI.getAll({});
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-1">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">${totalExpense.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Balance</p>
              <p className={`text-2xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(totalIncome - totalExpense).toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-3 text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><span className="text-sm text-gray-600">{new Date(txn.transaction_date).toLocaleDateString()}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-mono text-gray-900">{txn.reference_no || 'N/A'}</span></td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-900">{txn.description || 'N/A'}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        txn.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'income' ? '+' : '-'}${parseFloat(txn.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        {txn.status || 'completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-sm text-gray-500">Financial transactions will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
