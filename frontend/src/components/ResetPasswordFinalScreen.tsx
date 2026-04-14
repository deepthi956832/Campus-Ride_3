import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { ShieldCheck, ChevronLeft, ArrowRight, Loader, Eye, EyeOff, Lock } from 'lucide-react';

export default function ResetPasswordFinalScreen() {
  const { navigate, navParam, resetPasswordWithOtp } = useAppStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // navParam will contain the email and OTP separated by a pipe character e.g. "email|otp"
  const [email, otp] = (navParam || '').split('|');

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill all fields.');
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

    setLoading(true);
    setError('');
    
    const ok = await resetPasswordWithOtp({ email, otp, password });
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate('login'), 2000);
    } else {
      setError('Failed to reset password. The link or OTP may have expired.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-12 pb-12 relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-36 h-36 rounded-full bg-white/10" />
        <button onClick={() => navigate('login')} className="relative flex items-center gap-1 text-white/80 mb-4 text-sm">
          <ChevronLeft size={18} /> Back to Sign In
        </button>
        <h2 className="text-2xl font-extrabold text-white relative">Create New Password</h2>
        <p className="text-white/60 text-sm relative">Set a secure password for your account.</p>
      </div>

      <div className="flex-1 px-6 py-10 -mt-6 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              {success ? <ShieldCheck size={40} className="text-green-500" /> : <Lock size={40} />}
            </div>
          </div>

          {!success ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full py-4 px-5 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white outline-none transition text-sm font-medium"
                    />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full py-4 px-5 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white outline-none transition text-sm font-medium"
                    />
                    <button onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
              >
                {loading ? <Loader className="animate-spin" /> : 'Reset Password'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Password Updated!</h3>
              <p className="text-gray-500 text-sm">Your password has been changed successfully. Redirecting you to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
