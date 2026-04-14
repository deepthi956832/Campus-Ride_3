import { Mail, ChevronLeft, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function VerificationPendingScreen() {
  const { navigate } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-12 pb-12 relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-36 h-36 rounded-full bg-white/10" />
        <button onClick={() => navigate('login')} className="relative flex items-center gap-1 text-white/80 mb-4 text-sm">
          <ChevronLeft size={18} /> Back to Sign In
        </button>
        <h2 className="text-2xl font-extrabold text-white relative">Verify Your Email</h2>
        <p className="text-white/60 text-sm relative">You're almost there! 📧</p>
      </div>

      <div className="flex-1 px-6 py-10 overflow-y-auto -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
            <Mail size={48} className="animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800">Check Your Inbox</h3>
            <p className="text-gray-500 text-sm">
              We've sent a verification link to your email address. 
              Please click the link to activate your account.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-left">
            <h4 className="text-xs font-bold text-amber-700 uppercase mb-1">Didn't get the email?</h4>
            <ul className="text-xs text-amber-600 space-y-1 list-disc pl-4">
              <li>Check your spam or junk folder</li>
              <li>Wait a few minutes for delivery</li>
              <li>Make sure you entered the correct email address</li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={() => navigate('login')}
              className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition active:scale-95"
            >
              Sign In <ArrowRight size={18} />
            </button>
            
            <button
              onClick={() => navigate('register')}
              className="w-full py-3 text-indigo-600 font-semibold text-sm"
            >
              Entered wrong email? Create again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
