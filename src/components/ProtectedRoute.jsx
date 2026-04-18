import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading SAMADHAN...</p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  const userRole = dbUser?.role || 'user';

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'worker') return <Navigate to="/worker" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
