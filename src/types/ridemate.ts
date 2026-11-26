export type UserRole = 'student' | 'admin';

export interface VehicleDetails {
  makeModel: string;
  color: string;
  plateNumber: string;
}

export interface User {
  id: string;
  name: string;
  enrollmentNumber: string;
  email: string;
  phone: string;
  password: string; // Stored for demo localStorage MVP only; replace with Supabase Auth in production
  department: string;
  role: UserRole;
  isBlocked: boolean;
  vehicle?: VehicleDetails;
  createdAt: string;
}

export type PublicUser = Omit<User, 'password' | 'phone'>;

export type RideStatus = 'open' | 'completed' | 'cancelled' | 'removed';

export interface Ride {
  id: string;
  driverId: string;
  source: string;
  destination: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  totalSeats: number;
  availableSeats: number;
  farePerSeat: number;
  notes?: string;
  status: RideStatus;
  createdAt: string;
}

export interface RideWithDriver extends Ride {
  driverName: string;
  driverEnrollment: string;
  driverDepartment: string;
  driverVehicle?: VehicleDetails;
  // Note: driverPhone is intentionally omitted from public ride listings
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface RideRequest {
  id: string;
  rideId: string;
  riderId: string;
  seatsRequested: number;
  pickupNote?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RideRequestForDriver extends RideRequest {
  riderName: string;
  riderEnrollment: string;
  riderDepartment: string;
  // Phone revealed to driver only once accepted
  riderPhone?: string;
}

export interface RideRequestForRider extends RideRequest {
  ride: RideWithDriver;
  // Phone revealed to rider ONLY when status === 'accepted'
  driverPhone?: string;
}

export type NotificationType =
  | 'request_received'
  | 'request_accepted'
  | 'request_rejected'
  | 'request_cancelled'
  | 'ride_cancelled'
  | 'ride_completed'
  | 'ride_removed'
  | 'report_resolved';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  targetPage: AppPage;
  isRead: boolean;
  createdAt: string;
}

export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetRideId?: string;
  targetRideSummary?: string;
  targetUserId?: string;
  targetUserName?: string;
  reason: string;
  details: string;
  status: ReportStatus;
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ActivityItem {
  id: string;
  label: string;
  detail: string;
  timestamp: string;
  targetPage: AppPage;
}

export interface DashboardSummary {
  ridesOffered: number;
  ridesJoined: number;
  seatsFilled: number;
  totalFareShared: number;
  upcomingDriverRides: Ride[];
  upcomingJoinedRides: RideRequestForRider[];
  recentActivity: ActivityItem[];
}

export interface AdminOverview {
  totalUsers: number;
  totalRides: number;
  totalRequests: number;
  openReports: number;
  totalReports: number;
  users: Omit<User, 'password'>[];
  rides: (RideWithDriver & { requestCount: number })[];
  reports: Report[];
}

export type AppPage =
  | 'dashboard'
  | 'find-ride'
  | 'offer-ride'
  | 'my-rides'
  | 'my-requests'
  | 'notifications'
  | 'profile'
  | 'assistant'
  | 'admin';

export interface RideSearchFilters {
  source: string;
  destination: string;
  date: string;
}

export interface RideMateDatabase {
  users: User[];
  rides: Ride[];
  requests: RideRequest[];
  notifications: NotificationItem[];
  reports: Report[];
  sessionUserId: string | null;
}

export interface ServiceResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}
