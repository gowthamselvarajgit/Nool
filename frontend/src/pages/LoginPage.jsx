import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import { Button, Input, ErrorMessage } from '../components/Common';
import { validateMobileNumber, validatePassword } from '../utils/validators';
import { LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

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
        employeeId: response.employeeId || null,
        sareeOwnerId: response.sareeOwnerId || null,
      });

      // Route based on role
      switch (response.role) {
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'WORKER':
          navigate('/employee/dashboard');
          break;
        case 'SAREE_OWNER':
          navigate('/owner/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      setApiError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Animated Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[120px] mix-blend-multiply animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[120px] mix-blend-multiply animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[40%] w-[700px] h-[700px] bg-purple-400/10 rounded-full blur-[120px] mix-blend-multiply animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-primary-900/10 overflow-hidden relative z-10 animate-scale-up">
        
        {/* Left Side: Branding & Info */}
        <div className="bg-gradient-to-br from-text-main to-secondary-900 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10">
                <span className="text-text-main font-display font-bold text-2xl leading-none">N</span>
              </div>
              <span className="text-3xl font-display font-bold tracking-tight">NOOL ERP</span>
            </div>
            
            <h1 className="text-4xl font-display font-bold leading-tight mb-6">
              Manage your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-indigo-200">saree business</span> <br/>
              with absolute precision.
            </h1>
            <p className="text-secondary-300 text-lg leading-relaxed max-w-sm">
              The complete operating system for modern textile manufacturers. Secure, fast, and remarkably easy to use.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 w-fit">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-white">Enterprise Security</p>
                <p className="text-sm text-secondary-300">256-bit encrypted access</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile Branding */}
            <div className="md:hidden flex items-center justify-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-display font-bold text-xl leading-none">N</span>
              </div>
              <span className="text-2xl font-display font-bold text-text-main tracking-tight">NOOL ERP</span>
            </div>

            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-display font-bold text-text-main mb-2">Welcome Back</h2>
              <p className="text-secondary-500">Sign in to access your dashboard</p>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="mb-6 animate-fade-in">
                <ErrorMessage message={apiError} />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <Input
                  label="Mobile Number"
                  type="tel"
                  name="mobileNumber"
                  placeholder="Enter 10-digit number"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  error={errors.mobileNumber}
                  required
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-secondary-700">Password</label>
                  <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">Forgot?</a>
                </div>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-text-main text-white rounded-2xl text-base font-semibold hover:bg-black transition-all duration-300 shadow-xl shadow-black/10 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform absolute right-6" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-10 text-center">
              <p className="text-sm text-secondary-500">
                Don't have an account?{' '}
                <a href="#" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Contact Administrator
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
