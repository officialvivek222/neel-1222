export type FeedbackStatus = 'resolved' | 'pending';

export interface FeedbackItem {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  service: string;
  feedbackText: string;
  createdAt: string; // ISO date string or formatted date
  status: FeedbackStatus;
  customerAvatar?: string;
  phone?: string;
}

export type QRStyle = 'classic' | 'dots' | 'rounded' | 'circle';

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  category: string;
  contactNumber: string;
  businessAddress: string;
  logoUrl: string;
  googleReviewUrl?: string; // Official Google Review URL field
  googleReviewLink: string;  // Maintained for backward compatibility
  showGoogleReviewButton: boolean;
  showFeedbackForm: boolean;
  qrDestinationUrl: string;
  qrStyle: QRStyle;
  centerLogoUrl: string;
  ownerId?: string | null;
  ownerEmail?: string | null;
}

export interface ActivityPoint {
  date: string;
  qrScans: number;
  googleClicks: number;
}

export interface RatingBreakdown {
  stars: number;
  percentage: number;
  count: number;
}

export interface PerformanceStats {
  totalScans: number;
  scansGrowth: number;
  googleClicks: number;
  clicksGrowth: number;
  feedbackReceived: number;
  feedbackGrowth: number;
  averageRating: number;
  resolvedCount: number;
  fiveStarCount: number;
  fiveStarGrowth: number;
  ratingBreakdown: RatingBreakdown[];
  activityData: ActivityPoint[];
}

export type AdminTab = 'dashboard' | 'feedback' | 'google-reviews' | 'qr-code' | 'enquiries' | 'settings' | 'admins';

export type EnquiryStatus = 'new' | 'quoted' | 'completed' | 'cancelled';

export interface CustomerEnquiry {
  id: string;
  businessId?: string;
  customerName: string;
  phone: string;
  service: string;
  message?: string;
  status: EnquiryStatus;
  quotationAmount: number;
  discountAmount: number;
  finalAmount: number;
  notes?: string;
  quotedAt?: string;
  createdAt: string;
}

export type AdminRole = 'owner' | 'admin';

export type AdminStatus = 'active' | 'deactivated' | 'pending';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  invitedBy?: string;
  isOwner?: boolean;
}

export interface AdminInvitation {
  id: string;
  email: string;
  fullName?: string;
  role: AdminRole;
  status: 'pending' | 'accepted' | 'revoked';
  invitedBy?: string;
  createdAt: string;
  expiresAt: string;
}

export type AppLanguage = 'EN' | 'HI' | 'MR';
