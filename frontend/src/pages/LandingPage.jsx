import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12">
      <div className="max-w-xl w-full text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">NOOL ERP</h1>
          <p className="text-gray-600 mt-3">Premium saree manufacturing management system — designed for speed, accuracy and beautiful simplicity.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900">Mobile-first experience</h3>
            <p className="text-gray-600 mt-2 text-sm">Optimized for phones with large touch targets and a clean, symmetric layout.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Enterprise grade</h3>
            <p className="text-gray-600 mt-2 text-sm">Secure, role-based access, accurate financials and staff management tools.</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate('/login')} className="flex-1 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700">Get Started</button>
            <button onClick={() => navigate('/login')} className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-800 font-medium">Sign In</button>
          </div>
        </div>

        <div className="mt-10 text-xs text-gray-500">By continuing you agree to NOOL's Terms and Privacy Policy.</div>
      </div>
    </div>
  );
};

export default LandingPage;
