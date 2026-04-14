import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, Calendar, Clock, Users, MessageCircle, Info, Check, X } from 'lucide-react';
import UserTypeBadge from './UserTypeBadge';

export default function RideDetailScreen() {
  const { navParam, rides, requests, sendRequest, cancelRide, currentUser, navigate, respondRequest } = useAppStore();
  const ride = rides.find(r => r.id === navParam);
  const [actionLoading, setActionLoading] = useState(false);

  if (!ride || !currentUser) return null;


  const isPoster = currentUser.id === ride.poster;
  const posterName = (ride as any).poster_name || 'User';
  const posterType = (ride as any).poster_type || 'student';
  const posterInstitution = (ride as any).poster_institution || '';
  
  const existingRequest = requests.find(r => r.ride === ride.id && r.requester === currentUser.id);

  const handleRequest = async () => {
    if (existingRequest || isPoster) return;
    await sendRequest(ride.id);
    navigate('myRequests');
  };

  const handleRespond = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await respondRequest(requestId, status);
    } catch (e) {
      console.error(e);
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const rideReqs = requests.filter(r => r.ride === ride.id);
  const pendingCount = rideReqs.filter(r => r.status === 'pending').length;

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Premium Header/Banner area with refined gradient */}
      <div className={`relative pt-12 pb-24 px-4 ${posterType === 'student' ? 'bg-indigo-600' : 'bg-purple-600'}`}>
        <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
          <button onClick={() => navigate('dashboard')} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/20 active:scale-95 transition">
            <ChevronLeft size={22} />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em]">
            Ride Details
          </div>
        </div>

        <div className="flex flex-col items-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-4xl shadow-2xl mb-6 transform hover:rotate-6 transition-transform">
            <span>{ride.vehicle.type === 'car' ? '🚗' : '🏍️'}</span>
          </div>
          <h2 className="text-3xl font-black text-white text-center tracking-tighter">{ride.vehicle.model}</h2>
          <p className="text-white/60 text-xs font-bold tracking-widest mt-1 uppercase">{ride.vehicle.number}</p>
        </div>
      </div>

      {/* Content Card area overlapping header */}
      <div className="-mt-12 bg-white rounded-t-[40px] px-6 pt-14 shadow-2xl pb-16 max-w-2xl mx-auto min-h-full relative z-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-3xl font-black text-indigo-500 border border-gray-100 shadow-sm overflow-hidden">
              {(ride as any).poster_photo ? (
                <img src={(ride as any).poster_photo} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-400 font-black">
                  {posterName[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-gray-800 tracking-tight leading-tight mb-2 truncate pr-2">{posterName}</h3>
              <UserTypeBadge user={{ user_type: posterType, institution: posterInstitution } as any} />
            </div>
          </div>
          <button onClick={() => navigate('chat', ride.id)} className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 hover:bg-indigo-100 transition shadow-sm active:scale-90 shrink-0">
             <MessageCircle size={22} />
          </button>
        </div>

        <div className="bg-white rounded-[40px] p-8 mb-10 border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-8 relative">
            <div className="absolute left-[5.5px] top-[14px] bottom-[14px] w-0.5 border-l-2 border-indigo-50 border-dashed" />
            
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100 mt-1.5" />
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Pickup from</p>
                <p className="text-xl font-black text-gray-800 tracking-tight leading-tight">{ride.from_location}</p>
              </div>
            </div>

            <div className="flex items-start gap-6 relative z-10">
              <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100 mt-1.5" />
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Going to</p>
                <p className="text-xl font-black text-gray-800 tracking-tight leading-tight">{ride.to_location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 mb-10">
          <div className="bg-gray-50/50 rounded-[32px] p-6 flex flex-col items-center text-center gap-3 border border-gray-100/50">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Date</p>
              <p className="text-sm font-black text-gray-800 mt-0.5">{ride.date}</p>
            </div>
          </div>
          <div className="bg-gray-50/50 rounded-[32px] p-6 flex flex-col items-center text-center gap-3 border border-gray-100/50">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Time</p>
              <p className="text-sm font-black text-gray-800 mt-0.5">{ride.time}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-between px-8 py-5 bg-indigo-50/30 rounded-[32px] border border-indigo-100/50 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                <Users size={20} />
              </div>
              <span className="text-sm font-black text-indigo-900/60 uppercase tracking-widest">Available Seats</span>
            </div>
            <span className="text-2xl font-black text-indigo-600">{ride.seats_available}</span>
          </div>
        </div>

        {isPoster ? (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h4 className="text-sm font-black text-gray-800 flex items-center gap-2 tracking-tight">
                  <Info size={16} className="text-indigo-500" />
                  Ride Requests ({pendingCount})
                </h4>
                <button
                  onClick={() => navigate('myRides')}
                  className="text-xs font-bold text-indigo-500"
                >
                  Manage All
                </button>
              </div>
              
              {rideReqs.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-100 flex flex-col items-center">
                  <p className="text-sm font-bold text-gray-400">No requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rideReqs.map(req => {
                    const requesterName = (req as any).requester_name || 'User';
                    const requesterPhoto = (req as any).requester_photo;
                    const requesterType = (req as any).requester_type || 'student';

                    return (
                      <div key={req.id} className="flex flex-col p-4 bg-white border border-gray-100 rounded-[28px] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold overflow-hidden ring-2 ring-white">
                              {requesterPhoto ? (
                                <img src={requesterPhoto} className="w-full h-full object-cover" alt="Requester" />
                              ) : (
                                requesterName[0]
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-black text-gray-800 block leading-tight">{requesterName}</span>
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{requesterType}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate('chat', ride.id)}
                              className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 hover:bg-indigo-100 transition shadow-sm active:scale-90"
                            >
                              <MessageCircle size={16} />
                            </button>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                              req.status === 'accepted' ? 'bg-green-100 text-green-600' : 
                              req.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespond(req.id, 'accepted')}
                              disabled={ride.seats_available === 0 || actionLoading}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-green-100 active:scale-95 transition ${actionLoading ? 'opacity-50' : ''}`}
                            >
                              <Check size={14} /> Accept Request
                            </button>
                            <button
                              onClick={() => handleRespond(req.id, 'rejected')}
                              disabled={actionLoading}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl font-bold text-xs active:scale-95 transition shadow-sm ${actionLoading ? 'opacity-50' : ''}`}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('postRide', ride.id)}
                className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-3xl font-black text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                Edit Ride Details
              </button>
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to close this ride? This will notify all passengers.')) {
                    await cancelRide(ride.id);
                    navigate('myRides');
                  }
                }}
                className="flex-1 py-4 bg-white border-2 border-red-50 text-red-500 hover:bg-red-50 rounded-3xl font-black text-sm transition-all active:scale-95"
              >
                Close Ride
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleRequest}
            disabled={!!existingRequest}
            className={`w-full py-4 rounded-[28px] font-black text-sm transition-all active:scale-95 shadow-xl ${
              existingRequest
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-500 hover:bg-slate-800 text-white shadow-indigo-100'
            }`}
          >
            {existingRequest ? `Request ${existingRequest.status.toUpperCase()}` : 'Request Ride'}
          </button>
        )}
      </div>
    </div>
  );
}
