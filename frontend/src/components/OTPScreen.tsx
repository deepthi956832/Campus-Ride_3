import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { ShieldCheck, ChevronLeft, ArrowRight, Loader, Mail } from 'lucide-react';

export default function OTPScreen() {
  const { navigate, navParam, verifyOtp, resetPasswordWithOtp, forgotPassword, resendRegisterOtp } = useAppStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email] = useState(navParam || '');
  const [timer, setTimer] = useState(60);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordInput] = useState(false);
  
  // Determine mode from navigation path (we'll use page names like 'otp-verify' and 'otp-reset')
  const currentPage = useAppStore(s => s.currentPage);
  const isResetMode = currentPage === 'otp-reset';

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;
    
    setLoading(true);
    setError('');
    
    if (isResetMode) {
      if (!showPasswordInput) {
        const ok = await verifyOtp(email, otpValue, 'password_reset');
        if (ok) {
          // Navigate to the final password reset screen with email and otp
          navigate('reset-password-final', `${email}|${otpValue}`);
        } else {
          setError('Invalid or expired OTP.');
        }
        setLoading(false);
        return;
      }
      
      const ok = await resetPasswordWithOtp({ email, otp: otpValue, password: newPassword });
      if (ok) {
        setSuccess(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } else {
      const ok = await verifyOtp(email, otpValue);
      if (ok) {
        setSuccess(true);
      } else {
        setError('Invalid or expired OTP.');
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (timer > 0) return;
    if (isResetMode) {
      await forgotPassword(email);
    } else {
      await resendRegisterOtp(email);
    }
    setTimer(60);
    setError('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {!success && (
        <>
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-12 pb-12 relative overflow-hidden text-white">
            <div className="absolute top-[-40px] right-[-40px] w-36 h-36 rounded-full bg-white/10" />
            <button onClick={() => navigate('login')} className="relative flex items-center gap-1 text-white/80 mb-4 text-sm">
              <ChevronLeft size={18} /> Back to Sign In
            </button>
            <h2 className="text-2xl font-extrabold relative">
              {isResetMode ? 'Reset Password' : 'Verify Email'}
            </h2>
            <p className="text-white/60 text-sm relative">We've sent a 6-digit code to your email.</p>
          </div>

          <div className="flex-1 px-6 py-10 -mt-6 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                  <Mail size={40} />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold text-gray-800">Enter 6-digit Code</h3>
                <p className="text-gray-500 text-sm">{email}</p>
              </div>

              <div className="flex justify-between gap-2 max-w-xs mx-auto">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition"
                  />
                ))}
              </div>

              {isResetMode && showPasswordInput && (
                <div className="space-y-2 pt-4">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full py-4 px-5 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white outline-none transition text-sm font-medium"
                  />
                </div>
              )}

              {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

              <div className="pt-4 space-y-4">
                <button
                  onClick={handleVerify}
                  disabled={loading || otp.join('').length < 6 || (isResetMode && showPasswordInput && !newPassword)}
                  className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
                >
                  {loading ? <Loader className="animate-spin text-white" /> : (isResetMode && !showPasswordInput ? 'Next' : 'Verify & Proceed')}
                  {!loading && <ArrowRight size={18} />}
                </button>

                <div className="text-center">
                  <button
                    onClick={handleResend}
                    disabled={timer > 0}
                    className={`text-sm font-bold ${timer > 0 ? 'text-gray-400' : 'text-indigo-600'}`}
                  >
                    Resend Code {timer > 0 ? `(${timer}s)` : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {success && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center px-6 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8 animate-bounce">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 text-center tracking-tight mb-4">
            {isResetMode ? 'Password Reset!' : 'Account Created Successfully! 🎉'}
          </h2>
          <p className="text-gray-500 text-center text-base mb-10 max-w-[280px]">
            {isResetMode 
              ? 'Your password has been successfully updated. You can now sign in.' 
              : 'Welcome to FreeRide! Your email has been verified. You can now use all our services.'}
          </p>
          <button
            onClick={() => navigate('login')}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base shadow-xl shadow-indigo-100 transition active:scale-95 flex items-center justify-center gap-2"
          >
            Sign In Now <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
