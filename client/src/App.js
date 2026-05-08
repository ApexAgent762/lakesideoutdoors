import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Leads from './pages/Leads';
import Quotes from './pages/Quotes';
import Jobs from './pages/Jobs';
import Schedule from './pages/Schedule';
import Layout from './components/Layout';

const PrivateRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-lakeside-darker text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role === 'CREW') return <Navigate to="/schedule" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute adminOnly><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="leads" element={<Leads />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="jobs" element={<Jobs />} />
        </Route>
        <Route path="/schedule" element={<PrivateRoute><Layout crewOnly /></PrivateRoute>}>
          <Route index element={<Schedule />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
