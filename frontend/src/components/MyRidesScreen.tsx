import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, Plus, Clock, Users, Edit, XCircle, CheckCircle, Ban, Sun, Moon } from 'lucide-react';
import BottomNav from './BottomNav';

type RideCategory = 'active' | 'completed' | 'cancelled';

export default function MyRidesScreen() {
  const { currentUser, rides, requests, cancelRide, updateRideStatus, navigate, darkMode, toggleDarkMode } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<RideCategory>('active');

  if (!currentUser) return null;

  const allMyRides = rides.filter(r => r.poster === currentUser.id);
  
  const filteredRides = allMyRides.filter(r => {
    if (activeCategory === 'active') return r.status === 'open' || r.status === 'confirmed';
    return r.status === activeCategory;
  });

  const vehicleEmoji = (type: string) =>
    ({ car: '🚗', bike: '🏍️' }[type] || '🚗');

  const statusConfig = {
    open: { label: 'Open', color: 'bg-green-100 text-green-700' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600' },
  };

  const tabs: { id: RideCategory; label: string; icon: any }[] = [
    { id: 'active', label: 'Active', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'cancelled', label: 'Cancelled', icon: Ban },
  ];

  const isPast = (rideDate: string, rideTime: string) => {
    if (!rideDate || !rideTime) return false;
    const now = new Date();
    const [y, m, d] = rideDate.split('-').map(Number);
    const [h, min] = rideTime.split(':').map(Number);
    const rDate = new Date(y, m - 1, d, h, min);
    return rDate < now;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 px-4 pt-12 pb-2 shadow-sm border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 active:scale-95 transition">
              <ChevronLeft size={20} className="text-gray-600 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-800 dark:text-white tracking-tight leading-none mb-1">My Posted Rides</h1>
              <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Manage your ride history</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center active:scale-90 transition border border-gray-200 dark:border-slate-700"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>
            <button
              onClick={() => navigate('postRide')}
              className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none active:scale-90 transition"
            >
              <Plus size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            const count = allMyRides.filter(r => {
                if (tab.id === 'active') return r.status === 'open' || r.status === 'confirmed';
                return r.status === tab.id;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 relative ${
                  isActive ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={14} className="mb-1" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
                {count > 0 && (
                    <span className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                        isActive ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-300'
                    }`}>
                        {count}
                    </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {filteredRides.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center opacity-60">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-4xl shadow-sm border border-gray-100 dark:border-slate-700">
                {activeCategory === 'active' ? '🚗' : activeCategory === 'completed' ? '🏁' : '🚫'}
            </div>
            <div>
              <p className="text-gray-600 dark:text-slate-300 font-black text-lg tracking-tight">No {activeCategory} rides</p>
              <p className="text-gray-400 dark:text-slate-500 text-xs font-bold max-w-[200px] mt-1">
                {activeCategory === 'active' 
                    ? "You don't have any upcoming rides scheduled." 
                    : `Your ${activeCategory} rides will appear here.`}
              </p>
            </div>
            {activeCategory === 'active' && (
              <button
                onClick={() => navigate('postRide')}
                className="mt-2 px-8 py-3.5 bg-indigo-500 text-white rounded-[24px] font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 transition"
              >
                Post a Ride Now
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map(ride => {
              const rideReqs = requests.filter(r => r.ride === ride.id);
              const pendingCount = rideReqs.filter(r => r.status === 'pending').length;
              const status = statusConfig[ride.status as keyof typeof statusConfig] || statusConfig.open;
              const expired = (ride.status === 'open' || ride.status === 'confirmed') && isPast(ride.date, ride.time);

              return (
                <div key={ride.id} className={`bg-white dark:bg-slate-900 rounded-[32px] shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800 transition-all duration-300 ${activeCategory !== 'active' ? 'opacity-80 grayscale-[0.3]' : ''}`}>
                  <button
                    onClick={() => navigate('rideDetail', ride.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl border border-gray-100 dark:border-slate-700 shadow-inner">
                            {vehicleEmoji(ride.vehicle.type)}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 dark:text-white tracking-tight leading-none mb-1">{ride.vehicle.model}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono tracking-widest uppercase leading-none">{ride.vehicle.number}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${status.color} shadow-sm`}>
                          {status.label}
                        </span>
                        {expired && (
                          <span className="text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 bg-red-50 text-red-500 dark:bg-red-900/20 rounded-md animate-pulse">
                            Time Expired
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4 border border-gray-100/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100 dark:ring-green-900/40" />
                          <span className="text-xs font-black text-gray-700 dark:text-slate-300 truncate">{ride.from_location}</span>
                        </div>
                        <div className="flex items-center gap-3 ml-[3px] border-l-2 border-dashed border-gray-200 dark:border-slate-700 pl-[11px] py-1 mb-1">
                            <div className="h-4" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-100 dark:ring-red-900/40" />
                          <span className="text-xs font-black text-gray-700 dark:text-slate-300 truncate">{ride.to_location}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black ${
                          expired 
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-500' 
                            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          <Clock size={12} strokeWidth={3} />
                          <span>{ride.date} · {ride.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-400">
                          <Users size={12} strokeWidth={3} />
                          <span className="text-[10px] font-black">{ride.seats_available} seats</span>
                        </div>
                      </div>
                      {pendingCount > 0 && activeCategory === 'active' && !expired && (
                        <div className="flex items-center gap-1 bg-amber-500 px-3 py-1.5 rounded-full shadow-lg shadow-amber-100 dark:shadow-none animate-pulse">
                          <span className="text-[9px] font-black text-white uppercase tracking-tighter">{pendingCount} New Requests</span>
                        </div>
                      )}
                    </div>
                  </button>

                  {activeCategory === 'active' && (
                    <div className={`grid grid-cols-3 border-t p-2 gap-2 bg-gray-50/20 dark:bg-slate-800/20 ${expired ? 'border-red-100 dark:border-red-900/40' : 'border-gray-100 dark:border-slate-800'}`}>
                      <button
                        onClick={() => navigate('postRide', ride.id)}
                        className="flex flex-col items-center justify-center gap-1 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-xl border border-gray-100 dark:border-slate-700 active:scale-95 transition shadow-sm"
                      >
                        <Edit size={14} strokeWidth={3} /> Edit
                      </button>
                      
                      <button
                        onClick={async () => {
                          if (window.confirm('Mark this trip as completed?')) {
                            await updateRideStatus(ride.id, 'completed');
                          }
                        }}
                        className="flex flex-col items-center justify-center gap-1 py-2 bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 text-[10px] font-black rounded-xl border border-gray-100 dark:border-slate-700 active:scale-95 transition shadow-sm"
                      >
                        <CheckCircle size={14} strokeWidth={3} /> Complete
                      </button>

                      <button
                        onClick={async () => {
                          const msg = expired 
                            ? 'This ride has passed. Close it to post a new one?' 
                            : 'Are you sure you want to close this ride? This will notify all passengers.';
                          if (window.confirm(msg)) {
                            await cancelRide(ride.id);
                          }
                        }}
                        className={`flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-black rounded-xl border active:scale-95 transition shadow-sm ${
                          expired 
                            ? 'bg-red-500 text-white border-red-600' 
                            : 'bg-white dark:bg-slate-800 text-red-500 dark:text-red-400 border-gray-100 dark:border-slate-700'
                        }`}
                      >
                        <XCircle size={14} strokeWidth={3} /> {expired ? 'Clear' : 'Close'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="profile" />
    </div>
  );
}
