import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, Calendar, Clock, CheckCircle2, XCircle, Undo2, Filter } from 'lucide-react';
import BottomNav from './BottomNav';

type HistoryTab = 'posted' | 'requested' | 'confirmed';

export default function HistoryScreen() {
  const { currentUser, rides, requests, users, navigate } = useAppStore();
  const [activeTab, setActiveTab] = useState<HistoryTab>('requested');

  if (!currentUser) return null;

  const isPast = (rideDate: string, rideTime: string) => {
    const now = new Date();
    const [y, m, d] = rideDate.split('-').map(Number);
    const [h, min] = (rideTime || '00:00').split(':').map(Number);
    const rDate = new Date(y, m - 1, d, h, min);
    return rDate < now;
  };

  const postedHistory = rides.filter(r => 
    r.poster === currentUser.id && 
    (r.status === 'completed' || r.status === 'cancelled' || isPast(r.date, r.time))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const requestedHistory = requests.filter(req => {
    if (req.requester !== currentUser.id) return false;
    const ride = rides.find(r => r.id === req.ride);
    return ride && (req.status === 'rejected' || isPast(ride.date, ride.time));
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const confirmedHistory = requests.filter(req => {
    if (req.requester !== currentUser.id || req.status !== 'accepted') return false;
    const ride = rides.find(r => r.id === req.ride);
    return ride && (ride.status === 'completed' || isPast(ride.date, ride.time));
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const currentData = activeTab === 'posted' ? postedHistory : activeTab === 'requested' ? requestedHistory : confirmedHistory;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
       <div className="bg-white dark:bg-slate-900 px-4 pt-12 pb-2 shadow-sm border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 active:scale-90 transition">
            <ChevronLeft size={20} className="text-gray-600 dark:text-slate-300" />
          </button>
          <h1 className="text-lg font-black text-gray-800 dark:text-white tracking-tight leading-none">Activity History</h1>
        </div>

        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl mb-2">
          {[
            { id: 'posted', label: 'Posted' },
            { id: 'requested', label: 'Requested' },
            { id: 'confirmed', label: 'Confirmed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as HistoryTab)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' 
                  : 'text-gray-400 dark:text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {currentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 opacity-60">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-900 rounded-[32px] flex items-center justify-center text-gray-400">
               <Undo2 size={40} />
            </div>
            <div className="text-center">
               <p className="text-gray-600 dark:text-slate-300 font-black text-lg">No {activeTab} history</p>
               <p className="text-gray-400 dark:text-slate-500 text-xs font-bold mt-1 max-w-[220px] mx-auto">Your completed or past {activeTab} activity will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             {currentData.map((item: any) => {
               const ride = activeTab === 'posted' ? item : rides.find(r => r.id === item.ride);
               if (!ride) return null;
               
               const isPoster = ride.poster === currentUser.id;
               const poster = users.find(u => u.id === ride.poster);
               
               let statusLabel = ride.status;
               if (activeTab !== 'posted') {
                 statusLabel = item.status;
               }

               const statusColor = (statusLabel === 'completed' || statusLabel === 'accepted') 
                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                  : (statusLabel === 'cancelled' || statusLabel === 'rejected')
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-500 bg-gray-100 dark:bg-slate-800';

               return (
                 <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-5 shadow-sm border border-gray-100 dark:border-slate-800 group transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${statusColor}`}>
                          {statusLabel}
                       </span>
                       <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">{new Date(ride.date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-start gap-3 mb-5">
                       <div className="w-11 h-11 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl border border-gray-100 dark:border-slate-800">
                          {ride.vehicle.type === 'car' ? '🚗' : '🏍️'}
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-black text-gray-800 dark:text-white leading-none mb-1">
                             {activeTab === 'posted' ? 'You posted' : `${poster?.full_name?.split(' ')[0]} offered`}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 leading-none">{ride.vehicle.model}</p>
                       </div>
                    </div>

                    <div className="bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-3 mb-4 border border-gray-100/50 dark:border-slate-800">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <p className="text-xs font-bold text-gray-600 dark:text-slate-300 truncate">{ride.from_location}</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <p className="text-xs font-bold text-gray-600 dark:text-slate-300 truncate">{ride.to_location}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400 px-1">
                       <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-indigo-400" />
                          <span className="text-[11px] font-bold text-gray-500">{ride.date}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-indigo-400" />
                          <span className="text-[11px] font-bold text-gray-500">{ride.time}</span>
                       </div>
                    </div>
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
