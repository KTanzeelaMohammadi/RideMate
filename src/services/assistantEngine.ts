import { dataService } from './dataService';

export interface AssistantReply {
  answer: string;
  suggestedTopic?: string;
}

interface RuleEntry {
  id: string;
  keywords: string[];
  response: () => string;
}

export const ASSISTANT_TOPICS = [
  'How do I offer a ride?',
  'How do seat requests work?',
  'What do request statuses mean?',
  'How does fare sharing work?',
  'Campus safety guidelines',
  'Check my current rides & requests',
];

export function getRuleBasedAssistantReply(
  query: string,
  currentUserId: string
): AssistantReply {
  const q = query.trim().toLowerCase();

  if (!q) {
    return {
      answer:
        'Please type a question or pick one of the topic shortcuts above. I am a rule-based guide for RideMate policies and workflows.',
    };
  }

  const rules: RuleEntry[] = [
    {
      id: 'my-summary',
      keywords: ['my', 'summary', 'current', 'check', 'count', 'how many', 'mine'],
      response: () => {
        const stats = dataService.getUserCountsForAssistant(currentUserId);
        return `Here is your live account summary:\n• Open rides you are offering: ${stats.openOffered}\n• Incoming pending requests to review: ${stats.pendingIncoming}\n• Your pending outgoing seat requests: ${stats.pendingOutgoing}\n• Your confirmed (accepted) rides as a passenger: ${stats.acceptedOutgoing}\n\nYou can manage your listings in My Rides or track seat confirmations in My Requests.`;
      },
    },
    {
      id: 'offer-ride',
      keywords: ['offer', 'post', 'publish', 'create', 'driver', 'seats', '1-6', '1–6', 'list'],
      response: () =>
        'To offer a ride, open "Offer a Ride" from the navigation menu and fill in Source, Destination, Date, Time, Seats (1–6), and Cost-Sharing Fare per Seat.\n\nValidation rules enforced automatically:\n• Departure date and time must be in the future.\n• Source and destination must be different locations.\n• Seats must be between 1 and 6.\n• Fare per seat cannot be negative.\n\nOnce posted, other students can request seats, and you stay in full control to accept or decline each request in My Rides.',
    },
    {
      id: 'request-seats',
      keywords: ['request', 'find', 'search', 'book', 'join', 'seat', 'duplicate'],
      response: () =>
        'To request a seat:\n1. Go to "Find a Ride" and filter by source, destination, or date.\n2. Pick a matching ride with open seats and select how many seats you need.\n3. Add an optional pickup landmark note and submit.\n\nImportant rules:\n• You cannot request seats on your own ride.\n• You cannot submit duplicate active requests for the same ride.\n• Available seats never drop below zero.',
    },
    {
      id: 'status',
      keywords: ['status', 'pending', 'accepted', 'rejected', 'cancelled', 'decline', 'approve'],
      response: () =>
        'RideMate tracks four request statuses:\n• Pending: Waiting for the driver to review your request.\n• Accepted: Confirmed! Your seats are reserved and the driver\'s phone number is unlocked in My Requests.\n• Rejected: The driver could not accommodate the request.\n• Cancelled: Either you cancelled your request or the driver cancelled the ride. If you cancel an Accepted request on an open ride, your seats are automatically returned to the listing.',
    },
    {
      id: 'fare',
      keywords: ['fare', 'cost', 'price', 'pay', 'payment', 'money', 'split', 'fuel', 'rupee', '₹'],
      response: () =>
        'RideMate is strictly a non-commercial campus cost-sharing tool, not a taxi or payment service.\n• Drivers list an estimated per-seat contribution to split fuel and toll expenses.\n• RideMate does not process online payments or hold funds.\n• Students settle shared fuel costs directly with each other in person or via their preferred method during the commute.',
    },
    {
      id: 'safety',
      keywords: [
        'safety',
        'safe',
        'privacy',
        'phone',
        'contact',
        'number',
        'report',
        'block',
        'emergency',
        'guideline',
      ],
      response: () =>
        'Campus Safety & Privacy Guidelines:\n• Phone Privacy: Student phone numbers stay hidden until a seat request is officially Accepted.\n• Campus Verification: Always check the driver or rider\'s university enrollment number before boarding.\n• Meet in Public: Prefer well-lit campus gates, library plazas, or transit hubs as pickup points.\n• Report Issues: Use the "Report Ride" button on any listing to alert Campus Transport Administrators, who can remove listings or block accounts.',
    },
    {
      id: 'admin',
      keywords: ['admin', 'moderator', 'moderation', 'remove', 'suspend'],
      response: () =>
        'Only accounts with Administrator privileges can open the Admin Dashboard. Administrators oversee total platform users, rides, requests, and safety reports—and can block accounts, remove listings, or resolve reports.',
    },
    {
      id: 'help',
      keywords: ['hello', 'hi', 'hey', 'help', 'what can you do'],
      response: () =>
        'Hello! I am the RideMate Rule-Based Assistant (deterministic keyword guide, not generative AI). Ask me about offering rides, requesting seats, request statuses, fare sharing, privacy rules, or safety guidelines.',
    },
  ];

  let bestRule: RuleEntry | null = null;
  let bestScore = 0;

  for (const rule of rules) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (q.includes(kw)) {
        score += kw.length > 4 ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  if (bestRule && bestScore > 0) {
    return {
      answer: bestRule.response(),
      suggestedTopic: bestRule.id,
    };
  }

  return {
    answer:
      'I did not match a specific topic in my rule base. Try asking about:\n• Offering a ride (seats 1–6, validation)\n• Requesting seats & search\n• Request statuses (Pending, Accepted, Rejected, Cancelled)\n• Fare cost-sharing policy\n• Safety guidelines & phone privacy\n• Checking your current rides & requests',
  };
}
