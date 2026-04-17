export interface WeddingFunction {
  id: string;
  date: string;
  name: string;
  time: string;
  services: string[];
}

export interface PaymentStep {
  id: string;
  date: string;
  step: string;
  amount: number;
  status: 'Pending' | 'Completed';
}

export interface QuotationData {
  id: string;
  clientName: string;
  finalAmount: number;
  preWeddingDeliverables: string[];
  functions: WeddingFunction[];
  finalDeliverables: string[];
  paymentSchedule: PaymentStep[];
  termsPhotoshoot: string[];
  termsDeliverables: string[];
  termsAlbum: string[];
  lastModified?: string;
}

export const BLANK_QUOTATION: QuotationData = {
  id: '',
  clientName: 'BRIDE & GROOM NAME',
  finalAmount: 150000,
  preWeddingDeliverables: [
    'All High-Res Edited Pictures',
    '3-4 Minute Cinematic Pre-wedding Film',
    'One 12x18 Inch Frame'
  ],
  functions: [
    {
      id: 'f1',
      date: '24th FEB 2026',
      name: 'HALDI & MEHNDI',
      time: '10:00 AM onwards',
      services: ['Candid Photography', 'Traditional Cinematography']
    }
  ],
  finalDeliverables: [
    'Complete Raw Data of all events',
    'Cinematic Highlight Film (4-6 min)',
    'Traditional Full-Length Film',
    'Premium Coffee Table Album (12x36)'
  ],
  paymentSchedule: [
    { id: 'p1', date: 'At Booking', step: 'Advance Payment', amount: 50000, status: 'Pending' },
    { id: 'p2', date: 'On Event Day', step: 'Second Installment', amount: 75000, status: 'Pending' },
    { id: 'p3', date: 'At Delivery', step: 'Balance Payment', amount: 25000, status: 'Pending' }
  ],
  termsPhotoshoot: [
    'Booking amount is non-refundable.',
    '40% payment before the wedding dates.',
    'Accommodation & Travel outside city by client.'
  ],
  termsDeliverables: [
    'Raw photos provided in 1 week.',
    'Edited cinematic film takes 4-6 weeks.',
    'Standard editing included.'
  ],
  termsAlbum: [
    'Selection to be done by client.',
    'Delivery in 1 month post selection.',
    'One round of revision in design.'
  ]
};
