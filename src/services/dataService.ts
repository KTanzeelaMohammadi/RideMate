import {
  ActivityItem,
  AdminOverview,
  DashboardSummary,
  NotificationItem,
  NotificationType,
  Report,
  RequestStatus,
  Ride,
  RideRequest,
  RideRequestForDriver,
  RideRequestForRider,
  RideSearchFilters,
  RideWithDriver,
  ServiceResult,
  User,
  VehicleDetails,
} from '../types/ridemate';
import { storageAdapter } from './storageAdapter';

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function isFutureDateTime(dateStr: string, timeStr: string): boolean {
  if (!dateStr || !timeStr) return false;
  const target = new Date(`${dateStr}T${timeStr}:00`);
  if (Number.isNaN(target.getTime())) return false;
  return target.getTime() > Date.now();
}

function isUpcomingRide(ride: Ride): boolean {
  if (ride.status !== 'open') return false;
  const target = new Date(`${ride.date}T${ride.time}:00`);
  return !Number.isNaN(target.getTime()) && target.getTime() >= Date.now() - 30 * 60 * 1000;
}

function addNotification(
  notifications: NotificationItem[],
  params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    targetPage: NotificationItem['targetPage'];
  }
): void {
  notifications.unshift({
    id: uid('notif'),
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    targetPage: params.targetPage,
    isRead: false,
    createdAt: nowIso(),
  });
}

function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password: _password, ...safe } = user;
  return safe;
}

function enrichRide(ride: Ride, users: User[]): RideWithDriver {
  const driver = users.find((u) => u.id === ride.driverId);
  return {
    ...ride,
    driverName: driver?.name ?? 'Verified Student',
    driverEnrollment: driver?.enrollmentNumber ?? 'UNKNOWN',
    driverDepartment: driver?.department ?? 'Campus Student',
    driverVehicle: driver?.vehicle,
  };
}

export const dataService = {
  getSessionUser(): Omit<User, 'password'> | null {
    const db = storageAdapter.load();
    if (!db.sessionUserId) return null;
    const user = db.users.find((u) => u.id === db.sessionUserId);
    if (!user || user.isBlocked) {
      db.sessionUserId = null;
      storageAdapter.save(db);
      return null;
    }
    return sanitizeUser(user);
  },

  login(emailInput: string, passwordInput: string): ServiceResult<Omit<User, 'password'>> {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;
    if (!email || !password) {
      return { ok: false, error: 'Please enter both your email address and password.' };
    }

    const db = storageAdapter.load();
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user || user.password !== password) {
      return { ok: false, error: 'Invalid email or password. Please verify your credentials.' };
    }
    if (user.isBlocked) {
      return {
        ok: false,
        error: 'This account has been suspended by a Campus Transport Administrator.',
      };
    }

    db.sessionUserId = user.id;
    storageAdapter.save(db);
    return { ok: true, data: sanitizeUser(user) };
  },

  demoLogin(userId: string): ServiceResult<Omit<User, 'password'>> {
    const db = storageAdapter.load();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return { ok: false, error: 'Demo account not found.' };
    }
    if (user.isBlocked) {
      return { ok: false, error: 'This demo account is currently blocked by an administrator.' };
    }
    db.sessionUserId = user.id;
    storageAdapter.save(db);
    return { ok: true, data: sanitizeUser(user) };
  },

  register(input: {
    name: string;
    enrollmentNumber: string;
    email: string;
    phone: string;
    password: string;
    department?: string;
  }): ServiceResult<Omit<User, 'password'>> {
    const name = input.name.trim();
    const enrollmentNumber = input.enrollmentNumber.trim().toUpperCase();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const password = input.password;
    const department = (input.department ?? '').trim() || 'Undergraduate Student';

    if (name.length < 2) {
      return { ok: false, error: 'Full name must be at least 2 characters.' };
    }
    if (!/^[A-Z0-9-]{5,20}$/.test(enrollmentNumber)) {
      return {
        ok: false,
        error: 'Enrollment number must be 5–20 alphanumeric characters (e.g., MU2025CS011).',
      };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Please enter a valid university or personal email address.' };
    }
    if (!/^[+\d][\d\s-]{7,15}$/.test(phone)) {
      return { ok: false, error: 'Please enter a valid phone number (8–16 digits).' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters long.' };
    }

    const db = storageAdapter.load();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, error: 'An account with this email address already exists.' };
    }
    if (db.users.some((u) => u.enrollmentNumber.toUpperCase() === enrollmentNumber)) {
      return { ok: false, error: 'This enrollment number is already registered.' };
    }

    const newUser: User = {
      id: uid('usr'),
      name,
      enrollmentNumber,
      email,
      phone,
      password,
      department,
      role: 'student',
      isBlocked: false,
      createdAt: nowIso(),
    };

    db.users.push(newUser);
    db.sessionUserId = newUser.id;
    storageAdapter.save(db);
    return { ok: true, data: sanitizeUser(newUser) };
  },

  logout(): void {
    const db = storageAdapter.load();
    db.sessionUserId = null;
    storageAdapter.save(db);
  },

  updateProfile(
    userId: string,
    updates: {
      name: string;
      phone: string;
      department: string;
      vehicle?: VehicleDetails;
    }
  ): ServiceResult<Omit<User, 'password'>> {
    const name = updates.name.trim();
    const phone = updates.phone.trim();
    const department = updates.department.trim();

    if (name.length < 2) {
      return { ok: false, error: 'Name must be at least 2 characters.' };
    }
    if (!/^[+\d][\d\s-]{7,15}$/.test(phone)) {
      return { ok: false, error: 'Please provide a valid phone number.' };
    }

    const db = storageAdapter.load();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      return { ok: false, error: 'User account not found.' };
    }

    const hasVehicleInput =
      updates.vehicle &&
      (updates.vehicle.makeModel.trim() ||
        updates.vehicle.color.trim() ||
        updates.vehicle.plateNumber.trim());

    let cleanVehicle: VehicleDetails | undefined;
    if (hasVehicleInput && updates.vehicle) {
      if (!updates.vehicle.makeModel.trim() || !updates.vehicle.plateNumber.trim()) {
        return {
          ok: false,
          error: 'Please enter both vehicle make/model and license plate, or leave all vehicle fields blank.',
        };
      }
      cleanVehicle = {
        makeModel: updates.vehicle.makeModel.trim(),
        color: updates.vehicle.color.trim() || 'Unspecified',
        plateNumber: updates.vehicle.plateNumber.trim().toUpperCase(),
      };
    }

    db.users[idx] = {
      ...db.users[idx],
      name,
      phone,
      department: department || db.users[idx].department,
      vehicle: cleanVehicle,
    };

    storageAdapter.save(db);
    return { ok: true, data: sanitizeUser(db.users[idx]) };
  },

  getDashboardSummary(userId: string): DashboardSummary {
    const db = storageAdapter.load();
    const myOfferedRides = db.rides.filter((r) => r.driverId === userId && r.status !== 'removed');
    const myAcceptedRequests = db.requests.filter(
      (req) => req.riderId === userId && req.status === 'accepted'
    );

    let seatsFilledAsDriver = 0;
    let fareSharedAsDriver = 0;
    for (const ride of myOfferedRides) {
      if (ride.status === 'cancelled') continue;
      const acceptedOnRide = db.requests.filter(
        (req) => req.rideId === ride.id && req.status === 'accepted'
      );
      const seats = acceptedOnRide.reduce((sum, req) => sum + req.seatsRequested, 0);
      seatsFilledAsDriver += seats;
      fareSharedAsDriver += seats * ride.farePerSeat;
    }

    let fareContributedAsRider = 0;
    let seatsJoinedCount = 0;
    const upcomingJoinedRides: RideRequestForRider[] = [];

    for (const req of myAcceptedRequests) {
      const ride = db.rides.find((r) => r.id === req.rideId);
      if (!ride || ride.status === 'cancelled' || ride.status === 'removed') continue;
      seatsJoinedCount += 1;
      fareContributedAsRider += req.seatsRequested * ride.farePerSeat;
      if (isUpcomingRide(ride)) {
        const driver = db.users.find((u) => u.id === ride.driverId);
        upcomingJoinedRides.push({
          ...req,
          ride: enrichRide(ride, db.users),
          driverPhone: driver?.phone,
        });
      }
    }

    const upcomingDriverRides = myOfferedRides
      .filter((r) => isUpcomingRide(r))
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

    upcomingJoinedRides.sort((a, b) =>
      `${a.ride.date}T${a.ride.time}`.localeCompare(`${b.ride.date}T${b.ride.time}`)
    );

    const userNotifications = db.notifications.filter((n) => n.userId === userId).slice(0, 6);
    const recentActivity: ActivityItem[] = userNotifications.map((n) => ({
      id: n.id,
      label: n.title,
      detail: n.message,
      timestamp: n.createdAt,
      targetPage: n.targetPage,
    }));

    return {
      ridesOffered: myOfferedRides.filter((r) => r.status !== 'cancelled').length,
      ridesJoined: seatsJoinedCount,
      seatsFilled: seatsFilledAsDriver,
      totalFareShared: fareSharedAsDriver + fareContributedAsRider,
      upcomingDriverRides,
      upcomingJoinedRides,
      recentActivity,
    };
  },

  searchRides(filters: RideSearchFilters): RideWithDriver[] {
    const db = storageAdapter.load();
    const srcQuery = filters.source.trim().toLowerCase();
    const dstQuery = filters.destination.trim().toLowerCase();
    const dateQuery = filters.date.trim();

    return db.rides
      .filter((ride) => {
        if (ride.status !== 'open') return false;
        if (!isUpcomingRide(ride)) return false;
        const driver = db.users.find((u) => u.id === ride.driverId);
        if (driver?.isBlocked) return false;
        if (srcQuery && !ride.source.toLowerCase().includes(srcQuery)) return false;
        if (dstQuery && !ride.destination.toLowerCase().includes(dstQuery)) return false;
        if (dateQuery && ride.date !== dateQuery) return false;
        return true;
      })
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
      .map((ride) => enrichRide(ride, db.users));
  },

  createRide(
    driverId: string,
    input: {
      source: string;
      destination: string;
      date: string;
      time: string;
      totalSeats: number;
      farePerSeat: number;
      notes?: string;
    }
  ): ServiceResult<Ride> {
    const source = input.source.trim();
    const destination = input.destination.trim();
    const date = input.date.trim();
    const time = input.time.trim();
    const totalSeats = Number(input.totalSeats);
    const farePerSeat = Number(input.farePerSeat);
    const notes = (input.notes ?? '').trim();

    if (source.length < 3) {
      return { ok: false, error: 'Please enter a valid pickup source location.' };
    }
    if (destination.length < 3) {
      return { ok: false, error: 'Please enter a valid destination location.' };
    }
    if (source.toLowerCase() === destination.toLowerCase()) {
      return { ok: false, error: 'Source and destination cannot be the same location.' };
    }
    if (!date || !time) {
      return { ok: false, error: 'Departure date and time are required.' };
    }
    if (!isFutureDateTime(date, time)) {
      return { ok: false, error: 'Departure date and time must be in the future.' };
    }
    if (!Number.isInteger(totalSeats) || totalSeats < 1 || totalSeats > 6) {
      return { ok: false, error: 'Available seats must be a whole number between 1 and 6.' };
    }
    if (Number.isNaN(farePerSeat) || farePerSeat < 0) {
      return { ok: false, error: 'Cost-sharing fare per seat cannot be negative.' };
    }

    const db = storageAdapter.load();
    const driver = db.users.find((u) => u.id === driverId);
    if (!driver || driver.isBlocked) {
      return { ok: false, error: 'Only active users can publish a ride.' };
    }

    const newRide: Ride = {
      id: uid('ride'),
      driverId,
      source,
      destination,
      date,
      time,
      totalSeats,
      availableSeats: totalSeats,
      farePerSeat: Math.round(farePerSeat),
      notes: notes || undefined,
      status: 'open',
      createdAt: nowIso(),
    };

    db.rides.unshift(newRide);
    storageAdapter.save(db);
    return { ok: true, data: newRide };
  },

  requestSeats(
    riderId: string,
    input: {
      rideId: string;
      seatsRequested: number;
      pickupNote?: string;
    }
  ): ServiceResult<RideRequest> {
    const seatsRequested = Number(input.seatsRequested);
    const db = storageAdapter.load();

    const rider = db.users.find((u) => u.id === riderId);
    if (!rider || rider.isBlocked) {
      return { ok: false, error: 'Your account is not permitted to request rides.' };
    }

    const ride = db.rides.find((r) => r.id === input.rideId);
    if (!ride) {
      return { ok: false, error: 'Ride not found.' };
    }
    if (ride.driverId === riderId) {
      return { ok: false, error: 'You cannot request seats on your own ride.' };
    }
    if (ride.status !== 'open' || !isUpcomingRide(ride)) {
      return { ok: false, error: 'This ride is no longer open for requests.' };
    }
    if (!Number.isInteger(seatsRequested) || seatsRequested < 1) {
      return { ok: false, error: 'Please request at least 1 seat.' };
    }
    if (ride.availableSeats <= 0) {
      return { ok: false, error: 'No seats remain on this ride.' };
    }
    if (seatsRequested > ride.availableSeats) {
      return {
        ok: false,
        error: `Only ${ride.availableSeats} seat${ride.availableSeats === 1 ? '' : 's'} available on this ride.`,
      };
    }

    const duplicateActive = db.requests.find(
      (req) =>
        req.rideId === ride.id &&
        req.riderId === riderId &&
        (req.status === 'pending' || req.status === 'accepted')
    );
    if (duplicateActive) {
      return {
        ok: false,
        error: `You already have an active (${duplicateActive.status}) request for this ride.`,
      };
    }

    const newRequest: RideRequest = {
      id: uid('req'),
      rideId: ride.id,
      riderId,
      seatsRequested,
      pickupNote: input.pickupNote?.trim() || undefined,
      status: 'pending',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    db.requests.unshift(newRequest);
    addNotification(db.notifications, {
      userId: ride.driverId,
      type: 'request_received',
      title: 'New Seat Request',
      message: `${rider.name} requested ${seatsRequested} seat${seatsRequested > 1 ? 's' : ''} for ${ride.source} → ${ride.destination}.`,
      targetPage: 'my-rides',
    });

    storageAdapter.save(db);
    return { ok: true, data: newRequest };
  },

  getDriverRidesWithRequests(driverId: string): Array<{
    ride: Ride;
    requests: RideRequestForDriver[];
  }> {
    const db = storageAdapter.load();
    const myRides = db.rides
      .filter((r) => r.driverId === driverId && r.status !== 'removed')
      .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));

    return myRides.map((ride) => {
      const rideRequests = db.requests
        .filter((req) => req.rideId === ride.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((req): RideRequestForDriver => {
          const rider = db.users.find((u) => u.id === req.riderId);
          return {
            ...req,
            riderName: rider?.name ?? 'Student',
            riderEnrollment: rider?.enrollmentNumber ?? 'UNKNOWN',
            riderDepartment: rider?.department ?? 'Campus Student',
            riderPhone: req.status === 'accepted' ? rider?.phone : undefined,
          };
        });
      return { ride, requests: rideRequests };
    });
  },

  acceptRequest(driverId: string, requestId: string): ServiceResult {
    const db = storageAdapter.load();
    const reqIdx = db.requests.findIndex((r) => r.id === requestId);
    if (reqIdx === -1) {
      return { ok: false, error: 'Ride request not found.' };
    }

    const request = db.requests[reqIdx];
    const rideIdx = db.rides.findIndex((r) => r.id === request.rideId);
    if (rideIdx === -1) {
      return { ok: false, error: 'Associated ride not found.' };
    }

    const ride = db.rides[rideIdx];
    if (ride.driverId !== driverId) {
      return { ok: false, error: 'Only the ride owner can manage requests for this ride.' };
    }
    if (ride.status !== 'open') {
      return { ok: false, error: 'Cannot accept requests on a closed or cancelled ride.' };
    }
    if (request.status !== 'pending') {
      return { ok: false, error: `Request is already ${request.status}.` };
    }
    if (ride.availableSeats - request.seatsRequested < 0) {
      return {
        ok: false,
        error: `Not enough seats left (${ride.availableSeats} remaining, ${request.seatsRequested} requested).`,
      };
    }

    db.rides[rideIdx] = {
      ...ride,
      availableSeats: ride.availableSeats - request.seatsRequested,
    };
    db.requests[reqIdx] = {
      ...request,
      status: 'accepted',
      updatedAt: nowIso(),
    };

    const driver = db.users.find((u) => u.id === driverId);
    addNotification(db.notifications, {
      userId: request.riderId,
      type: 'request_accepted',
      title: 'Seat Request Accepted',
      message: `${driver?.name ?? 'Your driver'} accepted ${request.seatsRequested} seat${request.seatsRequested > 1 ? 's' : ''} for ${ride.source} → ${ride.destination}. Contact details are now available in My Requests.`,
      targetPage: 'my-requests',
    });

    storageAdapter.save(db);
    return { ok: true };
  },

  rejectRequest(driverId: string, requestId: string): ServiceResult {
    const db = storageAdapter.load();
    const reqIdx = db.requests.findIndex((r) => r.id === requestId);
    if (reqIdx === -1) {
      return { ok: false, error: 'Ride request not found.' };
    }

    const request = db.requests[reqIdx];
    const ride = db.rides.find((r) => r.id === request.rideId);
    if (!ride) {
      return { ok: false, error: 'Associated ride not found.' };
    }
    if (ride.driverId !== driverId) {
      return { ok: false, error: 'Only the ride owner can manage requests for this ride.' };
    }
    if (request.status !== 'pending') {
      return { ok: false, error: `Only pending requests can be rejected.` };
    }

    db.requests[reqIdx] = {
      ...request,
      status: 'rejected',
      updatedAt: nowIso(),
    };

    const driver = db.users.find((u) => u.id === driverId);
    addNotification(db.notifications, {
      userId: request.riderId,
      type: 'request_rejected',
      title: 'Seat Request Declined',
      message: `${driver?.name ?? 'The driver'} could not accommodate your request for ${ride.source} → ${ride.destination}.`,
      targetPage: 'my-requests',
    });

    storageAdapter.save(db);
    return { ok: true };
  },

  cancelRide(driverId: string, rideId: string): ServiceResult {
    const db = storageAdapter.load();
    const rideIdx = db.rides.findIndex((r) => r.id === rideId);
    if (rideIdx === -1) {
      return { ok: false, error: 'Ride not found.' };
    }
    const ride = db.rides[rideIdx];
    if (ride.driverId !== driverId) {
      return { ok: false, error: 'Only the ride owner can cancel this ride.' };
    }
    if (ride.status !== 'open') {
      return { ok: false, error: `Ride is already ${ride.status}.` };
    }

    db.rides[rideIdx] = {
      ...ride,
      status: 'cancelled',
    };

    const driver = db.users.find((u) => u.id === driverId);
    db.requests = db.requests.map((req) => {
      if (req.rideId === rideId && (req.status === 'pending' || req.status === 'accepted')) {
        addNotification(db.notifications, {
          userId: req.riderId,
          type: 'ride_cancelled',
          title: 'Ride Cancelled by Driver',
          message: `${driver?.name ?? 'The driver'} cancelled the ride ${ride.source} → ${ride.destination} scheduled for ${ride.date}.`,
          targetPage: 'my-requests',
        });
        return { ...req, status: 'cancelled' as RequestStatus, updatedAt: nowIso() };
      }
      return req;
    });

    storageAdapter.save(db);
    return { ok: true };
  },

  completeRide(driverId: string, rideId: string): ServiceResult {
    const db = storageAdapter.load();
    const rideIdx = db.rides.findIndex((r) => r.id === rideId);
    if (rideIdx === -1) {
      return { ok: false, error: 'Ride not found.' };
    }
    const ride = db.rides[rideIdx];
    if (ride.driverId !== driverId) {
      return { ok: false, error: 'Only the ride owner can complete this ride.' };
    }
    if (ride.status !== 'open') {
      return { ok: false, error: `Only open rides can be marked completed.` };
    }

    db.rides[rideIdx] = {
      ...ride,
      status: 'completed',
    };

    db.requests = db.requests.map((req) => {
      if (req.rideId === rideId && req.status === 'pending') {
        return { ...req, status: 'rejected' as RequestStatus, updatedAt: nowIso() };
      }
      if (req.rideId === rideId && req.status === 'accepted') {
        addNotification(db.notifications, {
          userId: req.riderId,
          type: 'ride_completed',
          title: 'Ride Marked Completed',
          message: `Your trip ${ride.source} → ${ride.destination} has been marked completed.`,
          targetPage: 'my-requests',
        });
      }
      return req;
    });

    storageAdapter.save(db);
    return { ok: true };
  },

  getMyRequests(riderId: string): RideRequestForRider[] {
    const db = storageAdapter.load();
    return db.requests
      .filter((req) => req.riderId === riderId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((req): RideRequestForRider | null => {
        const ride = db.rides.find((r) => r.id === req.rideId);
        if (!ride) return null;
        const driver = db.users.find((u) => u.id === ride.driverId);
        // CRITICAL PRIVACY RULE: Only expose driverPhone when request.status === 'accepted'
        return {
          ...req,
          ride: enrichRide(ride, db.users),
          driverPhone: req.status === 'accepted' ? driver?.phone : undefined,
        };
      })
      .filter((item): item is RideRequestForRider => item !== null);
  },

  cancelMyRequest(riderId: string, requestId: string): ServiceResult {
    const db = storageAdapter.load();
    const reqIdx = db.requests.findIndex((r) => r.id === requestId);
    if (reqIdx === -1) {
      return { ok: false, error: 'Request not found.' };
    }
    const req = db.requests[reqIdx];
    if (req.riderId !== riderId) {
      return { ok: false, error: 'You can only cancel your own requests.' };
    }
    if (req.status !== 'pending' && req.status !== 'accepted') {
      return { ok: false, error: `Cannot cancel a request that is already ${req.status}.` };
    }

    const rideIdx = db.rides.findIndex((r) => r.id === req.rideId);
    const wasAccepted = req.status === 'accepted';
    if (wasAccepted && rideIdx !== -1) {
      const ride = db.rides[rideIdx];
      if (ride.status === 'open') {
        const restored = Math.min(ride.totalSeats, ride.availableSeats + req.seatsRequested);
        db.rides[rideIdx] = { ...ride, availableSeats: restored };
      }
    }

    db.requests[reqIdx] = {
      ...req,
      status: 'cancelled',
      updatedAt: nowIso(),
    };

    if (rideIdx !== -1) {
      const ride = db.rides[rideIdx];
      const rider = db.users.find((u) => u.id === riderId);
      addNotification(db.notifications, {
        userId: ride.driverId,
        type: 'request_cancelled',
        title: 'Passenger Cancelled Request',
        message: `${rider?.name ?? 'A student'} cancelled their ${wasAccepted ? 'accepted ' : ''}request for ${ride.source} → ${ride.destination}.`,
        targetPage: 'my-rides',
      });
    }

    storageAdapter.save(db);
    return { ok: true };
  },

  getNotifications(userId: string): NotificationItem[] {
    const db = storageAdapter.load();
    return db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getUnreadNotificationCount(userId: string): number {
    const db = storageAdapter.load();
    return db.notifications.filter((n) => n.userId === userId && !n.isRead).length;
  },

  markNotificationRead(userId: string, notificationId: string): void {
    const db = storageAdapter.load();
    db.notifications = db.notifications.map((n) =>
      n.id === notificationId && n.userId === userId ? { ...n, isRead: true } : n
    );
    storageAdapter.save(db);
  },

  markAllNotificationsRead(userId: string): void {
    const db = storageAdapter.load();
    db.notifications = db.notifications.map((n) =>
      n.userId === userId ? { ...n, isRead: true } : n
    );
    storageAdapter.save(db);
  },

  submitReport(
    reporterId: string,
    input: {
      targetRideId?: string;
      reason: string;
      details: string;
    }
  ): ServiceResult<Report> {
    const reason = input.reason.trim();
    const details = input.details.trim();
    if (!reason || details.length < 10) {
      return {
        ok: false,
        error: 'Please select a reason and enter at least 10 characters describing the issue.',
      };
    }

    const db = storageAdapter.load();
    const reporter = db.users.find((u) => u.id === reporterId);
    if (!reporter || reporter.isBlocked) {
      return { ok: false, error: 'Unable to submit report.' };
    }

    const targetRide = input.targetRideId
      ? db.rides.find((r) => r.id === input.targetRideId)
      : undefined;
    const targetDriver = targetRide
      ? db.users.find((u) => u.id === targetRide.driverId)
      : undefined;

    const newReport: Report = {
      id: uid('rep'),
      reporterId,
      reporterName: reporter.name,
      targetRideId: targetRide?.id,
      targetRideSummary: targetRide
        ? `${targetRide.source} → ${targetRide.destination} (${targetRide.date})`
        : undefined,
      targetUserId: targetDriver?.id,
      targetUserName: targetDriver?.name,
      reason,
      details,
      status: 'open',
      createdAt: nowIso(),
    };

    db.reports.unshift(newReport);
    storageAdapter.save(db);
    return { ok: true, data: newReport };
  },

  getAdminOverview(adminId: string): ServiceResult<AdminOverview> {
    const db = storageAdapter.load();
    const admin = db.users.find((u) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      return { ok: false, error: 'Unauthorized: Admin privileges required.' };
    }

    const activeRides = db.rides.filter((r) => r.status !== 'removed');
    const enrichedRides = activeRides
      .map((ride) => ({
        ...enrichRide(ride, db.users),
        requestCount: db.requests.filter((req) => req.rideId === ride.id).length,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      ok: true,
      data: {
        totalUsers: db.users.length,
        totalRides: activeRides.length,
        totalRequests: db.requests.length,
        openReports: db.reports.filter((r) => r.status === 'open').length,
        totalReports: db.reports.length,
        users: db.users.map(sanitizeUser),
        rides: enrichedRides,
        reports: [...db.reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      },
    };
  },

  toggleBlockUser(adminId: string, targetUserId: string): ServiceResult<{ isBlocked: boolean }> {
    const db = storageAdapter.load();
    const admin = db.users.find((u) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      return { ok: false, error: 'Unauthorized: Only administrators can block or unblock users.' };
    }
    if (adminId === targetUserId) {
      return { ok: false, error: 'You cannot block your own administrator account.' };
    }

    const userIdx = db.users.findIndex((u) => u.id === targetUserId);
    if (userIdx === -1) {
      return { ok: false, error: 'User not found.' };
    }

    const nextBlocked = !db.users[userIdx].isBlocked;
    db.users[userIdx] = { ...db.users[userIdx], isBlocked: nextBlocked };

    if (nextBlocked) {
      // Cancel open rides owned by the blocked user
      db.rides = db.rides.map((r) =>
        r.driverId === targetUserId && r.status === 'open' ? { ...r, status: 'cancelled' } : r
      );
    }

    storageAdapter.save(db);
    return { ok: true, data: { isBlocked: nextBlocked } };
  },

  adminRemoveRide(adminId: string, rideId: string): ServiceResult {
    const db = storageAdapter.load();
    const admin = db.users.find((u) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      return { ok: false, error: 'Unauthorized: Only administrators can remove rides.' };
    }

    const rideIdx = db.rides.findIndex((r) => r.id === rideId);
    if (rideIdx === -1) {
      return { ok: false, error: 'Ride not found.' };
    }
    const ride = db.rides[rideIdx];
    db.rides[rideIdx] = { ...ride, status: 'removed' };

    addNotification(db.notifications, {
      userId: ride.driverId,
      type: 'ride_removed',
      title: 'Ride Removed by Administrator',
      message: `Your listing ${ride.source} → ${ride.destination} (${ride.date}) was removed by campus transport moderation.`,
      targetPage: 'my-rides',
    });

    db.requests = db.requests.map((req) => {
      if (req.rideId === rideId && (req.status === 'pending' || req.status === 'accepted')) {
        addNotification(db.notifications, {
          userId: req.riderId,
          type: 'ride_removed',
          title: 'Ride Listing Removed',
          message: `The ride ${ride.source} → ${ride.destination} was removed by an administrator.`,
          targetPage: 'my-requests',
        });
        return { ...req, status: 'cancelled' as RequestStatus, updatedAt: nowIso() };
      }
      return req;
    });

    storageAdapter.save(db);
    return { ok: true };
  },

  resolveReport(
    adminId: string,
    reportId: string,
    status: 'resolved' | 'dismissed',
    adminNote: string
  ): ServiceResult {
    const db = storageAdapter.load();
    const admin = db.users.find((u) => u.id === adminId);
    if (!admin || admin.role !== 'admin') {
      return { ok: false, error: 'Unauthorized: Only administrators can resolve reports.' };
    }

    const idx = db.reports.findIndex((r) => r.id === reportId);
    if (idx === -1) {
      return { ok: false, error: 'Report not found.' };
    }

    const report = db.reports[idx];
    db.reports[idx] = {
      ...report,
      status,
      adminNote: adminNote.trim() || `Marked as ${status} by administrator.`,
      resolvedAt: nowIso(),
    };

    addNotification(db.notifications, {
      userId: report.reporterId,
      type: 'report_resolved',
      title: 'Safety Report Updated',
      message: `Your report ("${report.reason}") was marked ${status}.`,
      targetPage: 'notifications',
    });

    storageAdapter.save(db);
    return { ok: true };
  },

  getUserCountsForAssistant(userId: string): {
    openOffered: number;
    pendingIncoming: number;
    pendingOutgoing: number;
    acceptedOutgoing: number;
  } {
    const db = storageAdapter.load();
    const openRides = db.rides.filter((r) => r.driverId === userId && r.status === 'open');
    const openRideIds = new Set(openRides.map((r) => r.id));
    const pendingIncoming = db.requests.filter(
      (req) => openRideIds.has(req.rideId) && req.status === 'pending'
    ).length;
    const pendingOutgoing = db.requests.filter(
      (req) => req.riderId === userId && req.status === 'pending'
    ).length;
    const acceptedOutgoing = db.requests.filter(
      (req) => req.riderId === userId && req.status === 'accepted'
    ).length;

    return {
      openOffered: openRides.length,
      pendingIncoming,
      pendingOutgoing,
      acceptedOutgoing,
    };
  },

  resetDemoDatabase(): void {
    storageAdapter.reset();
  },
};
