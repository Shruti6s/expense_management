import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI } from '../services/api';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comments, setComments] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await expenseAPI.getPendingApprovals();
      setApprovals(response.data.approvals);
    } catch (err) {
      setError('Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approvalId, status) => {
    try {
      await expenseAPI.approveOrReject(approvalId, { status, comments });
      setSelectedApproval(null);
      setComments('');
      fetchApprovals();
    } catch (err) {
      setError('Failed to process approval');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Pending Approvals</h2>
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

        <div className="grid gap-4">
          {approvals.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
              No pending approvals
            </div>
          ) : (
            approvals.map((approval) => (
              <div key={approval.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Employee</p>
                    <p className="font-semibold">
                      {approval.expense.employee.firstName} {approval.expense.employee.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold">
                      {new Date(approval.expense.expenseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold">{approval.expense.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold">
                      {approval.expense.amount} {approval.expense.currency}
                      {approval.expense.convertedAmount && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({approval.expense.convertedAmount})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Description</p>
                    <p>{approval.expense.description}</p>
                  </div>
                </div>

                {selectedApproval === approval.id ? (
                  <div className="mt-4">
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add comments (optional)"
                      className="w-full px-3 py-2 border rounded-lg mb-4"
                      rows="3"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApproval(approval.id, 'approved')}
                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(approval.id, 'rejected')}
                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setSelectedApproval(null)}
                        className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedApproval(approval.id)}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Review
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Approvals;
