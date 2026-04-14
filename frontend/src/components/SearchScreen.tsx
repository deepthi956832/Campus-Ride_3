import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { Search, MapPin, ChevronLeft, Users, Clock } from 'lucide-react';
import BottomNav from './BottomNav';
import UserTypeBadge from './UserTypeBadge';

export default function SearchScreen() {
  const { rides, navigate, refreshData } = useAppStore();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'employee'>('all');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const isPast = (rideDate: string, rideTime: string) => {
    const now = new Date();
    const [y, m, d] = rideDate.split('-').map(Number);
    const [h, min] = rideTime.split(':').map(Number);
    const rDate = new Date(y, m - 1, d, h, min);
    return rDate < now;
  };

  const filteredRides = (hasSearched || from || to)
    ? rides.filter(ride => {
      if (ride.status !== 'open') return false;
      if (isPast(ride.date, ride.time)) return false;
      const fLoc = ride.from_location || '';
      const tLoc = ride.to_location || '';
      const fTerm = from.trim().toLowerCase();
      const tTerm = to.trim().toLowerCase();
      
      const fromMatch = !fTerm || fLoc.toLowerCase().includes(fTerm);
      const toMatch = !tTerm || tLoc.toLowerCase().includes(tTerm);
      
      const typeMatch = filterType === 'all' || (ride as any).poster_type === filterType;
          
      return fromMatch && toMatch && typeMatch;
    })
    : rides.filter(r => r.status === 'open');

  const vehicleIcon = (type: string) => {
    switch (type) {
      case 'bike': return '🏍️';
      case 'car': return '🚗';
      default: return '🚗';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-6 pt-16 pb-6 shadow-sm border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('dashboard')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 active:scale-90 transition hover:bg-gray-100">
            <ChevronLeft size={22} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Find a Ride</h1>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <input
              type="text"
              value={from}
              onChange={e => { setFrom(e.target.value); setHasSearched(true); }}
              placeholder="From location"
              className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none text-sm bg-gray-50"
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <MapPin size={14} className="text-red-500" />
            </div>
            <input
              type="text"
              value={to}
              onChange={e => { setTo(e.target.value); setHasSearched(true); }}
              placeholder="To location"
              className="w-full pl-9 pr-4 py-3.5 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none text-sm bg-gray-50"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {(['all', 'student', 'employee'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-100 scale-105'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type === 'student' ? '🎓 Student' : '💼 Employee'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {!hasSearched && from.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-12 opacity-60">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
              <Search size={36} className="text-indigo-300" />
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-semibold text-lg">Search for Rides</p>
              <p className="text-gray-400 text-sm mt-1">Enter a location to see available trips</p>
            </div>
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 pb-12">
            <span className="text-6xl animate-bounce">🔍</span>
            <div className="text-center">
              <p className="text-gray-700 font-bold text-xl">No rides found</p>
              <p className="text-gray-400 text-sm mt-2 max-w-[200px] mx-auto">Try searching for a broader location or post your own ride!</p>
            </div>
            <button
              onClick={() => navigate('postRide')}
              className="px-8 py-3.5 bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 active:scale-95 transition"
            >
              Post a Ride instead
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold px-1">{filteredRides.length} available rides found</p>
            {filteredRides.map(ride => (
              <button
                key={ride.id}
                onClick={() => navigate('rideDetail', ride.id)}
                className="w-full bg-white rounded-3xl p-5 shadow-sm text-left border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100 flex-shrink-0 shadow-inner overflow-hidden">
                    {(ride as any).poster_photo ? (
                      <img src={(ride as any).poster_photo} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      (ride as any).poster_name?.[0] || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <p className="font-extrabold text-gray-900 text-base">{(ride as any).poster_name}</p>
                        <UserTypeBadge user={{ user_type: (ride as any).poster_type, institution: (ride as any).poster_institution } as any} className="mt-0.5" />
                      </div>
                      <span className="text-3xl filter drop-shadow-sm">{vehicleIcon(ride.vehicle.type)}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-4 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-100" />
                        <div className="w-0.5 h-6 bg-gray-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-100" />
                      </div>
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <span className="text-sm font-bold text-gray-800 truncate">{ride.from_location}</span>
                        <span className="text-sm font-medium text-gray-500 truncate">{ride.to_location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 px-1">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={14} className="text-indigo-400" />
                        <span className="text-xs font-bold">{ride.date} · {ride.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Users size={14} className="text-indigo-400" />
                        <span className="text-xs font-bold">{ride.seats_available} seats</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="search" />
    </div>
  );
}
