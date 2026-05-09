import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import { Button, Input, ErrorMessage, Spinner } from '../components/Common';
import { validateMobileNumber, validatePassword } from '../utils/validators';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ mobileNumber: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Invalid mobile number (10 digits required)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(
        formData.mobileNumber,
        formData.password
      );

      login(response.token, {
        role: response.role,
        mobileNumber: formData.mobileNumber,
      });

      // Route based on role
      switch (response.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'EMPLOYEE':
          navigate('/employee/dashboard');
          break;
        case 'OWNER':
          navigate('/owner/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      setApiError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Animated Logo */}
        <div className="text-center mb-12 slide-down">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🎀 NOOL
          </h1>
          <p className="text-gray-600">Enterprise Resource Planning System</p>
          <p className="text-sm text-gray-500 mt-2">Saree Manufacturing & Business Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 slide-up">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Sign in to access your dashboard</p>

          {/* API Error */}
          {apiError && <ErrorMessage message={apiError} />}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Mobile Number"
              type="tel"
              name="mobileNumber"
              placeholder="10-digit mobile number"
              value={formData.mobileNumber}
              onChange={handleChange}
              error={errors.mobileNumber}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            {/* Demo Credentials Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-medium mb-2">Demo Credentials:</p>
              <p>Mobile: 9876543210</p>
              <p>Password: Admin@123</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Built with ❤️ by Gowtham Selvaraj</p>
            <p className="mt-1">Full Stack Java Developer | Cognizant</p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 text-center space-y-2 text-gray-600 text-sm">
          <p>✨ Secure • Fast • Intuitive ✨</p>
          <p>Enterprise-Grade Security with JWT Authentication</p>
        </div>
      </div>

      {/* Background Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
