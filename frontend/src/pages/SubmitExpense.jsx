import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const SubmitExpense = () => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    category: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });
  const [receipt, setReceipt] = useState(null);
  const [useOCR, setUseOCR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const categories = [
    'Travel', 'Food', 'Accommodation', 'Transport', 'Office Supplies',
    'Entertainment', 'Training', 'General'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setReceipt(e.target.files[0]);
    setUseOCR(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (useOCR && receipt) {
        const formDataObj = new FormData();
        formDataObj.append('receipt', receipt);

        const response = await expenseAPI.uploadReceipt(formDataObj);
        setSuccess(response.data.message || `✅ Created ${response.data.count} expense(s) using AI!`);
      } else {
        await expenseAPI.createExpense(formData);
        setSuccess('✅ Expense created successfully (Manual)!');
      }

      setTimeout(() => navigate('/expenses/my-expenses'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Submit Expense</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={useOCR}
                  onChange={(e) => setUseOCR(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Upload receipt for OCR extraction</span>
              </label>

              {useOCR && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Supported formats: Images (JPG, PNG), PDF, Excel (XLSX, XLS)
                  </p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.xlsx,.xls"
                    className="w-full px-3 py-2 border rounded-lg"
                    required={useOCR}
                  />
                </div>
              )}
            </div>

            {!useOCR && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  >
                    {currencies.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    rows="3"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Expense Date</label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Submitting...' : 'Submit Expense'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitExpense;
