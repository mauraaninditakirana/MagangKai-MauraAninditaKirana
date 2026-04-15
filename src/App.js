import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard'; 
import AdminDashboard from './pages/AdminDashboard';           
import UserManagement from './pages/UserManagement';
import MySubmissions from './pages/MySubmissions';
import UnitManagement from './pages/UnitManagement';
import ArchiveManagement from './pages/ArchiveManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Mahasiswa */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/riwayat" element={<MySubmissions />} />

        {/* Dashboard HC Pusat (Super Admin) */}
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/units" element={<UnitManagement />} />

        {/* Dashboard Kepala Unit */}
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin/archive" element={<ArchiveManagement />} />
      </Routes>
    </Router>
  );
}

export default App;