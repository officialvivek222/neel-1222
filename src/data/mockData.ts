import { BusinessSettings, FeedbackItem, PerformanceStats } from '../types';

export const initialBusinessSettings: BusinessSettings = {
  businessName: 'Neel Hair',
  tagline: 'Hair • Style • Grooming',
  category: 'Hair Salon / Barber Shop',
  contactNumber: '+91 87674 70988',
  businessAddress: 'Ozar, Nashik, Maharashtra',
  logoUrl: '',
  googleReviewUrl: '',
  googleReviewLink: '',
  showGoogleReviewButton: true,
  showFeedbackForm: true,
  qrDestinationUrl: typeof window !== 'undefined' ? window.location.origin : 'https://reviewtap.in/neel-hair',
  qrStyle: 'classic',
  centerLogoUrl: '',
  ownerId: null,
  ownerEmail: null
};

// Clean Production Slate: 0 test/demo feedback items
export const initialFeedbackList: FeedbackItem[] = [];

// Clean Production Slate: 0 test/dummy analytics metrics
export const initialPerformanceStats: PerformanceStats = {
  totalScans: 0,
  scansGrowth: 0,
  googleClicks: 0,
  clicksGrowth: 0,
  feedbackReceived: 0,
  feedbackGrowth: 0,
  averageRating: 0.0,
  resolvedCount: 0,
  fiveStarCount: 0,
  fiveStarGrowth: 0,
  ratingBreakdown: [
    { stars: 5, percentage: 0, count: 0 },
    { stars: 4, percentage: 0, count: 0 },
    { stars: 3, percentage: 0, count: 0 },
    { stars: 2, percentage: 0, count: 0 },
    { stars: 1, percentage: 0, count: 0 },
  ],
  activityData: []
};

export const salonServicesList = [
  'Haircut',
  'Beard Trim',
  'Hair Styling',
  'Hair Color',
  'Facial & Spa',
  'Head Massage',
  'Groom Package',
  'Hair Treatment / Spa'
];
