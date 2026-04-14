import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Search, Plus, Bell, Car, Star, Shield, X } from 'lucide-react';
import BottomNav from './BottomNav';

export default function Dashboard() {
  const { currentUser, rides, requests, notifications, navigate, refreshData } = useAppStore();
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // Poll for new data every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refreshData();
    }, 30000);
    return () => clearInterval(timer);
  }, [refreshData]);

  if (!currentUser) return null;

  const isStudent = currentUser.user_type === 'student';
  const unreadCount = notifications.filter(n => n.user === currentUser.id && !n.read).length;

  const isPast = (rideDate: string, rideTime: string) => {
    const now = new Date();
    const [y, m, d] = rideDate.split('-').map(Number);
    const [h, min] = rideTime.split(':').map(Number);
    const rDate = new Date(y, m - 1, d, h, min);
    return rDate < now;
  };

  const myPostedCount = rides.filter(r => 
    r.poster === currentUser.id && 
    (r.status === 'open' || r.status === 'confirmed') &&
    !isPast(r.date, r.time)
  ).length;

  const myRequestCount = requests.filter(req => {
    if (req.requester !== currentUser.id) return false;
    const ride = rides.find(r => r.id === req.ride);
    return ride && (ride.status === 'open' || ride.status === 'confirmed') && !isPast(ride.date, ride.time);
  }).length;

  const confirmedCount = requests.filter(r =>
    r.requester === currentUser.id && r.status === 'accepted' && !isPast(rides.find(ride => ride.id === r.ride)?.date || '', rides.find(ride => ride.id === r.ride)?.time || '')
  ).length;

  const gradColors = isStudent
    ? 'from-indigo-600 via-blue-600 to-cyan-500'
    : 'from-purple-600 via-fuchsia-600 to-pink-500';

  const accentColor = isStudent ? 'text-indigo-600' : 'text-purple-600';
  const accentBg = isStudent ? 'bg-indigo-50' : 'bg-purple-50';

  const recentRides = rides
    .filter(r => r.status === 'open' && r.poster !== currentUser.id && !isPast(r.date, r.time))
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-8 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setShowPrivacy(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
               <Shield size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight mb-4 text-center">Privacy Policy</h2>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Data Security</p>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">Your data is encrypted and stored securely. We never share your personal information with third parties.</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Campus Verification</p>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">Institution IDs are used solely for identity verification and are hidden from other users for your privacy.</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Location Privacy</p>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">Exact pickup points are only shared with your confirmed travel partners.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPrivacy(false)}
              className="w-full mt-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 transition"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Premium Dashboard Header */}
      <div className={`bg-gradient-to-br ${gradColors} px-6 pt-16 pb-20 relative overflow-hidden shrink-0`}>
        <div className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 rounded-full bg-white/10" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center text-white shadow-xl overflow-hidden">
               {currentUser.photo ? <img src={currentUser.photo} className="w-full h-full object-cover" /> : currentUser.full_name[0]}
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Good morning</p>
              <h2 className="text-xl font-black text-white tracking-tight leading-none">{(currentUser?.full_name || 'User').split(' ')[0]} 👋</h2>
            </div>
          </div>
          <button
            onClick={() => navigate('notifications')}
            className="relative w-11 h-11 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20 active:scale-95 transition"
          >
            <Bell size={20} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 border-2 border-white rounded-full text-white text-[10px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar Frame */}
        <button
          onClick={() => navigate('search')}
          className="relative mt-8 w-full bg-white dark:bg-slate-900 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-2xl dark:shadow-none active:scale-[0.98] transition-all"
        >
          <Search size={20} className="text-indigo-400" />
          <span className="text-gray-400 dark:text-slate-500 text-sm font-bold">Where are you going today?</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mt-12 pb-24 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Posted', count: myPostedCount, icon: Car, color: 'bg-blue-500', page: 'myRides' },
            { label: 'Requested', count: myRequestCount, icon: Search, color: 'bg-amber-500', page: 'myRequests' },
            { label: 'Confirmed', count: confirmedCount, icon: Star, color: 'bg-green-500', page: 'confirmed' },
          ].map(({ label, count, icon: Icon, color, page }) => (
            <button
              key={label}
              onClick={() => navigate(page)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition"
            >
              <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">{count}</span>
              <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => navigate('postRide')}
            className={`bg-gradient-to-br ${gradColors} rounded-2xl p-4 flex items-center gap-3 shadow-sm active:scale-95 transition`}
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">Post a Ride</p>
              <p className="text-white/70 text-xs">Offer your seat</p>
            </div>
          </button>

          <button
            onClick={() => navigate('search')}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm border-2 border-gray-100 dark:border-slate-800 active:scale-95 transition"
          >
            <div className={`w-10 h-10 ${accentBg} dark:bg-slate-800 rounded-xl flex items-center justify-center`}>
              <Search size={20} className={`${accentColor} dark:text-indigo-400`} />
            </div>
            <div className="text-left">
              <p className="text-gray-800 dark:text-white font-bold text-sm">Find a Ride</p>
              <p className="text-gray-500 dark:text-slate-400 text-xs">Search rides</p>
            </div>
          </button>
        </div>

        {/* Recent Rides Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-black text-gray-800 dark:text-white tracking-tight">Recent Rides</h2>
            <button onClick={() => navigate('search')} className="text-xs font-bold text-indigo-500">View All</button>
          </div>

          {recentRides.length === 0 ? (
            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-[32px] p-10 border-2 border-dashed border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-4">🚗</div>
              <p className="text-sm font-bold text-gray-400 dark:text-slate-500 max-w-[200px]">No rides found nearby. Be the first to post!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRides.map(ride => (
                <div
                  key={ride.id}
                  onClick={() => navigate('rideDetail', ride.id)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-[28px] border border-gray-100 dark:border-slate-800 flex items-center gap-4 active:scale-95 transition shadow-sm"
                >
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl">
                    {ride.vehicle.type === 'car' ? '🚗' : '🏍️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-black text-gray-800 dark:text-white truncate text-sm">{ride.from_location}</h4>
                    </div>
                    <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold truncate">To {ride.to_location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-800 dark:text-white">{ride.time}</p>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-[8px] font-bold text-green-600 dark:text-green-400 uppercase tracking-tighter mt-1">
                      {ride.seats_available} Seats
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safety & Trust Banner */}
        <div className="mt-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-100 dark:border-indigo-900/40 rounded-[32px] p-6 relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-indigo-500/5" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-800 dark:text-white mb-1">Safety First! 🛡️</h3>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 leading-relaxed">All users are campus-verified with official institution IDs for your security.</p>
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mt-8 space-y-4 pb-12">
          <h2 className="text-lg font-black text-gray-800 dark:text-white tracking-tight px-1">How it Works</h2>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-1 px-1">
            {[
              { id: 1, e: '🔍', t: 'Find Rides', d: 'Search by routes, time, or fellow student names' },
              { id: 2, e: '📱', t: 'Request', d: 'Book a seat instantly and wait for driver approval' },
              { id: 3, e: '💬', t: 'Chat', d: 'Secure messaging with your verified travel partner' },
              { id: 4, e: '🤝', t: 'Enjoy', d: 'Safe, low-cost travel while building campus bonds' }
            ].map(step => (
              <div key={step.id} className="min-w-[170px] bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-colors">
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">{step.e}</span>
                <p className="text-[11px] font-black text-gray-800 dark:text-white mb-2 uppercase tracking-tight">{step.t}</p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 leading-relaxed px-1">{step.d}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
             <button 
              onClick={() => setShowPrivacy(true)}
              className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors"
            >
              Privacy Policy 🔒
            </button>
             <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">© 2026 Campus Ride · Ridesharing System</p>
          </div>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
