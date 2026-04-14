export type UserType = 'student' | 'employee';

export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  mobile: string;
  password: string;
  user_type: UserType;
  institution: string;
  year?: string;
  department?: string;
  id_number?: string;
  photo?: string;
  created_at: string;
}

export interface Vehicle {
  model: string;
  number: string;
  type: 'car' | 'bike';
}

export type RideStatus = 'open' | 'confirmed' | 'completed' | 'cancelled';

export interface Ride {
  id: string;
  poster: string;
  from_location: string;
  to_location: string;
  vehicle: Vehicle;
  total_seats: number;
  seats_available: number;
  date: string;
  time: string;
  status: RideStatus;
  created_at: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface RideRequest {
  id: string;
  ride: string;
  requester: string;
  status: RequestStatus;
  created_at: string;
  message?: string;
}

export interface Notification {
  id: string;
  user: string;
  type: 'ride_request' | 'ride_accepted' | 'ride_rejected' | 'ride_reminder';
  title: string;
  message: string;
  read: boolean;
  ride?: string;
  request?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  ride: string;
  sender: string;
  receiver: string;
  text: string;
  created_at: string;
}

