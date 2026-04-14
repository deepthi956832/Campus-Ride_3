import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

export default function ResetPasswordScreen() {
  const { resetPassword, navigate } = useAppStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Extract UID and Token from URL
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUid(params.get('uid') || '');
    setToken(params.get('token') || '');
  }, []);

  const handleReset = async () => {
    setError('');
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!uid || !token) {
      setError('Invalid or missing reset token. Please try requesting a new link.');
      return;
    }

    setLoading(true);
    try {
      const ok = await resetPassword({ uid, token, password });
      if (ok) {
        setSuccess(true);
      } else {
        setError('Faild to reset password. The link may have expired.');
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Password Reset!</h2>
          <p className="text-gray-500">Your password has been successfully updated. You can now sign in with your new password.</p>
          <button
            onClick={() => {
                // Clear URL params and navigate
                window.history.replaceState({}, '', window.location.pathname);
                navigate('login');
            }}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-100 transition active:scale-95"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-14 pb-12 relative overflow-hidden text-white">
        <div className="absolute top-[-40px] right-[-40px] w-36 h-36 rounded-full bg-white/10" />
        <h2 className="text-2xl font-extrabold relative">Set New Password</h2>
        <p className="text-white/60 text-sm relative">Create a secure password for your account</p>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-gray-800 text-sm transition"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm New Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-gray-800 text-sm transition"
              />
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-200 active:scale-95 transition disabled:opacity-60"
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
