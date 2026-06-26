export type LeadStatus =
  | 'new'
  | 'no_answer'
  | 'follow_up'
  | 'interested'
  | 'appointment_set'
  | 'not_interested'
  | 'listing_signed';

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  no_answer: 'No Answer',
  follow_up: 'Follow Up',
  interested: 'Interested',
  appointment_set: 'Appointment Set',
  not_interested: 'Not Interested',
  listing_signed: 'Listing Signed',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#9ca3af',
  no_answer: '#6b7280',
  follow_up: '#eab308',
  interested: '#3b82f6',
  appointment_set: '#22c55e',
  not_interested: '#ef4444',
  listing_signed: '#a855f7',
};

export interface GpsCoordinates {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface PropertyOwnerInfo {
  currentOwnerName: string;
  currentDeedYear?: number;
  previousOwners: string[];
  loading: boolean;
  error?: string;
}

export interface Lead {
  id?: number;
  address: string;
  lat: number;
  lng: number;
  status: LeadStatus;
  ownerName?: string;
  deedYear?: number;
  previousOwners?: string[];
  notes?: string;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  followUpDate?: string;
  lastVisitDate?: string;
  visitCount: number;
  photos?: string[];
  neighborhood?: string;
  city?: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export interface Visit {
  id?: number;
  leadId: number;
  timestamp: number;
  lat: number;
  lng: number;
  notes?: string;
  statusBefore?: LeadStatus;
  statusAfter?: LeadStatus;
}

export type ActivityType =
  | 'visit'
  | 'note'
  | 'photo'
  | 'status_change'
  | 'follow_up_set'
  | 'follow_up_completed'
  | 'call'
  | 'text'
  | 'email'
  | 'appointment';

export type FollowUpType = 'follow_up' | 'appointment';

export type OutcomeType =
  | 'not_home'
  | 'reschedule'
  | 'schedule_follow_up'
  | 'appointment_set'
  | 'sold'
  | 'not_interested'
  | 'left_information'
  | 'callback_requested'
  | 'other';

export const OUTCOME_LABELS: Record<OutcomeType, string> = {
  not_home: 'Not Home',
  reschedule: 'Reschedule',
  schedule_follow_up: 'Schedule Follow-Up',
  appointment_set: 'Appointment Set',
  sold: 'Sold',
  not_interested: 'Not Interested',
  left_information: 'Left Information',
  callback_requested: 'Requested Callback',
  other: 'Other',
};

export const OUTCOME_ICONS: Record<OutcomeType, string> = {
  not_home: '🚫',
  reschedule: '🔄',
  schedule_follow_up: '📅',
  appointment_set: '🗓️',
  sold: '🎉',
  not_interested: '👎',
  left_information: '📋',
  callback_requested: '📞',
  other: '📝',
};

export interface FollowUp {
  id?: number;
  leadId: number;
  leadAddress?: string;
  type: FollowUpType;
  scheduledAt: string; // ISO datetime "2025-06-20T14:30"
  notes?: string;
  completed: boolean;
  completedAt?: string;
  outcome?: OutcomeType;
  outcomeNotes?: string;
  createdAt: number;
}

export interface Activity {
  id?: number;
  leadId: number;
  type: ActivityType;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface NearbyLead {
  lead: Lead;
  distanceFt: number;
  distanceMi: number;
}

export interface RouteStop {
  lead: Lead;
  distanceFt: number;
  estimatedWalkSeconds: number;
  order: number;
}

export type RadiusOption = 250 | 500 | 1320 | 2640 | 5280; // feet

export const RADIUS_LABELS: Record<RadiusOption, string> = {
  250: '250 ft',
  500: '500 ft',
  1320: '0.25 mi',
  2640: '0.5 mi',
  5280: '1 mi',
};
