import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50 text-slate-900">

      {/* ================= NAVBAR ================= */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="text-xl font-bold text-teal-700">NOOL ERP</div>
        <nav className="hidden md:flex gap-8 text-sm text-slate-600">
          <a href="#">Product</a>
          <a href="#">Solutions</a>
          <a href="#">Pricing</a>
          <a href="#">Learn</a>
        </nav>
        <div className="flex gap-3">
          <button className="text-sm px-4 py-2 border rounded-lg">
            Login
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Manage employees, salaries & sarees.<br />
            <span className="text-slate-500 font-normal">
              All your operations, simplified.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-slate-600">
            NOOL ERP helps saree manufacturers manage attendance,
            daily polishing work, inventory, owner payments and revenue
            with complete accuracy.
          </p>

          <div className="mt-8 flex gap-4">
            <input
              placeholder="Your business email"
              className="px-4 py-3 rounded-lg border w-64"
            />
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold"
            >
              Get Started
            </button>
          </div>

          <div className="mt-10 flex gap-6 text-sm text-slate-500">
            <span>Klarna</span>
            <span>Coinbase</span>
            <span>Instacart</span>
          </div>
        </div>

        {/* Mock Card */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 mx-auto">
            <p className="text-xs text-slate-500">Monthly Payout</p>
            <p className="text-2xl font-bold mt-2">₹ 18,76,580</p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Salary</span>
                <span>₹ 9.2L</span>
              </div>
              <div className="flex justify-between">
                <span>Owner Pay</span>
                <span>₹ 6.4L</span>
              </div>
              <div className="flex justify-between">
                <span>Expenses</span>
                <span>₹ 3.1L</span>
              </div>
            </div>

            <button className="mt-4 w-full py-2 rounded-lg bg-teal-600 text-white">
              Pay Now
            </button>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-teal-600 text-xs font-semibold uppercase">
            Future‑Ready ERP
          </p>
          <h2 className="text-3xl font-bold mt-2">
            Experience that scales with your factory
          </h2>

          <div className="mt-12 grid md:grid-cols-3 gap-8 text-left">
            {[
              ['Attendance Control', 'Prevent duplicate attendance and track productivity'],
              ['Multiple Payments', 'Cash, bank or cheque handled cleanly'],
              ['Enterprise Security', 'JWT auth, role‑based access, audits'],
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-xl">
                <h4 className="font-semibold mb-2">{f[0]}</h4>
                <p className="text-sm text-slate-600">{f[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY NOOL ================= */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h3 className="text-center text-3xl font-bold mb-12">
          Why manufacturers choose NOOL
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow">
            <p className="text-4xl font-bold text-teal-600">3k+</p>
            <p className="mt-2 text-slate-600">
              Sarees processed every month using NOOL
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow">
            <p className="font-semibold mb-2">Instant insights</p>
            <p className="text-slate-600">
              Know productivity, revenue and payouts in real‑time.
            </p>
          </div>
        </div>
      </section>

      {/* ================= DARK STEPS ================= */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold mb-12">
            Start managing your factory in minutes
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['1', 'Create your account', 'Configure employees & rates'],
              ['2', 'Record daily work', 'Attendance & output per employee'],
              ['3', 'Track & pay', 'Salaries, owners & analytics'],
            ].map((s, i) => (
              <div key={i} className="bg-slate-800 p-6 rounded-xl">
                <p className="text-3xl font-bold mb-4">{s[0]}</p>
                <h4 className="font-semibold">{s[1]}</h4>
                <p className="text-sm text-slate-400 mt-2">{s[2]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h3 className="text-center text-3xl font-bold mb-12">
          Simple pricing
        </h3>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow">
            <h4 className="font-semibold">Standard</h4>
            <p className="text-2xl font-bold mt-2">₹299 / month</p>
          </div>
          <div className="bg-teal-600 text-white p-8 rounded-xl shadow">
            <h4 className="font-semibold">Premium</h4>
            <p className="text-2xl font-bold mt-2">₹699 / month</p>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-slate-900 text-white py-20 text-center">
        <h3 className="text-3xl font-bold">
          Ready to streamline your saree business?
        </h3>
        <p className="mt-4 text-slate-300">
          Start managing operations the professional way.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-teal-600 rounded-lg font-semibold"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} NOOL ERP. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;