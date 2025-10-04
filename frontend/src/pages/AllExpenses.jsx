import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI } from '../services/api';

const AllExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAllExpenses();
      setExpenses(response.data.expenses);
    } catch (err) {
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    return expense.status === filter;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">All Expenses</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('in_review')}
            className={`px-4 py-2 rounded ${filter === 'in_review' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
          >
            In Review
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-white text-gray-700'}`}
          >
            Rejected
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approvals</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.employee.firstName} {expense.employee.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{expense.category}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.amount} {expense.currency}
                      {expense.convertedAmount && (
                        <div className="text-xs text-gray-500">
                          ({expense.convertedAmount})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.approvals && expense.approvals.length > 0 ? (
                        <div className="text-xs">
                          {expense.approvals.map((approval, idx) => (
                            <div key={idx} className={`${
                              approval.status === 'approved' ? 'text-green-600' :
                              approval.status === 'rejected' ? 'text-red-600' :
                              'text-gray-500'
                            }`}>
                              {approval.approver.firstName}: {approval.status}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllExpenses;
