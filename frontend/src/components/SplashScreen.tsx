import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export default function SplashScreen() {
  const navigate = useAppStore(s => s.navigate);
  const currentUser = useAppStore(s => s.currentUser);

  useEffect(() => {
    const t = setTimeout(() => {
      navigate(currentUser ? 'dashboard' : 'login');
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
      {/* Animated circles */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/10 animate-pulse" />
      <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-white/10 animate-pulse delay-300" />
      <div className="absolute top-1/3 left-[-40px] w-32 h-32 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="w-28 h-28 bg-white rounded-3xl shadow-2xl flex items-center justify-center rotate-6 transform hover:rotate-0 transition-transform duration-500">
          <span className="text-5xl">🚗</span>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Campus
          </h1>
          <h1 className="text-4xl font-extrabold text-yellow-300 tracking-tight -mt-1">
            Ride
          </h1>
          <p className="text-white/80 text-sm mt-2 font-medium tracking-wide">
            Ride Together · Save Together
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      <p className="absolute bottom-8 text-white/50 text-xs">
        For Students & Employees
      </p>
    </div>
  );
}
