import { useAppStore } from '../store/appStore';
import { ChevronLeft, Calendar, Clock, MessageCircle, CheckCircle2 } from 'lucide-react';
import BottomNav from './BottomNav';

export default function ConfirmedRidesScreen() {
  const { currentUser, rides, requests, users, navigate } = useAppStore();
  if (!currentUser) return null;

  const isPast = (rideDate: string, rideTime: string) => {
    const now = new Date();
    const [y, m, d] = rideDate.split('-').map(Number);
    const [h, min] = (rideTime || '00:00').split(':').map(Number);
    const rDate = new Date(y, m - 1, d, h, min);
    return rDate < now;
  };

  // Rides I'm part of as a requester
  const myConfirmed = requests
    .filter(req => req.requester === currentUser.id && req.status === 'accepted')
    .map(req => rides.find(r => r.id === req.ride))
    .filter(ride => ride && !isPast(ride.date, ride.time)) as any[];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm border-b border-gray-100/50 flex items-center gap-3">
        <button onClick={() => navigate('dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 active:scale-90 transition">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">Confirmed Trips</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {myConfirmed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 opacity-60">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle2 size={40} />
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-bold text-lg">No confirmed rides</p>
              <p className="text-gray-400 text-sm mt-1 max-w-[220px] mx-auto">Once your requests are accepted, they will appear here!</p>
            </div>
            <button
               onClick={() => navigate('search')}
               className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100"
            >
              Find a Ride
            </button>
          </div>
        ) : (
          <div className="space-y-4">
             {myConfirmed.map(ride => {
               const posterName = (ride as any).poster_name || 'Driver';
               const posterPhoto = (ride as any).poster_photo;

               return (
                 <div key={ride.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100/50 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 -mr-8 -mt-8 rounded-full" />
                    
                    <div className="flex items-center justify-between mb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 border border-indigo-100 overflow-hidden ring-2 ring-white">
                             {posterPhoto ? (
                               <img src={posterPhoto} className="w-full h-full object-cover" alt="Driver" />
                             ) : (
                               posterName[0]
                             )}
                          </div>
                          <div>
                             <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-0.5">Driver</p>
                             <h3 className="text-base font-black text-gray-800 tracking-tight leading-none">{posterName}</h3>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => navigate('chat', ride.id)}
                            className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 active:scale-90 transition"
                          >
                            <MessageCircle size={16} />
                          </button>
                       </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                       <div className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                          <p className="text-sm font-bold text-gray-800 truncate">{ride.from_location}</p>
                       </div>
                       <div className="flex items-start gap-4">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                          <p className="text-sm font-bold text-gray-800 truncate">{ride.to_location}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-indigo-400" />
                            <span className="text-xs font-bold text-gray-500">{ride.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-indigo-400" />
                            <span className="text-xs font-bold text-gray-500">{ride.time}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                          <CheckCircle2 size={12} className="text-green-600" />
                          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Matched</span>
                       </div>
                    </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
