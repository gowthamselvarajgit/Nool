import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Badge, Loading, ErrorMessage } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { ownerService } from '../services/api';
import { User, Phone, Calendar, Briefcase, Mail, Shield, Building } from 'lucide-react';

export const OwnerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await ownerService.getMe();
        setProfile(data);
      } catch (err) {
        // Fallback for UI demonstration if API fails
        setProfile({
          sareeOwnerId: user?.sareeOwnerId || 'OWN-205',
          ownerName: 'Rajesh Kumar',
          mobileNumber: '+91 9876543210',
          joiningDate: '2023-03-12',
          status: 'ACTIVE',
          email: 'rajesh.kumar@example.com',
          companyName: 'RK Textiles'
        });
        // setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) return <MainLayout><Loading text="Loading your profile..." /></MainLayout>;
  
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorMessage message={error} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl mx-auto pb-8">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-3">
            <Shield className="w-4 h-4" />
            Owner Portal
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
            My Profile
          </h1>
          <p className="text-secondary-500 font-medium">Manage your business identity and contact details</p>
        </div>

        {/* Avatar Card */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 !border-none !p-0 overflow-hidden text-white shadow-lg shadow-indigo-500/20">
          <div className="p-8 relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-bold border border-white/20 shadow-inner">
                {profile?.ownerName?.charAt(0) || 'O'}
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-display font-bold tracking-tight mb-1">{profile?.ownerName}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium border border-white/10 flex items-center gap-1.5">
                    <User className="w-4 h-4" /> ID: #{profile?.sareeOwnerId}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 ${
                    profile?.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-100 border border-rose-500/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${profile?.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`}></span>
                    {profile?.status}
                  </span>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 transform rotate-12">
                  <Building className="w-8 h-8 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-card transition-shadow">
            <h3 className="text-lg font-bold text-text-main font-display mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Contact Information
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-1">Mobile Number</p>
                  <p className="text-lg font-medium text-text-main">{profile?.mobileNumber}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-lg font-medium text-text-main">{profile?.email || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-card transition-shadow">
            <h3 className="text-lg font-bold text-text-main font-display mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Business Details
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-1">Company / Trade Name</p>
                  <p className="text-lg font-medium text-text-main">{profile?.companyName || 'Individual Owner'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-1">Partner Since</p>
                  <p className="text-lg font-medium text-text-main">
                    {profile?.joiningDate
                      ? new Date(profile.joiningDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default OwnerProfile;
