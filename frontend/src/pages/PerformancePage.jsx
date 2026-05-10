import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage, Badge } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { dailyWorkService } from '../services/api';
import { Trophy, TrendingUp, Target, Flame, Calendar, Medal, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md p-3 rounded-xl shadow-elevated border border-border">
        <p className="text-secondary-500 text-xs mb-1 font-medium">{label}</p>
        <p className="text-sm font-bold flex items-center gap-2 text-indigo-600">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          {payload[0].value} units
        </p>
      </div>
    );
  }
  return null;
};

export const PerformancePage = () => {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeId = user?.employeeId || 'EMP-102';

        // Mock delay for UI
        await new Promise(resolve => setTimeout(resolve, 800));

        setPerformance({
          monthlyTarget: 1000,
          currentTotal: 840,
          currentStreak: 12,
          qualityScore: 98.5,
          monthlyEarnings: 21000,
          history: [
            { month: 'Jan', value: 750 },
            { month: 'Feb', value: 820 },
            { month: 'Mar', value: 800 },
            { month: 'Apr', value: 910 },
            { month: 'May', value: 890 },
            { month: 'Jun', value: 840 },
          ]
        });

      } catch (err) {
        setError(err.message || 'Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <MainLayout><Loading text="Loading your performance metrics..." /></MainLayout>;
  
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorMessage message={error} />
        </div>
      </MainLayout>
    );
  }

  const targetCompletion = Math.round((performance?.currentTotal / performance?.monthlyTarget) * 100) || 0;

  const radialData = [
    { name: 'Target', value: 100, fill: '#e2e8f0' },
    { name: 'Achieved', value: targetCompletion, fill: '#10b981' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6 pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold mb-3">
              <Trophy className="w-4 h-4" />
              My Performance
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              Analytics & Targets
            </h1>
            <p className="text-secondary-500 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {monthName}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg shadow-amber-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
            <div>
              <p className="text-xs font-medium text-amber-100">Current Streak</p>
              <p className="font-bold">{performance?.currentStreak} Days</p>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Medal className="w-6 h-6" />
              </div>
              <Badge variant="success">Excellent</Badge>
            </div>
            <p className="text-sm font-medium text-secondary-500 mb-1">Quality Score</p>
            <p className="text-3xl font-display font-bold text-text-main">{performance?.qualityScore}%</p>
          </Card>

          <Card className="hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-secondary-500 mb-1">Current Output</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-display font-bold text-text-main">{performance?.currentTotal}</p>
              <p className="text-sm font-medium text-secondary-500">/ {performance?.monthlyTarget}</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600 to-primary-700 text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all border-none">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-indigo-100 mb-1">Est. Earnings</p>
            <p className="text-3xl font-display font-bold text-white">₹{performance?.monthlyEarnings?.toLocaleString()}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-text-main font-display">Monthly Trend</h3>
                <p className="text-sm text-secondary-500">Output volume over past 6 months</p>
              </div>
            </div>
            <div className="p-6 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance?.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Goal Progress Ring */}
          <Card className="flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-surface to-emerald-50/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10 w-full">
              <h3 className="text-lg font-bold text-text-main font-display mb-1">Monthly Goal</h3>
              <p className="text-sm text-secondary-500 mb-4">Progress to target</p>
              
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={16} data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '30px' }}>
                  <span className="text-4xl font-display font-bold text-text-main">{targetCompletion}%</span>
                </div>
              </div>
              
              <p className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full inline-block mt-4 border border-emerald-100">
                You're on track! Keep it up.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PerformancePage;
