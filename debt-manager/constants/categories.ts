export type BillCategory =
  | 'subscription'
  | 'bnpl'
  | 'credit-card'
  | 'loan'
  | 'utility'
  | 'insurance'
  | 'medical'
  | 'irs'
  | 'rent-mortgage'
  | 'phone'
  | 'internet'
  | 'food'
  | 'transportation'
  | 'student-loan'
  | 'personal'
  | 'business'
  | 'friend-family'
  | 'other';

export const CATEGORIES: { id: BillCategory; label: string; icon: string }[] = [
  { id: 'subscription', label: 'Subscription', icon: 'refresh-circle' },
  { id: 'bnpl', label: 'Buy Now Pay Later', icon: 'card' },
  { id: 'credit-card', label: 'Credit Card', icon: 'card-outline' },
  { id: 'loan', label: 'Loan', icon: 'cash' },
  { id: 'utility', label: 'Utility', icon: 'flash' },
  { id: 'insurance', label: 'Insurance', icon: 'shield-checkmark' },
  { id: 'medical', label: 'Medical', icon: 'medkit' },
  { id: 'irs', label: 'IRS / Taxes', icon: 'document-text' },
  { id: 'rent-mortgage', label: 'Rent / Mortgage', icon: 'home' },
  { id: 'phone', label: 'Phone', icon: 'phone-portrait' },
  { id: 'internet', label: 'Internet', icon: 'wifi' },
  { id: 'food', label: 'Food', icon: 'fast-food' },
  { id: 'transportation', label: 'Transportation', icon: 'car' },
  { id: 'student-loan', label: 'Student Loan', icon: 'school' },
  { id: 'personal', label: 'Personal Loan', icon: 'person' },
  { id: 'business', label: 'Business', icon: 'business' },
  { id: 'friend-family', label: 'Friend / Family', icon: 'people' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle' },
];
