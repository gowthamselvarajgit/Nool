import { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout';
import {
  Card, Button, Input, Modal, Loading, ErrorMessage, EmptyState,
} from '../components/Common';
import { superAdminService, authService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Plus, RefreshCw, Key, UserCheck, UserX, ShieldCheck, Lock,
} from 'lucide-react';

export const SuperAdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', mobileNumber: '', password: '' });
  const [createError, setCreateError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Password reset modal (for other admins)
  const [showReset, setShowReset] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');

  // Change my own password modal
  const [showMyPw, setShowMyPw] = useState(false);
  const [myPwForm, setMyPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [myPwError, setMyPwError] = useState('');
  const [myPwSuccess, setMyPwSuccess] = useState('');

  useEffect(() => { fetchAdmins(); }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);
      setError('');
      const data = await superAdminService.listAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    const name = (createForm.name || '').trim();
    const m = (createForm.mobileNumber || '').trim();
    const p = (createForm.password || '').trim();
    if (name.length < 2) {
      setCreateError('Name must be at least 2 characters.');
      return;
    }
    if (!/^\d{10,15}$/.test(m)) {
      setCreateError('Mobile must be 10–15 digits.');
      return;
    }
    if (p.length < 8) {
      setCreateError('Password must be at least 8 characters.');
      return;
    }
    try {
      setSubmitting(true);
      setCreateError('');
      await superAdminService.createAdmin({ name, mobileNumber: m, password: p });
      setShowCreate(false);
      setCreateForm({ name: '', mobileNumber: '', password: '' });
      await fetchAdmins();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(admin) {
    const next = !admin.active;
    const verb = next ? 'enable' : 'disable';
    if (!window.confirm(`Are you sure you want to ${verb} the admin account ${admin.mobileNumber}?`)) return;
    try {
      await superAdminService.setStatus(admin.userId, next);
      await fetchAdmins();
    } catch (err) {
      setError(err.message);
    }
  }

  function openReset(admin) {
    setResetTarget(admin);
    setResetPassword('');
    setResetError('');
    setShowReset(true);
  }

  async function handleChangeMyPassword() {
    setMyPwError('');
    setMyPwSuccess('');
    const { currentPassword, newPassword, confirm } = myPwForm;
    if (!currentPassword || !newPassword) {
      setMyPwError('Both current and new password are required.');
      return;
    }
    if (newPassword.length < 8) {
      setMyPwError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setMyPwError('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setMyPwError('New password must be different from the current one.');
      return;
    }
    try {
      setSubmitting(true);
      await authService.changePassword({ currentPassword, newPassword });
      setMyPwSuccess('Password updated. Logging you out — please log in again with your new password.');
      // Short pause so the user reads the message, then force a fresh login.
      setTimeout(() => {
        logout();
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setMyPwError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset() {
    if (resetPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    try {
      setSubmitting(true);
      await superAdminService.resetPassword(resetTarget.userId, resetPassword);
      setShowReset(false);
      setResetTarget(null);
      setResetPassword('');
      await fetchAdmins();
    } catch (err) {
      setResetError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <MainLayout><Loading text="Loading admins..." /></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Management</h1>
              <p className="text-gray-500 mt-1">Create, disable, or reset passwords for workshop administrators.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAdmins}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={() => { setCreateForm({ name: '', mobileNumber: '', password: '' }); setCreateError(''); setShowCreate(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Create Admin
            </Button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchAdmins} />}

        {/* ── Security card: change own password ── */}
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="font-bold text-amber-900">
                  Secure your account
                </p>
                <p className="text-sm text-amber-800 mt-0.5">
                  Logged in as <strong>{user?.name || user?.mobileNumber || '—'}</strong>
                  {user?.name && user?.mobileNumber ? ` (${user.mobileNumber})` : ''}. If you are
                  using the default seed password from <code className="bg-amber-100 px-1 rounded">.env</code>,
                  change it now.
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setMyPwForm({ currentPassword: '', newPassword: '', confirm: '' });
                setMyPwError('');
                setMyPwSuccess('');
                setShowMyPw(true);
              }}
              className="!bg-amber-600 hover:!bg-amber-700"
            >
              <Lock className="w-4 h-4 mr-1" /> Change My Password
            </Button>
          </div>
        </Card>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-violet-500">
            <p className="text-xs text-gray-500 font-medium">Total Admins</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{admins.length}</p>
          </Card>
          <Card className="border-l-4 border-emerald-500">
            <p className="text-xs text-gray-500 font-medium">Active</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">{admins.filter(a => a.active).length}</p>
          </Card>
          <Card className="border-l-4 border-rose-500">
            <p className="text-xs text-gray-500 font-medium">Disabled</p>
            <p className="text-3xl font-bold text-rose-700 mt-1">{admins.filter(a => !a.active).length}</p>
          </Card>
        </div>

        {/* Admin list */}
        {!admins.length ? (
          <EmptyState
            message="No admins yet. Create the first administrator to start managing the workshop."
            icon="🛡️"
          />
        ) : (
          <Card className="!p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">All Administrators</h2>
              <p className="text-sm text-gray-500">Sorted by most recently created</p>
            </div>
            <div className="divide-y divide-gray-100">
              {admins.map(a => (
                <div key={a.userId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                      a.active ? 'bg-gradient-to-br from-indigo-500 to-violet-600' : 'bg-gray-400'
                    }`}>
                      {(a.name || a.mobileNumber || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{a.name || '(no name)'}</p>
                      <p className="text-sm text-gray-600 truncate">{a.mobileNumber}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Created {a.createdAt ? formatDate(a.createdAt) : '—'} ·{' '}
                        <span className={a.active ? 'text-emerald-700' : 'text-rose-700'}>
                          {a.active ? 'Active' : 'Disabled'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openReset(a)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold transition-colors"
                    >
                      <Key className="w-4 h-4" /> Reset Password
                    </button>
                    <button
                      onClick={() => handleToggleStatus(a)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        a.active
                          ? 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700'
                          : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {a.active ? <><UserX className="w-4 h-4" /> Disable</> : <><UserCheck className="w-4 h-4" /> Enable</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Hint card */}
        <Card className="bg-violet-50 border-violet-100">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-violet-900">
              <p className="font-semibold mb-1">Super Admin powers</p>
              <p>
                As super admin you can do everything an admin can. Use the rest of
                the sidebar to manage owners, inventory, payroll, and analytics —
                this page is just for creating and controlling admin accounts.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Create Admin Modal ── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Administrator">
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={createForm.name}
            onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Rahul Sharma"
            required
          />
          <Input
            label="Mobile Number"
            value={createForm.mobileNumber}
            onChange={e => setCreateForm(f => ({ ...f, mobileNumber: e.target.value }))}
            placeholder="10-digit mobile"
            required
          />
          <Input
            label="Password"
            type="password"
            value={createForm.password}
            onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
            placeholder="Minimum 8 characters"
            required
          />
          {createError && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{createError}</p>}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleCreate} isLoading={submitting}>Create</Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ── Change My Own Password Modal ── */}
      <Modal isOpen={showMyPw} onClose={() => setShowMyPw(false)} title="Change My Password">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            After updating, you will be logged out and must sign in again with the new password.
          </p>
          <Input
            label="Current Password"
            type="password"
            value={myPwForm.currentPassword}
            onChange={e => setMyPwForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Your current password"
            required
          />
          <Input
            label="New Password"
            type="password"
            value={myPwForm.newPassword}
            onChange={e => setMyPwForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="At least 6 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={myPwForm.confirm}
            onChange={e => setMyPwForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="Repeat the new password"
            required
          />
          {myPwError && (
            <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {myPwError}
            </p>
          )}
          {myPwSuccess && (
            <p className="text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {myPwSuccess}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleChangeMyPassword} isLoading={submitting} disabled={!!myPwSuccess}>
              Update Password
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowMyPw(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Password Reset Modal (for other admins) ── */}
      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title={`Reset password — ${resetTarget?.mobileNumber || ''}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Set a new password for <strong>{resetTarget?.mobileNumber}</strong>. The admin will need to log in again with the new password.
          </p>
          <Input
            label="New Password"
            type="password"
            value={resetPassword}
            onChange={e => setResetPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            required
          />
          {resetError && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{resetError}</p>}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleReset} isLoading={submitting}>Reset Password</Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowReset(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default SuperAdminPage;
