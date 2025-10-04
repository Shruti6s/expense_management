import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SubmitExpense from './pages/SubmitExpense';
import MyExpenses from './pages/MyExpenses';
import Approvals from './pages/Approvals';
import ManageUsers from './pages/ManageUsers';
import ApprovalRules from './pages/ApprovalRules';
import AllExpenses from './pages/AllExpenses';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses/submit"
            element={
              <PrivateRoute>
                <SubmitExpense />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses/my-expenses"
            element={
              <PrivateRoute>
                <MyExpenses />
              </PrivateRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <PrivateRoute>
                <Approvals />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <ManageUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/approval-rules"
            element={
              <PrivateRoute>
                <ApprovalRules />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses/all"
            element={
              <PrivateRoute>
                <AllExpenses />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
