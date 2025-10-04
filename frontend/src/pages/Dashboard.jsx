import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Expense Management System</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              {user?.firstName} {user?.lastName} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Employee Features */}
          <div
            onClick={() => navigate('/expenses/submit')}
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-2">Submit Expense</h2>
            <p className="text-gray-600">Create a new expense claim</p>
          </div>

          <div
            onClick={() => navigate('/expenses/my-expenses')}
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-2">My Expenses</h2>
            <p className="text-gray-600">View your expense history</p>
          </div>

          {/* Manager/Admin Features */}
          {(user?.role === 'manager' || user?.role === 'admin') && (
            <div
              onClick={() => navigate('/approvals')}
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
            >
              <h2 className="text-xl font-bold mb-2">Pending Approvals</h2>
              <p className="text-gray-600">Review expenses waiting for approval</p>
            </div>
          )}

          {/* Admin Only Features */}
          {user?.role === 'admin' && (
            <>
              <div
                onClick={() => navigate('/users')}
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold mb-2">Manage Users</h2>
                <p className="text-gray-600">Create and manage employees</p>
              </div>

              <div
                onClick={() => navigate('/approval-rules')}
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold mb-2">Approval Rules</h2>
                <p className="text-gray-600">Configure approval workflows</p>
              </div>

              <div
                onClick={() => navigate('/expenses/all')}
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold mb-2">All Expenses</h2>
                <p className="text-gray-600">View all company expenses</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
