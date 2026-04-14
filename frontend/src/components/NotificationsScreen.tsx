import { useAppStore } from '../store/appStore';
import { ChevronLeft, Bell, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function NotificationsScreen() {
  const { notifications, markNotificationRead, navigate, currentUser } = useAppStore();
  if (!currentUser) return null;

  const myNotifications = notifications.filter(n => n.user === currentUser.id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ride_request': return <MessageSquare className="text-indigo-500" size={18} />;
      case 'ride_accepted': return <CheckCircle className="text-green-500" size={18} />;
      case 'ride_rejected': return <XCircle className="text-red-500" size={18} />;
      case 'ride_reminder': return <Clock className="text-amber-500" size={18} />;
      default: return <Bell className="text-gray-500" size={18} />;
    }
  };

  const handleClick = (n: any) => {
    markNotificationRead(n.id);
    if (n.ride) {
      navigate('rideDetail', n.ride);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm border-b border-gray-100/50 flex items-center gap-3">
        <button onClick={() => navigate('dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 active:scale-90 transition">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {myNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 opacity-40">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
               <Bell size={40} />
             </div>
             <p className="text-gray-600 font-bold">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myNotifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full p-4 rounded-3xl text-left transition-all active:scale-[0.98] border flex items-start gap-4 ${
                  n.read ? 'bg-white border-transparent' : 'bg-white border-indigo-200 shadow-lg shadow-indigo-100/50 scale-[1.02]'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  n.read ? 'bg-gray-50' : 'bg-indigo-50'
                }`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                     <p className={`text-sm font-black truncate ${n.read ? 'text-gray-700' : 'text-indigo-600'}`}>{n.title}</p>
                     {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />}
                  </div>
                  <p className="text-xs font-bold text-gray-500 leading-relaxed mb-3">{n.message}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
