import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Layout, PieChart, Shield, Zap, Users, Activity, BarChart3, TrendingUp } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-500/30 selection:text-primary-900 font-sans overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-50/50 to-transparent"></div>
        <div className="absolute -top-[300px] -right-[200px] w-[800px] h-[800px] rounded-full bg-primary-400/10 blur-[100px] mix-blend-multiply"></div>
        <div className="absolute top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[100px] mix-blend-multiply"></div>
      </div>

      {/* ================= NAVBAR ================= */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="text-white font-display font-bold text-xl leading-none">N</span>
          </div>
          <span className="text-2xl font-display font-bold text-text-main tracking-tight">NOOL</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary-600">
          <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
          <a href="#solutions" className="hover:text-primary-600 transition-colors">Solutions</a>
          <a href="#testimonials" className="hover:text-primary-600 transition-colors">Success Stories</a>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="group relative inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-full overflow-hidden transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 transition-transform duration-300 group-hover:scale-[1.02]"></div>
            <span className="relative">Sign In</span>
            <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 lg:pt-32 lg:pb-40 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in slide-down">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
          </span>
          NOOL ERP 2.0 is now live
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-text-main tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto">
          Kanchana Textiles <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
            Management Suite
          </span>
        </h1>

        <p className="text-lg md:text-xl text-secondary-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Streamlined operations for workforce management, inventory tracking, payroll processing, and real-time analytics. Designed for Kanchana Textiles.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-text-main text-white rounded-full text-base font-semibold hover:bg-black transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/10"
          >
            Sign In to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-20 relative mx-auto max-w-6xl perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-500/20 to-transparent blur-3xl -z-10 transform translate-y-10"></div>
          <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-2xl shadow-primary-900/20 border border-white/50 overflow-hidden relative transform scale-100 hover:scale-[1.02] transition-transform duration-300">
            
            {/* Mock Header */}
            <div className="bg-surface-hover border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="h-6 w-48 bg-white rounded-md shadow-sm border border-border"></div>
            </div>
            
            {/* Mock Content */}
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface/50">
              <div className="md:col-span-2 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="h-4 w-32 bg-secondary-200 rounded-full mb-3"></div>
                    <div className="h-10 w-48 bg-gradient-to-r from-primary-200 to-primary-100 rounded-lg"></div>
                  </div>
                  <div className="h-8 w-24 bg-emerald-100 rounded-full"></div>
                </div>
                <div className="h-72 bg-white rounded-xl border border-border shadow-soft flex items-end p-6 gap-4">
                  {[40, 70, 45, 90, 65, 80, 50, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-primary-500 to-indigo-400 rounded-t-sm opacity-90" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-white rounded-xl border border-border shadow-soft p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50"></div>
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-secondary-200 rounded-full"></div>
                      <div className="h-2 w-12 bg-secondary-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-8 w-full bg-surface-hover rounded-lg"></div>
                </div>
                <div className="h-32 bg-white rounded-xl border border-border shadow-soft p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50"></div>
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-secondary-200 rounded-full"></div>
                      <div className="h-2 w-16 bg-secondary-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-8 w-full bg-surface-hover rounded-lg"></div>
                </div>
              </div>
            </div>
            
            {/* Glass reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* ================= METRICS LOGOS ================= */}
      <section className="border-y border-border bg-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-secondary-400 uppercase tracking-wider mb-8">Powering operations for</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24">
            {/* Kanchana Textiles Logo */}
            <div className="text-2xl font-display font-bold text-primary-600 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">K</div>
              Kanchana Textiles
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-24 relative z-10 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary-600 font-semibold tracking-wide uppercase text-sm mb-3">Enterprise Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-text-main mb-4">Everything you need to run your factory</h3>
            <p className="text-secondary-500 text-lg">Powerful features wrapped in an intuitive, consumer-grade interface.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-card transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-text-main mb-3">Workforce Management</h4>
              <p className="text-secondary-500 leading-relaxed">
                Track daily attendance, manage employee profiles, assign roles, and handle shifts without relying on messy spreadsheets.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-card transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <PieChart className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-text-main mb-3">Inventory Tracking</h4>
              <p className="text-secondary-500 leading-relaxed">
                Monitor stock levels in real-time. Track sarees given to workers and log returns to ensure absolute accuracy in your supply chain.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-card transition-all duration-300 group">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-text-main mb-3">Automated Payroll</h4>
              <p className="text-secondary-500 leading-relaxed">
                Automatically calculate salaries and owner payouts based on daily work logs, polishing rates, and attendance records.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-card transition-all duration-300 group">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-text-main mb-3">Live Analytics</h4>
              <p className="text-secondary-500 leading-relaxed">
                Visualize production trends, revenue growth, and worker performance with beautifully designed Recharts dashboards.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-card transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Shield className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-text-main mb-3">Role-Based Access</h4>
              <p className="text-secondary-500 leading-relaxed">
                Secure JWT authentication with dedicated portals for Admins, Saree Owners, and Employees. Everyone sees only what they need.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-3xl p-8 border border-border shadow-soft hover:shadow-card transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <Zap className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-text-main mb-3">Lightning Fast</h4>
              <p className="text-secondary-500 leading-relaxed">
                Built on a modern React/Vite stack ensuring instant page loads and seamless transitions for maximum productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-24 relative z-10 px-6">
        <div className="max-w-5xl mx-auto bg-text-main rounded-[3rem] p-10 md:p-16 relative overflow-hidden text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to access your dashboard?
            </h2>
            <p className="text-xl text-secondary-300 mb-10 max-w-2xl mx-auto">
              Sign in to Kanchana Textiles management suite and streamline your operations.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-text-main rounded-full text-lg font-bold hover:scale-105 transition-all duration-300 shadow-xl shadow-white/10"
            >
              Sign In Now
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-secondary-400 mt-6 text-sm">Use your credentials provided by the administrator.</p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border bg-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-display font-bold leading-none">K</span>
            </div>
            <span className="text-xl font-display font-bold text-text-main tracking-tight">Kanchana Textiles</span>
          </div>
          
          <div className="text-secondary-500 text-sm">
            © {new Date().getFullYear()} Kanchana Textiles. All rights reserved.
          </div>
          
          <div className="flex gap-6 text-sm font-medium text-secondary-600">
            <a href="#" className="hover:text-primary-600">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600">Terms of Service</a>
            <a href="#" className="hover:text-primary-600">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;