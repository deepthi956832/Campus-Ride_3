import { Home, Search, Plus, Bell, User } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface Props {
  active: 'home' | 'search' | 'post' | 'notifications' | 'profile';
}

export default function BottomNav({ active }: Props) {
  const { navigate, notifications, currentUser } = useAppStore();
  const unread = notifications.filter(n => n.user === currentUser?.id && !n.read).length;

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', page: 'dashboard', special: false, badge: 0 },
    { id: 'search', icon: Search, label: 'Search', page: 'search', special: false, badge: 0 },
    { id: 'post', icon: Plus, label: 'Post', page: 'postRide', special: true, badge: 0 },
    { id: 'notifications', icon: Bell, label: 'Alerts', page: 'notifications', special: false, badge: unread },
    { id: 'profile', icon: User, label: 'Profile', page: 'profile', special: false, badge: 0 },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-6 py-2 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none z-50 transition-colors duration-300">
      {tabs.map(tab => {
        const isActive = active === tab.id;
        const Icon = tab.icon;

        if (tab.special) {
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.page)}
              className="flex flex-col items-center -mt-6"
            >
              <div className="w-14 h-14 bg-[#8b5cf6] rounded-[22px] flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none active:scale-90 transition">
                <Icon size={26} className="text-white" />
              </div>
              <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-[#8b5cf6]' : 'text-[#9ca3af]'}`}>{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.page)}
            className="flex flex-col items-center gap-1 flex-1 relative active:scale-95 transition"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${isActive ? 'text-[#8b5cf6]' : 'text-[#9ca3af]'}`}>
              <Icon size={20} />
              {tab.badge > 0 && (
                <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full text-white text-[8px] font-black flex items-center justify-center">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? 'text-[#8b5cf6]' : 'text-[#9ca3af]'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
