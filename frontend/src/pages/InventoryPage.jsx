import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import { Card, Loading, ErrorMessage } from '../components/Common';
import { useAuth } from '../hooks/useAuth';
import { inventoryService } from '../services/api';
import { Package, ArrowUpRight, ArrowDownRight, Clock, Box, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md p-3 rounded-xl shadow-elevated border border-border">
        <p className="text-secondary-500 text-xs mb-1 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const InventoryPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ Real API — no ownerId needed (JWT-based, SAREE_OWNER role uses /my-summary and /transactions)
        const [summaryRes, txRes] = await Promise.all([
          inventoryService.getMySummary(firstDay, lastDay).catch(() => null),
          inventoryService.getMyTransactions(0, 20).catch(() => ({ content: [] })),
        ]);

        // ✅ OwnerInventorySummaryDto: totalSareesReceived, totalSareesReturned, sareesInHand
        setSummary({
          totalGiven: summaryRes?.totalSareesReceived ?? 0,
          totalReturned: summaryRes?.totalSareesReturned ?? 0,
          pendingCount: summaryRes?.sareesInHand ?? 0,
        });

        setTransactions(txRes?.content || []);
      } catch (err) {
        setError(err.message || 'Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <MainLayout><Loading text="Loading your inventory..." /></MainLayout>;
  
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ErrorMessage message={error} />
        </div>
      </MainLayout>
    );
  }

  const returnRate = summary?.totalGiven ? Math.round((summary.totalReturned / summary.totalGiven) * 100) : 0;

  // Build chart from actual transactions grouped by week
  const chartData = (() => {
    const weeks = { 'Week 1': { given: 0, returned: 0 }, 'Week 2': { given: 0, returned: 0 }, 'Week 3': { given: 0, returned: 0 }, 'Week 4': { given: 0, returned: 0 } };
    transactions.forEach(tx => {
      const date = tx.receivedDate ? new Date(tx.receivedDate) : null;
      if (!date) return;
      const day = date.getDate();
      const wk = day <= 7 ? 'Week 1' : day <= 14 ? 'Week 2' : day <= 21 ? 'Week 3' : 'Week 4';
      weeks[wk].given += tx.receivedQuantity || 0;
      weeks[wk].returned += tx.returnedQuantity || 0;
    });
    return Object.entries(weeks).map(([name, v]) => ({ name, ...v }));
  })();

  return (
    <MainLayout>
      <div className="space-y-6 pb-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-3">
              <Package className="w-4 h-4" />
              Inventory Overview
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-text-main tracking-tight mb-2">
              My Stock & Flow
            </h1>
            <p className="text-secondary-500 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {monthName}
            </p>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Given Card */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">Total Given Out</p>
                <h3 className="text-4xl font-display font-bold text-text-main mb-2">{summary?.totalGiven || 0}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                  <ArrowUpRight className="w-3 h-3" /> Sarees to workers
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Returned Card */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">Total Returned</p>
                <h3 className="text-4xl font-display font-bold text-text-main mb-2">{summary?.totalReturned || 0}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <ArrowDownRight className="w-3 h-3" /> Sarees completed
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ArrowDownRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">Pending Stock</p>
                <h3 className="text-4xl font-display font-bold text-text-main mb-2">{summary?.pendingCount || 0}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3" /> With workers
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Box className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 !p-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-text-main font-display">Inventory Flow</h3>
                <p className="text-sm text-secondary-500">Given vs Returned over time</p>
              </div>
            </div>
            <div className="p-6 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGiven" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="given" name="Given Out" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorGiven)" />
                  <Area type="monotone" dataKey="returned" name="Returned" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReturned)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Return Rate Widget */}
          <div className="flex flex-col gap-6">
            <Card className="flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden bg-gradient-to-b from-surface to-primary-50/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-200/20 via-transparent to-transparent"></div>
              <div className="relative z-10 w-full">
                <h3 className="text-lg font-bold text-text-main font-display mb-1">Return Rate</h3>
                <p className="text-sm text-secondary-500 mb-8">Efficiency tracking</p>
                
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary-100" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * returnRate) / 100} strokeLinecap="round" className="text-primary-600 transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-display font-bold text-text-main">{returnRate}%</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-between text-sm px-4">
                  <span className="text-secondary-500">Given: <span className="font-bold text-text-main">{summary?.totalGiven}</span></span>
                  <span className="text-secondary-500">Returned: <span className="font-bold text-text-main">{summary?.totalReturned}</span></span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Transactions List */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-surface-hover/30 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-text-main font-display">Recent Movements</h2>
              <p className="text-sm text-secondary-500">Latest inventory activities</p>
            </div>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View Full History</button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-secondary-50 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-secondary-300" />
              </div>
              <p className="text-secondary-500 font-medium">No inventory movements this month</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {/* ✅ SareeTransactionResponseDto: transactionId, receivedDate, receivedQuantity, returnedDate, returnedQuantity, remarks */}
              {transactions.map((tx) => (
                <div key={tx.transactionId} className="flex items-center justify-between px-6 py-4 hover:bg-surface-hover transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      tx.receivedQuantity ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {tx.receivedQuantity ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-text-main group-hover:text-primary-600 transition-colors">
                        TXN #{tx.transactionId}
                      </p>
                      <p className="text-sm text-secondary-500 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {tx.receivedDate
                          ? new Date(tx.receivedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : tx.returnedDate
                          ? new Date(tx.returnedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.receivedQuantity != null && (
                      <p className="font-bold text-indigo-600">{tx.receivedQuantity} <span className="text-sm font-medium text-secondary-500">given</span></p>
                    )}
                    {tx.returnedQuantity != null && (
                      <p className="font-bold text-emerald-600">{tx.returnedQuantity} <span className="text-sm font-medium text-secondary-500">returned</span></p>
                    )}
                    {tx.remarks && <p className="text-xs text-secondary-400 mt-0.5">{tx.remarks}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default InventoryPage;
