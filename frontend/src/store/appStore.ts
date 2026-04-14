import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, BASE_URL } from '../services/api';
import {
  User, Ride, RideRequest, Notification, ChatMessage, RideStatus
} from '../types';

interface AppState {
  currentUser: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  users: User[];
  rides: Ride[];
  requests: RideRequest[];
  notifications: Notification[];
  chatMessages: ChatMessage[];

  currentPage: string;
  previousPage: string;
  navParam: string | null;
  darkMode: boolean;

  refreshData: () => Promise<void>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  login: (emailOrMobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resendRegisterOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string, purpose?: string) => Promise<boolean>;
  resetPasswordWithOtp: (data: any) => Promise<boolean>;
  resetPassword: (data: any) => Promise<boolean>;
  sendMessage: (rideId: string, receiverId: string, text: string) => Promise<void>;

  navigate: (page: string, param?: string) => void;
  goBack: () => void;

  updateProfile: (data: Partial<User>) => Promise<void>;
  postRide: (ride: Omit<Ride, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  editRide: (id: string, data: Partial<Ride>) => Promise<void>;
  deleteRide: (id: string) => Promise<void>;
  cancelRide: (id: string) => Promise<void>;
  updateRideStatus: (id: string, status: RideStatus) => Promise<void>;
  sendRequest: (rideId: string) => Promise<void>;
  respondRequest: (requestId: string, status: 'accepted' | 'rejected') => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accessToken: null,
      refreshToken: null,
      users: [],
      rides: [],
      requests: [],
      notifications: [],
      chatMessages: [],
      currentPage: 'splash',
      previousPage: 'splash',
      navParam: null,
      darkMode:
        typeof window !== 'undefined'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false,

      refreshData: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const [rides, requests, notifications, chatMessages] = await Promise.all([
            api.get('/rides/', accessToken),
            api.get('/requests/', accessToken),
            api.get('/notifications/', accessToken),
            api.get('/chats/', accessToken),
          ]);

          set({ rides, requests, notifications, chatMessages });
        } catch (error) {
          console.error('Failed to refresh data:', error);
        }
      },

      register: async (userData: any) => {
        try {
          await api.post('/users/register/', userData);
          return { success: true };
        } catch (err: any) {
          console.error('Registration error:', err);

          let errorMsg = 'Registration failed.';
          const responseData = err?.response?.data;

          if (responseData) {
            if (typeof responseData === 'string') {
              errorMsg = responseData;
            } else if (typeof responseData === 'object') {
              errorMsg = Object.entries(responseData)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
                .join(', ');
            }
          } else if (err?.message) {
            errorMsg = err.message;
          }

          window.alert(
            `Registration Error: ${errorMsg}\n\nEndpoint: ${BASE_URL}/users/register/\n\nPlease ensure your backend is accessible at this address.`
          );

          return { success: false, error: errorMsg };
        }
      },

      login: async (emailOrMobile, password) => {
        try {
          let response;

          // First try with username (works with standard SimpleJWT/custom serializer setups)
          try {
            response = await api.post('/auth/login/', {
              username: emailOrMobile,
              password,
            });
          } catch (firstError) {
            // Fallback: try with email in case your serializer expects email
            response = await api.post('/auth/login/', {
              email: emailOrMobile,
              password,
            });
          }

          set({
            accessToken: response.access,
            refreshToken: response.refresh,
          });

          const user = await api.get('/users/me/', response.access);
          set({ currentUser: user });

          await get().refreshData();
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },

      logout: () =>
        set({
          currentUser: null,
          accessToken: null,
          refreshToken: null,
          currentPage: 'login',
          rides: [],
          requests: [],
          notifications: [],
          chatMessages: [],
        }),

      forgotPassword: async (email: string) => {
        try {
          await api.post('/users/forgot_password/', { email });
          return true;
        } catch (err) {
          console.error('Forgot password error:', err);
          return false;
        }
      },

      resendRegisterOtp: async (email: string) => {
        try {
          await api.post('/users/resend_register_otp/', { email });
          return true;
        } catch (err) {
          console.error('Resend OTP error:', err);
          return false;
        }
      },

      verifyOtp: async (email: string, otp: string, purpose?: string) => {
        try {
          await api.post('/users/verify_otp/', { email, otp, purpose });
          return true;
        } catch (err) {
          console.error('OTP verify error:', err);
          return false;
        }
      },

      resetPasswordWithOtp: async (data: any) => {
        try {
          await api.post('/users/reset_password_otp/', data);
          return true;
        } catch (err) {
          console.error('Reset password with OTP error:', err);
          return false;
        }
      },

      // Your backend does not currently expose /users/reset_password/
      // so use the OTP-based reset endpoint for now.
      resetPassword: async (data: any) => {
        try {
          await api.post('/users/reset_password_otp/', data);
          return true;
        } catch (err) {
          console.error('Reset password error:', err);
          return false;
        }
      },

      sendMessage: async (rideId, receiverId, text) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const msg = await api.post(
            '/chats/',
            {
              ride: rideId,
              receiver: receiverId,
              text,
            },
            accessToken
          );

          set((s) => ({ chatMessages: [...s.chatMessages, msg] }));
        } catch (error) {
          console.error('Send message failed:', error);
        }
      },

      updateProfile: async (data) => {
        const { accessToken, currentUser } = get();
        if (!accessToken || !currentUser) return;

        try {
          const updated = await api.patch(`/users/${currentUser.id}/`, data, accessToken);
          set({ currentUser: updated });
        } catch (error) {
          console.error('Profile update failed:', error);
        }
      },

      postRide: async (rideData) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.post('/rides/', rideData, accessToken);
          await get().refreshData();
        } catch (error) {
          console.error('Post ride failed:', error);
        }
      },

      editRide: async (id, data) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.patch(`/rides/${id}/`, data, accessToken);
          await get().refreshData();
        } catch (error) {
          console.error('Edit ride failed:', error);
        }
      },

      updateRideStatus: async (id, status) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.patch(`/rides/${id}/`, { status }, accessToken);
          await get().refreshData();
        } catch (error) {
          console.error('Update status failed:', error);
        }
      },

      deleteRide: async (id) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.delete(`/rides/${id}/`, accessToken);
          await get().refreshData();
        } catch (error) {
          console.error('Delete ride failed:', error);
        }
      },

      cancelRide: async (id) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.post(`/rides/${id}/cancel_ride/`, {}, accessToken);
          await get().refreshData();
        } catch (error) {
          console.error('Cancel ride failed:', error);
        }
      },

      sendRequest: async (rideId) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.post(`/rides/${rideId}/request_join/`, {}, accessToken);
          await get().refreshData();
        } catch (error) {
          console.error('Send request failed:', error);
        }
      },

      respondRequest: async (requestId, status) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.post(`/requests/${requestId}/respond/`, { status }, accessToken);
          await get().refreshData();
        } catch (error) {
          console.error('Respond request failed:', error);
        }
      },

      cancelRequest: async (requestId) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.delete(`/requests/${requestId}/`, accessToken);
          await get().refreshData();
        } catch (error) {
          console.error('Cancel request failed:', error);
        }
      },

      markNotificationRead: async (id) => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.patch(`/notifications/${id}/`, { read: true }, accessToken);
          set((s) => ({
            notifications: s.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          }));
        } catch (error) {
          console.error('Mark read failed:', error);
        }
      },

      markAllRead: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          await api.post('/notifications/mark_all_read/', {}, accessToken);
          set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, read: true })),
          }));
        } catch (error) {
          console.error('Mark all read failed:', error);
        }
      },

      navigate: (page, param) => {
        set((s) => ({
          previousPage: s.currentPage,
          currentPage: page,
          navParam: param || null,
        }));
      },

      goBack: () => {
        set((s) => ({
          currentPage: s.previousPage,
          navParam: null,
        }));
      },

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    {
      name: 'ride-share-v3-api',
      partialize: (state) => ({
        currentUser: state.currentUser,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        darkMode: state.darkMode,
      }),
    }
  )
);