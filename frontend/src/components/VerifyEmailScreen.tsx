import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function VerifyEmailScreen() {
  const { verifyOtp, navigate, navParam } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      const params = new URLSearchParams(window.location.search);
      const email = params.get('email') || navParam;
      const code = params.get('code');

      if (!email || !code) {
        setStatus('error');
        setError('Verification link is invalid or incomplete.');
        return;
      }

      try {
        const ok = await verifyOtp(email, code);
        if (ok) {
          setStatus('success');
          // Automatically clear URL params
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => navigate('login'), 3000);
        } else {
          setStatus('error');
          setError('Verification failed. The code may have expired or already been used.');
        }
      } catch (err) {
        setStatus('error');
        setError('An unexpected error occurred during verification.');
      }
    };

    performVerification();
  }, [verifyOtp]);

  return (
    <div className="flex flex-col h-full bg-gray-50 items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 animate-pulse">
              <Loader size={40} className="animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verifying...</h2>
            <p className="text-gray-500">Checking your verification link. Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
            <p className="text-gray-500">Your email has been successfully verified. Your account is now active and ready to use.</p>
            <button
              onClick={() => navigate('login')}
              className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-100 transition active:scale-95"
            >
              Sign In Now
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verification Faild</h2>
            <p className="text-red-500 text-sm">{error}</p>
            <p className="text-gray-500">Please try registering again or contact support if the issue persists.</p>
            <button
              onClick={() => navigate('register')}
              className="w-full py-4 rounded-xl border-2 border-indigo-600 text-indigo-600 font-bold text-base transition active:scale-95"
            >
              Back to Register
            </button>
            <button
              onClick={() => navigate('login')}
              className="w-full py-2 text-indigo-600 font-semibold text-sm transition"
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
