import { useAppStore } from '../store/appStore';
import { ChevronLeft, Calendar, Clock, MessageCircle, MoreVertical } from 'lucide-react';
import BottomNav from './BottomNav';

export default function MyRequestsScreen() {
  const { currentUser, rides, requests, users, navigate } = useAppStore();
  if (!currentUser) return null;

  const isPast = (rideDate: string, rideTime: string) => {
    const now = new Date();
    const [y, m, d] = rideDate.split('-').map(Number);
    const [h, min] = (rideTime || '00:00').split(':').map(Number);
    const rDate = new Date(y, m - 1, d, h, min);
    return rDate < now;
  };

  const myRequests = requests
    .filter(req => {
      if (req.requester !== currentUser.id) return false;
      const ride = rides.find(r => r.id === req.ride);
      if (!ride) return false;
      return !isPast(ride.date, ride.time);
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
    accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm border-b border-gray-100/50 flex items-center gap-3">
        <button onClick={() => navigate('dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 active:scale-90 transition">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">My Bookings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {myRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 opacity-60">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400">
               <Calendar size={40} />
             </div>
             <div className="text-center">
               <p className="text-gray-600 font-bold text-lg">No bookings yet</p>
               <p className="text-gray-400 text-sm mt-1 max-w-[220px] mx-auto">Find a ride and request to join! Your journey starts here.</p>
             </div>
             <button
               onClick={() => navigate('search')}
               className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100"
             >
               Explore Rides
             </button>
          </div>
        ) : (
          <div className="space-y-4">
             {myRequests.map(req => {
               const ride = rides.find(r => r.id === req.ride);
               if (!ride) return null;
               
               const posterName = (ride as any).poster_name || 'Driver';
               const posterPhoto = (ride as any).poster_photo;
               const posterType = (ride as any).poster_type || 'student';
               const status = statusConfig[req.status] || statusConfig.pending;

               return (
                 <div key={req.id} className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100/50 group active:scale-[0.99] transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${status.color}`}>
                          {status.label}
                       </span>
                       <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 transition">
                          <MoreVertical size={16} />
                       </button>
                    </div>

                    <div className="flex items-center gap-3 mb-5 px-1">
                       <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-lg font-black text-indigo-600 border border-indigo-100 overflow-hidden">
                          {posterPhoto ? (
                            <img src={posterPhoto} className="w-full h-full object-cover" alt="Poster" />
                          ) : (
                            posterName[0]
                          )}
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-black text-gray-800 leading-none mb-1">{posterName}</p>
                          <p className="text-[10px] font-bold text-gray-400 leading-none uppercase tracking-widest">{posterType}</p>
                       </div>
                       {req.status === 'accepted' && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); navigate('chat', ride.id); }}
                            className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm"
                         >
                            <MessageCircle size={18} />
                         </button>
                       )}
                    </div>

                    <button
                       onClick={() => navigate('rideDetail', ride.id)}
                       className="w-full"
                    >
                       <div className="flex flex-col gap-4 mb-5 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                          <div className="flex items-start gap-4">
                             <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                             <p className="text-xs font-bold text-gray-700 truncate">{ride.from_location}</p>
                          </div>
                          <div className="flex items-start gap-4">
                             <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                             <p className="text-xs font-bold text-gray-700 truncate">{ride.to_location}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 text-gray-400 px-1">
                          <div className="flex items-center gap-1.5 leading-none">
                             <Calendar size={12} className="text-indigo-400" />
                             <span className="text-[11px] font-bold text-gray-500">{ride.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 leading-none">
                             <Clock size={12} className="text-indigo-400" />
                             <span className="text-[11px] font-bold text-gray-500">{ride.time}</span>
                          </div>
                       </div>
                    </button>
                 </div>
               );
             })}
          </div>
        )}
      </div>

      <BottomNav active="search" />
    </div>
  );
}
