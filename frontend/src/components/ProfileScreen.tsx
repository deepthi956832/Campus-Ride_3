import { useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { ChevronLeft, Camera, LogOut, ChevronRight, User as UserIcon, Mail, Phone, Building2, MapPin, Edit3, Undo2 } from 'lucide-react';
import BottomNav from './BottomNav';
import UserTypeBadge from './UserTypeBadge';

export default function ProfileScreen() {
  const { currentUser, logout, updateProfile, navigate, rides, requests } = useAppStore();
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: currentUser?.full_name || '',
    email: currentUser?.email || '',
    mobile: currentUser?.mobile || '',
    institution: currentUser?.institution || '',
    department: currentUser?.department || '',
    id_number: currentUser?.id_number || '',
  });

  const handlePhotoClick = () => fileInputRef.current?.click();

  const onPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateProfile({ photo: base64 });
    };
    reader.readAsDataURL(file);
  };

  if (!currentUser) return null;

  const myPostedCount = rides.filter(r => 
    r.poster === currentUser.id && (r.status === 'open' || r.status === 'confirmed')
  ).length;

  const myRequestCount = requests.filter(req => {
    if (req.requester !== currentUser.id) return false;
    const ride = rides.find(r => r.id === req.ride);
    return ride && (ride.status === 'open' || ride.status === 'confirmed');
  }).length;

  const handleSave = async () => {
    await updateProfile(form);
    setEditing(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-6 pt-16 pb-6 shadow-sm border-b border-gray-100/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('dashboard')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 active:scale-90 transition hover:bg-gray-100">
              <ChevronLeft size={22} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">My Profile</h1>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              editing ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100'
            }`}
          >
            {editing ? <div className="text-white font-bold text-sm">✓</div> : <Edit3 size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-28">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-28 h-28 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-[32px] p-1 border-2 border-dashed border-indigo-200">
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[28px] flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-200 border-4 border-white overflow-hidden">
                {currentUser.photo ? (
                  <img src={currentUser.photo} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  currentUser.full_name?.[0]?.toUpperCase() || '?'
                )}
              </div>
            </div>
            <button 
              onClick={handlePhotoClick}
              className="absolute -bottom-1 -right-1 w-9 h-9 bg-indigo-500 border-4 border-gray-50 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition hover:bg-indigo-600"
            >
              <Camera size={16} className="text-white" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onPhotoSelect} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
          
          <div className="text-center mt-4">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">{currentUser.full_name}</h2>
            <UserTypeBadge user={currentUser} className="mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rides Posted</p>
            <p className="text-2xl font-black text-indigo-600">{myPostedCount}</p>
          </div>
          <div className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trips Found</p>
            <p className="text-2xl font-black text-purple-600">{myRequestCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-100/50 mb-6">
          <div className="space-y-1">
            {[
              { label: 'Full Name', value: form.full_name, key: 'full_name', icon: <UserIcon size={18} /> },
              { label: 'College Email', value: form.email, key: 'email', icon: <Mail size={18} /> },
              { label: 'Mobile Number', value: form.mobile, key: 'mobile', icon: <Phone size={18} /> },
              { label: 'Institution', value: form.institution, key: 'institution', icon: <Building2 size={18} /> },
              { label: 'Department', value: form.department, key: 'department', icon: <MapPin size={18} /> },
              { label: 'ID Number', value: form.id_number, key: 'id_number', icon: <Hash size={18} /> },
            ].map((item) => (
              <div key={item.key} className={`p-4 transition-all ${editing ? 'bg-indigo-50/30 rounded-2xl mb-1' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editing ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-0.5">{item.label}</p>
                    {editing ? (
                      <input
                        type="text"
                        value={item.value}
                        onChange={e => setForm(f => ({ ...f, [item.key as any]: e.target.value }))}
                        className="w-full bg-transparent text-sm font-bold text-gray-800 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold text-gray-800 truncate">{item.value || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('history')}
          className="w-full flex items-center justify-between p-5 bg-indigo-50 text-indigo-600 rounded-[28px] font-bold text-sm active:scale-[0.98] transition group mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:rotate-12 transition">
              <Undo2 size={20} />
            </div>
            View Trip History
          </div>
          <ChevronRight size={20} className="text-indigo-200" />
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-between p-5 bg-red-50 text-red-600 rounded-[28px] font-bold text-sm active:scale-[0.98] transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 group-hover:rotate-12 transition">
              <LogOut size={20} />
            </div>
            Sign Out Account
          </div>
          <ChevronRight size={20} className="text-red-200" />
        </button>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

const Hash = ({ size, className = '' }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="9" x2="20" y2="9"></line>
    <line x1="4" y1="15" x2="20" y2="15"></line>
    <line x1="10" y1="3" x2="8" y2="21"></line>
    <line x1="16" y1="3" x2="14" y2="21"></line>
  </svg>
);
