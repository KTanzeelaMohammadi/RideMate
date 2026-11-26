import { RideMateDatabase } from '../types/ridemate';

function formatDateOffset(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

export interface LocationGroup {
  category: string;
  locations: string[];
}

export const LOCATION_GROUPS: LocationGroup[] = [
  {
    category: 'ON-CAMPUS',
    locations: ['Hostel A', 'Hostel B', 'Hostel C', 'Hostel D'],
  },
  {
    category: 'OFF-CAMPUS',
    locations: [
      'Nageshwar City',
      'Galaxy Hostel',
      'Shivay Hostel',
      'Utkarsh Boys Hostel',
      'RCP Apartments',
      'Crystal Avenue',
      'Ishvar Heights',
      'Prabhudwar Residency',
      'Rajkot International School',
      'Krishna International School',
    ],
  },
  {
    category: 'OTHER DESTINATIONS',
    locations: [
      'Marwadi University Main Gate',
      'Marwadi University Main Building',
      'Rajkot Railway Station',
      'Rajkot Bus Station',
      'Rajkot Airport',
      'Madhapar Chowk',
      'Gondal Chowkdi',
      '150 Feet Ring Road',
      'Kalawad Road',
      'Morbi',
      'Gondal',
      'Wankaner',
    ],
  },
];

export const CAMPUS_LOCATIONS: string[] = LOCATION_GROUPS.flatMap(
  (group) => group.locations
);

export function createInitialSeedDatabase(): RideMateDatabase {
  const tomorrow = formatDateOffset(1);
  const dayAfter = formatDateOffset(2);
  const threeDays = formatDateOffset(3);
  const yesterday = formatDateOffset(-2);
  const lastWeek = formatDateOffset(-5);

  return {
    sessionUserId: null,
    users: [
      {
        id: 'usr-aarav',
        name: 'Aarav Mehta',
        enrollmentNumber: 'MU2024CS042',
        email: 'aarav.mehta@campus.edu',
        phone: '+91 98250 44120',
        password: 'Student@123',
        department: 'Computer Science · Year 3',
        role: 'student',
        isBlocked: false,
        vehicle: {
          makeModel: 'Honda Civic Sedan',
          color: 'Forest Green',
          plateNumber: 'GJ-03-RM-4182',
        },
        createdAt: isoHoursAgo(240),
      },
      {
        id: 'usr-maya',
        name: 'Maya Patel',
        enrollmentNumber: 'MU2024EC019',
        email: 'maya.patel@campus.edu',
        phone: '+91 98791 30284',
        password: 'Student@123',
        department: 'Electronics & Comm · Year 2',
        role: 'student',
        isBlocked: false,
        createdAt: isoHoursAgo(220),
      },
      {
        id: 'usr-rohan',
        name: 'Rohan Deshmukh',
        enrollmentNumber: 'MU2023ME088',
        email: 'rohan.d@campus.edu',
        phone: '+91 97120 65891',
        password: 'Student@123',
        department: 'Mechanical Eng · Year 4',
        role: 'student',
        isBlocked: false,
        vehicle: {
          makeModel: 'Hyundai i20 Hatchback',
          color: 'Warm Silver',
          plateNumber: 'GJ-03-AB-7740',
        },
        createdAt: isoHoursAgo(200),
      },
      {
        id: 'usr-sana',
        name: 'Sana Khan',
        enrollmentNumber: 'MU2025BA014',
        email: 'sana.khan@campus.edu',
        phone: '+91 99094 11852',
        password: 'Student@123',
        department: 'Business Analytics · Year 1',
        role: 'student',
        isBlocked: false,
        vehicle: {
          makeModel: 'Maruti Baleno',
          color: 'Pearl White',
          plateNumber: 'GJ-03-CD-2905',
        },
        createdAt: isoHoursAgo(180),
      },
      {
        id: 'usr-admin',
        name: 'Dr. Kavita Nair',
        enrollmentNumber: 'ADMIN-TRANSPORT-01',
        email: 'admin@campus.edu',
        phone: '+91 98250 10001',
        password: 'Admin@123',
        department: 'Campus Mobility Office',
        role: 'admin',
        isBlocked: false,
        createdAt: isoHoursAgo(500),
      },
    ],
    rides: [
      {
        id: 'ride-101',
        driverId: 'usr-aarav',
        source: 'Nageshwar City',
        destination: 'Marwadi University Main Gate',
        date: tomorrow,
        time: '08:30',
        totalSeats: 3,
        availableSeats: 2,
        farePerSeat: 45,
        notes: 'Leaving promptly from Nageshwar City main circle. Space for backpacks in the trunk.',
        status: 'open',
        createdAt: isoHoursAgo(14),
      },
      {
        id: 'ride-102',
        driverId: 'usr-rohan',
        source: 'Hostel C',
        destination: 'Rajkot Railway Station',
        date: tomorrow,
        time: '17:15',
        totalSeats: 4,
        availableSeats: 3,
        farePerSeat: 60,
        notes: 'Direct route via Madhapar Chowk after afternoon lab.',
        status: 'open',
        createdAt: isoHoursAgo(10),
      },
      {
        id: 'ride-103',
        driverId: 'usr-sana',
        source: 'Crystal Avenue',
        destination: 'Marwadi University Main Building',
        date: dayAfter,
        time: '09:00',
        totalSeats: 3,
        availableSeats: 3,
        farePerSeat: 35,
        notes: 'Quiet morning commute via 150 Feet Ring Road, AC on.',
        status: 'open',
        createdAt: isoHoursAgo(8),
      },
      {
        id: 'ride-104',
        driverId: 'usr-rohan',
        source: 'RCP Apartments',
        destination: 'Rajkot Airport',
        date: threeDays,
        time: '10:00',
        totalSeats: 3,
        availableSeats: 2,
        farePerSeat: 80,
        notes: 'For students heading to the new airport terminal.',
        status: 'open',
        createdAt: isoHoursAgo(5),
      },
      {
        id: 'ride-105',
        driverId: 'usr-aarav',
        source: 'Marwadi University Main Gate',
        destination: 'Kalawad Road',
        date: yesterday,
        time: '18:00',
        totalSeats: 3,
        availableSeats: 1,
        farePerSeat: 55,
        notes: 'Completed evening return trip.',
        status: 'completed',
        createdAt: isoHoursAgo(60),
      },
      {
        id: 'ride-106',
        driverId: 'usr-sana',
        source: 'Morbi',
        destination: 'Marwadi University Main Gate',
        date: lastWeek,
        time: '07:45',
        totalSeats: 3,
        availableSeats: 2,
        farePerSeat: 90,
        notes: 'Monday morning highway pickup.',
        status: 'completed',
        createdAt: isoHoursAgo(130),
      },
    ],
    requests: [
      {
        id: 'req-201',
        rideId: 'ride-101',
        riderId: 'usr-maya',
        seatsRequested: 1,
        pickupNote: 'Waiting near Nageshwar City entry gate.',
        status: 'accepted',
        createdAt: isoHoursAgo(12),
        updatedAt: isoHoursAgo(11),
      },
      {
        id: 'req-202',
        rideId: 'ride-101',
        riderId: 'usr-sana',
        seatsRequested: 1,
        pickupNote: 'Can meet near Galaxy Hostel turn.',
        status: 'pending',
        createdAt: isoHoursAgo(4),
        updatedAt: isoHoursAgo(4),
      },
      {
        id: 'req-203',
        rideId: 'ride-102',
        riderId: 'usr-maya',
        seatsRequested: 1,
        pickupNote: 'Will bring one small cabin bag.',
        status: 'pending',
        createdAt: isoHoursAgo(3),
        updatedAt: isoHoursAgo(3),
      },
      {
        id: 'req-204',
        rideId: 'ride-102',
        riderId: 'usr-aarav',
        seatsRequested: 1,
        pickupNote: 'Catching the 6:15 PM train from Rajkot Railway Station.',
        status: 'accepted',
        createdAt: isoHoursAgo(9),
        updatedAt: isoHoursAgo(8),
      },
      {
        id: 'req-205',
        rideId: 'ride-105',
        riderId: 'usr-maya',
        seatsRequested: 2,
        pickupNote: 'Sharing ride with lab partner.',
        status: 'accepted',
        createdAt: isoHoursAgo(56),
        updatedAt: isoHoursAgo(54),
      },
      {
        id: 'req-206',
        rideId: 'ride-104',
        riderId: 'usr-maya',
        seatsRequested: 1,
        pickupNote: 'Cancelled after schedule change.',
        status: 'cancelled',
        createdAt: isoHoursAgo(4),
        updatedAt: isoHoursAgo(2),
      },
      {
        id: 'req-207',
        rideId: 'ride-106',
        riderId: 'usr-aarav',
        seatsRequested: 1,
        pickupNote: 'Morbi bypass pickup.',
        status: 'rejected',
        createdAt: isoHoursAgo(126),
        updatedAt: isoHoursAgo(124),
      },
    ],
    notifications: [
      {
        id: 'notif-301',
        userId: 'usr-aarav',
        type: 'request_received',
        title: 'New Seat Request',
        message: 'Sana Khan requested 1 seat for Nageshwar City → Marwadi University Main Gate.',
        targetPage: 'my-rides',
        isRead: false,
        createdAt: isoHoursAgo(4),
      },
      {
        id: 'notif-302',
        userId: 'usr-aarav',
        type: 'request_accepted',
        title: 'Request Accepted',
        message: 'Rohan Deshmukh accepted your seat request to Rajkot Railway Station. Contact info is now unlocked.',
        targetPage: 'my-requests',
        isRead: false,
        createdAt: isoHoursAgo(8),
      },
      {
        id: 'notif-303',
        userId: 'usr-maya',
        type: 'request_accepted',
        title: 'Ride Confirmed',
        message: 'Aarav Mehta accepted your 1 seat request to Marwadi University Main Gate.',
        targetPage: 'my-requests',
        isRead: false,
        createdAt: isoHoursAgo(11),
      },
      {
        id: 'notif-304',
        userId: 'usr-rohan',
        type: 'request_received',
        title: 'New Seat Request',
        message: 'Maya Patel requested 1 seat for Hostel C → Rajkot Railway Station.',
        targetPage: 'my-rides',
        isRead: false,
        createdAt: isoHoursAgo(3),
      },
    ],
    reports: [
      {
        id: 'rep-401',
        reporterId: 'usr-maya',
        reporterName: 'Maya Patel',
        targetRideId: 'ride-104',
        targetRideSummary: 'RCP Apartments → Rajkot Airport',
        targetUserId: 'usr-rohan',
        targetUserName: 'Rohan Deshmukh',
        reason: 'Pickup point clarification',
        details: 'Pickup landmark near RCP Apartments main gate was slightly unclear in the ride notes; requesting clearer gate labeling.',
        status: 'open',
        createdAt: isoHoursAgo(6),
      },
    ],
  };
}
