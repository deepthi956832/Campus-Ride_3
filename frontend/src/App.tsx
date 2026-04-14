import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { socketService } from './services/socket';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import Dashboard from './components/Dashboard';
import SearchScreen from './components/SearchScreen';
import PostRideScreen from './components/PostRideScreen';
import RideDetailScreen from './components/RideDetailScreen';
import NotificationsScreen from './components/NotificationsScreen';
import ProfileScreen from './components/ProfileScreen';
import MyRidesScreen from './components/MyRidesScreen';
import MyRequestsScreen from './components/MyRequestsScreen';
import ChatScreen from './components/ChatScreen';
import ConfirmedRidesScreen from './components/ConfirmedRidesScreen';
import HistoryScreen from './components/HistoryScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import VerifyEmailScreen from './components/VerifyEmailScreen';
import VerificationPendingScreen from './components/VerificationPendingScreen';
import OTPScreen from './components/OTPScreen';
import ResetPasswordFinalScreen from './components/ResetPasswordFinalScreen';

const SCREEN_MAP: Record<string, React.ComponentType> = {
  splash: SplashScreen,
  login: LoginScreen,
  register: RegisterScreen,
  dashboard: Dashboard,
  search: SearchScreen,
  postRide: PostRideScreen,
  rideDetail: RideDetailScreen,
  notifications: NotificationsScreen,
  profile: ProfileScreen,
  myRides: MyRidesScreen,
  myRequests: MyRequestsScreen,
  chat: ChatScreen,
  confirmed: ConfirmedRidesScreen,
  history: HistoryScreen,
  'forgot-password': ForgotPasswordScreen,
  'reset-password': ResetPasswordScreen,
  'verify-email': VerifyEmailScreen,
  'verify-email-pending': VerificationPendingScreen,
  'otp-verify': OTPScreen,
  'otp-reset': OTPScreen,
  'reset-password-final': ResetPasswordFinalScreen,
};

export function App() {
  const currentPage = useAppStore(s => s.currentPage);
  const currentUser = useAppStore(s => s.currentUser);
  const navigate = useAppStore(s => s.navigate);
  const refreshData = useAppStore(s => s.refreshData);
  const darkMode = useAppStore(s => s.darkMode);

  // Apply dark mode class to root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync data on load if logged in
  useEffect(() => {
    if (currentUser) {
      refreshData();
      
      // Initialize Socket connection
      socketService.connect();

      // Set up real-time listeners
      const handleUpdate = () => {
        console.log('Real-time event received, refreshing data...');
        refreshData();
      };

      socketService.on('new_ride', handleUpdate);
      socketService.on('new_request', handleUpdate);
      socketService.on('ride_accepted', handleUpdate);
      socketService.on('new_message', handleUpdate);
      socketService.on('new_notification', handleUpdate);

      return () => {
        socketService.off('new_ride', handleUpdate);
        socketService.off('new_request', handleUpdate);
        socketService.off('ride_accepted', handleUpdate);
        socketService.off('new_message', handleUpdate);
        socketService.off('new_notification', handleUpdate);
      };
    } else {
      socketService.disconnect();
    }
  }, [currentUser]);

  // Guard: if not logged in and not on auth screens, redirect to login
  useEffect(() => {
    const authScreens = ['splash', 'login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'verify-email-pending', 'otp-verify', 'otp-reset', 'reset-password-final'];
    if (!currentUser && !authScreens.includes(currentPage)) {
      navigate('login');
    }
  }, [currentUser, currentPage]);


  const Screen = SCREEN_MAP[currentPage] ?? LoginScreen;

  return (
    <div className="h-[100dvh] w-full bg-slate-100 dark:bg-slate-950 flex justify-center items-center font-sans">
      <div className="h-full w-full max-w-[800px] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden relative flex flex-col transition-colors duration-300 border-x border-gray-200 dark:border-slate-800">
        <Screen />
      </div>
    </div>
  );
}
