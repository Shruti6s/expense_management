import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    managerId: ''
  });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchManagers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await userAPI.getManagers();
      setManagers(response.data.managers);
    } catch (err) {
      console.error('Failed to fetch managers');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userAPI.createUser(formData);
      setShowCreateForm(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee',
        managerId: ''
      });
      fetchUsers();
      fetchManagers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await userAPI.updateUser(userId, { role: newRole });
      fetchUsers();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Users</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {showCreateForm ? 'Cancel' : 'Create User'}
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
            <h3 className="text-xl font-bold mb-4">Create New User</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Manager (Optional)</label>
                <select
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">No Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.manager ? `${u.manager.firstName} ${u.manager.lastName}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.id !== user.id && (
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
