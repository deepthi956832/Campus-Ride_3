import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, MapPin, Car, Calendar, Clock, Hash } from 'lucide-react';

type VehicleType = 'car' | 'bike';

export default function PostRideScreen() {
  const { currentUser, postRide, navigate, navParam, rides, editRide } = useAppStore();
  const editId = navParam;
  const existing = editId ? rides.find(r => r.id === editId) : null;

  const [form, setForm] = useState({
    from_location: existing?.from_location || '',
    to_location: existing?.to_location || '',
    vehicleModel: existing?.vehicle.model || '',
    vehicleNumber: existing?.vehicle.number || '',
    vehicleType: (existing?.vehicle.type || 'car') as VehicleType,
    seats_available: (existing as any)?.total_seats?.toString() || '1',
    date: existing?.date || '',
    time: existing?.time || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const isPast = (rideDate: string, rideTime: string) => {
    if (!rideDate || !rideTime) return false;
    const now = new Date();
    const [y, m, d] = rideDate.split('-').map(Number);
    const [h, min] = rideTime.split(':').map(Number);
    const rDate = new Date(y, m - 1, d, h, min);
    return rDate < now;
  };

  const hasActiveRide = !editId && rides.some(r => 
    r.poster === currentUser?.id && 
    (r.status === 'open' || r.status === 'confirmed') &&
    !isPast(r.date, r.time)
  );

  const handleSubmit = async () => {
    if (hasActiveRide) return;
    setError('');
    if (!form.from_location || !form.to_location || !form.vehicleModel || !form.vehicleNumber || !form.date || !form.time) {
      setError('Please fill all required fields.');
      return;
    }
    if (!currentUser) return;
    setLoading(true);
    
    const rideData = {
      poster: currentUser.id,
      from_location: form.from_location,
      to_location: form.to_location,
      vehicle: {
        model: form.vehicleModel,
        number: form.vehicleNumber,
        type: form.vehicleType,
      },
      total_seats: parseInt(form.seats_available) || 1,
      date: form.date,
      time: form.time,
    };
    
    if (editId) {
      await editRide(editId, rideData);
    } else {
      await postRide(rideData as any);
    }
    navigate('myRides');
    setLoading(false);
  };

  const vehicleTypes: { type: VehicleType; emoji: string; label: string }[] = [
    { type: 'car', emoji: '🚗', label: 'Car' },
    { type: 'bike', emoji: '🏍️', label: 'Bike' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 pt-12 pb-6 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10" />
        <div className="flex items-center gap-3 relative">
          <button onClick={() => navigate(editId ? 'myRides' : 'dashboard')} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{editId ? 'Edit Ride' : 'Post a Ride'}</h1>
            <p className="text-white/60 text-xs">Offer your seat to others</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          {hasActiveRide && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
              ⚠️ You already have an active ride. Please complete or cancel it before posting another.
            </div>
          )}

          {/* Route */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">📍 Route Details</p>
            <div>
              <label className="text-xs text-gray-500 font-medium">From Location *</label>
              <div className="relative mt-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500" />
                <input
                  type="text"
                  value={form.from_location}
                  onChange={e => update('from_location', e.target.value)}
                  placeholder="Pickup location"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">To Location *</label>
              <div className="relative mt-1">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                <input
                  type="text"
                  value={form.to_location}
                  onChange={e => update('to_location', e.target.value)}
                  placeholder="Drop location"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">🚗 Vehicle Details</p>

            <div className="grid grid-cols-4 gap-2">
              {vehicleTypes.map(({ type, emoji, label }) => (
                <button
                  key={type}
                  onClick={() => {
                    update('vehicleType', type);
                    if (type === 'bike' && parseInt(form.seats_available) > 1) {
                      update('seats_available', '1');
                    }
                  }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition ${form.vehicleType === type
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-100 bg-gray-50'
                    }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className={`text-[10px] font-semibold ${form.vehicleType === type ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Vehicle Model *</label>
              <div className="relative mt-1">
                <Car size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.vehicleModel}
                  onChange={e => update('vehicleModel', e.target.value)}
                  placeholder="e.g. Honda Activa, Maruti Swift"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Vehicle Number *</label>
              <div className="relative mt-1">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.vehicleNumber}
                  onChange={e => update('vehicleNumber', e.target.value.toUpperCase())}
                  placeholder="e.g. KA-01-HH-1234"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">📅 Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Date *</label>
                <div className="relative mt-1">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => update('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-8 pr-2 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Time *</label>
                <div className="relative mt-1">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => update('time', e.target.value)}
                    className="w-full pl-8 pr-2 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-400 focus:outline-none bg-gray-50 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Seats Available *</label>
              <div className="flex gap-2 mt-1">
                {(form.vehicleType === 'bike' ? [1] : [1, 2, 3]).map(n => (
                  <button
                    key={n}
                    onClick={() => update('seats_available', n.toString())}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition ${form.seats_available === n.toString()
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-gray-100 bg-gray-50 text-gray-500'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-indigo-200 active:scale-95 transition disabled:opacity-60"
        >
          {loading ? 'Saving...' : editId ? '✅ Update Ride' : '🚗 Post Ride Now'}
        </button>
      </div>
    </div>
  );
}
