import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Eye, EyeOff, Car } from 'lucide-react';

export default function LoginScreen() {
  const { login, navigate } = useAppStore();
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!emailOrMobile || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const ok = await login(emailOrMobile, password);
      if (ok) {
        navigate('dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-16 pb-20 relative overflow-hidden shrink-0">
        <div className="absolute top-[-40px] right-[-40px] w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/30 rounded-[22px] flex items-center justify-center shadow-xl">
            <Car size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Campus Ride</h1>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">RIDESHARING SYSTEM</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-3xl font-black text-white tracking-tighter">Welcome! 👋</h2>
          <p className="text-white/70 text-sm font-medium mt-1">Sign in to start sharing rides</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email or Mobile</label>
            <input
              type="text"
              value={emailOrMobile}
              onChange={e => setEmailOrMobile(e.target.value)}
              placeholder="Enter email or mobile number"
              className="mt-1 w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-gray-800 text-sm transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
            <div className="relative mt-1">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-gray-800 text-sm transition"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end pr-1">
              <button
                onClick={() => navigate('forgot-password')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-200 active:scale-95 transition disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <p className="text-gray-500 text-sm">Don't have an account?{' '}
              <button
                onClick={() => navigate('register')}
                className="text-indigo-600 font-semibold"
              >
                Create Account
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
