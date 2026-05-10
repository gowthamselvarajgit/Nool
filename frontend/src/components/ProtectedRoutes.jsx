import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/Common';

export const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loading /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loading /></div>;
  }

  if (isAuthenticated) {
    switch (user?.role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'WORKER':
        return <Navigate to="/employee/dashboard" replace />;
      case 'SAREE_OWNER':
        return <Navigate to="/owner/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export const UnauthorizedPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">🚫</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Unauthorized Access</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <a
          href="/"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};
