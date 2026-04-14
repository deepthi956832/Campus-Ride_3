import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, Mail, Send } from 'lucide-react';

export default function ForgotPasswordScreen() {
  const { forgotPassword, navigate } = useAppStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setError('');
    setMessage('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const ok = await forgotPassword(email);
      if (ok) {
        navigate('otp-reset', email);
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-12 pb-12 relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-36 h-36 rounded-full bg-white/10" />
        <button onClick={() => navigate('login')} className="relative flex items-center gap-1 text-white/80 mb-4 text-sm">
          <ChevronLeft size={18} /> Back to Login
        </button>
        <h2 className="text-2xl font-extrabold text-white relative">Reset Password</h2>
        <p className="text-white/60 text-sm relative">We'll send you a link to reset your password</p>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm flex items-center gap-2">
              <span>✅</span> {message}
            </div>
          )}

          {!message && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-gray-800 text-sm transition"
                  />
                </div>
              </div>

              <button
                onClick={handleRequest}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-200 active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : (
                  <>
                    Send Reset Link <Send size={18} />
                  </>
                )}
              </button>
            </>
          )}

          {message && (
            <button
              onClick={() => navigate('login')}
              className="w-full py-4 rounded-xl border-2 border-indigo-600 text-indigo-600 font-bold text-base transition"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
