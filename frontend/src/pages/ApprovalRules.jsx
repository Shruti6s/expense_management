import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { approvalRuleAPI, userAPI } from '../services/api';

const ApprovalRules = () => {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'sequential',
    percentageRequired: '',
    specificApproverId: '',
    isManagerApprover: true,
    workflows: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRules();
    fetchUsers();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await approvalRuleAPI.getRules();
      setRules(response.data.rules);
    } catch (err) {
      setError('Failed to fetch approval rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const addWorkflowStep = () => {
    setFormData({
      ...formData,
      workflows: [...formData.workflows, { approverId: '', stepNumber: formData.workflows.length + 1, isRequired: true }]
    });
  };

  const updateWorkflow = (index, field, value) => {
    const newWorkflows = [...formData.workflows];
    newWorkflows[index][field] = value;
    setFormData({ ...formData, workflows: newWorkflows });
  };

  const removeWorkflow = (index) => {
    const newWorkflows = formData.workflows.filter((_, i) => i !== index);
    setFormData({ ...formData, workflows: newWorkflows });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await approvalRuleAPI.createRule(formData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        ruleType: 'sequential',
        percentageRequired: '',
        specificApproverId: '',
        isManagerApprover: true,
        workflows: []
      });
      fetchRules();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create approval rule');
    }
  };

  const deleteRule = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        await approvalRuleAPI.deleteRule(ruleId);
        fetchRules();
      } catch (err) {
        setError('Failed to delete rule');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Approval Rules</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {showCreateForm ? 'Cancel' : 'Create Rule'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-bold mb-4">Create Approval Rule</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Rule Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Rule Type</label>
                  <select
                    name="ruleType"
                    value={formData.ruleType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="sequential">Sequential</option>
                    <option value="percentage">Percentage</option>
                    <option value="specific_approver">Specific Approver</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {(formData.ruleType === 'percentage' || formData.ruleType === 'hybrid') && (
                  <div>
                    <label className="block text-gray-700 mb-2">Percentage Required (%)</label>
                    <input
                      type="number"
                      name="percentageRequired"
                      value={formData.percentageRequired}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      max="100"
                    />
                  </div>
                )}

                {(formData.ruleType === 'specific_approver' || formData.ruleType === 'hybrid') && (
                  <div>
                    <label className="block text-gray-700 mb-2">Specific Approver</label>
                    <select
                      name="specificApproverId"
                      value={formData.specificApproverId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Select Approver</option>
                      {users.filter(u => u.role === 'manager' || u.role === 'admin').map(u => (
                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isManagerApprover"
                      checked={formData.isManagerApprover}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span>Require Manager Approval First</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold">Approval Workflow Steps</h4>
                  <button
                    type="button"
                    onClick={addWorkflowStep}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Add Step
                  </button>
                </div>

                {formData.workflows.map((workflow, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <span className="flex items-center px-3">Step {workflow.stepNumber}</span>
                    <select
                      value={workflow.approverId}
                      onChange={(e) => updateWorkflow(index, 'approverId', e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Select Approver</option>
                      {users.filter(u => u.role === 'manager' || u.role === 'admin').map(u => (
                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeWorkflow(index)}
                      className="bg-red-500 text-white px-3 py-2 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Create Rule
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{rule.name}</h3>
                  <p className="text-sm text-gray-600">Type: {rule.ruleType}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {rule.isManagerApprover && (
                <p className="text-sm mb-2">✓ Manager approval required first</p>
              )}

              {rule.percentageRequired && (
                <p className="text-sm mb-2">Percentage Required: {rule.percentageRequired}%</p>
              )}

              {rule.specificApprover && (
                <p className="text-sm mb-2">
                  Specific Approver: {rule.specificApprover.firstName} {rule.specificApprover.lastName}
                </p>
              )}

              {rule.workflows && rule.workflows.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-sm mb-1">Workflow Steps:</p>
                  <ol className="list-decimal list-inside">
                    {rule.workflows.map((w) => (
                      <li key={w.id} className="text-sm">
                        {w.approver.firstName} {w.approver.lastName}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}

          {rules.length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
              No approval rules found. Create one to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalRules;
