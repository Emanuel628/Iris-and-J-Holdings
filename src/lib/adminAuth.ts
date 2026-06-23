export type AdminUser = {
  email: string;
  name?: string;
  createdAt: string;
};

export type DashboardSummary = {
  rentals: number;
  blockedDates: number;
  vacationBookings: number;
  notaryRequests: number;
};

export type RentalRecord = {
  id: number;
  slug: string;
  title: string;
  location_label: string;
  description: string;
  nightly_rate_cents: number;
  cleaning_fee_cents: number;
  max_guests: number;
  hero_image_url: string;
  hero_image_captions: string[];
  gallery_image_urls: string[];
  gallery_image_captions: string[];
  gallery_image_groups: string[];
  amenities: string[];
  is_active: boolean;
  updated_at: string;
};

export type BlockedDateRecord = {
  id: number;
  rental_id: number;
  rental_title: string;
  start_date: string;
  end_date: string;
  reason: string;
};

export type SiteContentRecord = {
  id: number;
  page_key: string;
  title: string;
  body: string;
  hero_image_url: string;
  updated_at: string;
};

export type VacationBookingRecord = {
  id: number;
  stripe_session_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_count: number;
  guest_list_text: string;
  check_in: string;
  check_out: string;
  amount_total_cents: number;
  currency: string;
  status: string;
  created_at: string;
  rental_title?: string;
};

export type NotaryRequestRecord = {
  id: number;
  stripe_session_id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  appointment_date: string;
  appointment_time: string;
  document_type: string;
  notes: string;
  amount_total_cents: number;
  currency: string;
  status: string;
  created_at: string;
};

export type AdminInvoiceRecord = {
  id: number;
  service_type: 'vacation' | 'notary';
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  description: string;
  notes: string;
  amount_total_cents: number;
  currency: string;
  status: string;
  rental_id: number | null;
  rental_title?: string;
  check_in: string | null;
  check_out: string | null;
  guest_count: number;
  guest_list_text: string;
  appointment_date: string | null;
  appointment_time: string;
  city: string;
  document_type: string;
  stripe_session_id: string;
  stripe_checkout_url: string;
  vacation_booking_id: number | null;
  notary_request_id: number | null;
  created_at: string;
  updated_at: string;
};

export type BuyerLeadRecord = {
  id: number;
  client_name: string;
  email: string;
  phone: string;
  target_areas: string;
  budget_min: number;
  budget_max: number;
  timeline: string;
  financing_status: string;
  approval_status: string;
  notes: string;
  created_at: string;
};

export type SellerLeadRecord = {
  id: number;
  client_name: string;
  email: string;
  phone: string;
  property_address: string;
  target_price: number;
  timeline: string;
  occupancy_status: string;
  notes: string;
  created_at: string;
};

export type NewsletterSubscriberRecord = {
  id: number;
  full_name: string;
  email: string;
  source: string;
  status: 'active' | 'unsubscribed';
  created_at: string;
  updated_at: string;
};

export type AdminNotificationRecord = {
  newCount: number;
  latestCreatedAt: string;
};

export type AdminNotificationsPayload = {
  bookings: AdminNotificationRecord;
  vacation: AdminNotificationRecord;
  notary: AdminNotificationRecord;
  updatedAt: string;
};

export type AdminSettingsPayload = {
  settings: Record<string, string>;
  status: {
    databaseConfigured: boolean;
    stripeConfigured: boolean;
    resendConfigured: boolean;
    rentcastConfigured: boolean;
  };
  rentcastUsage: {
    monthlyLimit: number;
    usedThisMonth: number;
    remainingThisMonth: number;
    resetsOn: string;
    overageCostPerHitUsd: number;
  };
};

export type HomeValueEstimateRecord = {
  id: number;
  client_name: string;
  subject_address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  estimated_value: number;
  low_range: number;
  high_range: number;
  result_json: string;
  created_at: string;
};

export async function fetchAdminMe() {
  const res = await fetch('/api/admin/me', {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });

  if (!res.ok) {
    return null;
  }

  return res.json() as Promise<{ user: AdminUser }>;
}

async function fetchJson<T>(url: string) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  });
  if (!res.ok) {
    throw new Error('Request failed.');
  }
  return res.json() as Promise<T>;
}

export function fetchAdminDashboard() {
  return fetchJson<{ admin: AdminUser; summary: DashboardSummary; siteContent: SiteContentRecord[] }>('/api/admin/dashboard');
}

export function fetchAdminRentals() {
  return fetchJson<{ rentals: RentalRecord[] }>('/api/admin/rentals');
}

export function fetchAdminBlockedDates() {
  return fetchJson<{ blockedDates: BlockedDateRecord[] }>('/api/admin/blocked-dates');
}

export function fetchAdminSiteContent() {
  return fetchJson<{ entries: SiteContentRecord[] }>('/api/admin/site-content');
}

export function fetchAdminVacationBookings() {
  return fetchJson<{ bookings: VacationBookingRecord[] }>('/api/admin/vacation-bookings');
}

export function fetchAdminNotaryRequests() {
  return fetchJson<{ requests: NotaryRequestRecord[] }>('/api/admin/notary-requests');
}

export function fetchAdminInvoices() {
  return fetchJson<{ invoices: AdminInvoiceRecord[] }>('/api/admin/invoices');
}

export function fetchAdminBuyerLeads() {
  return fetchJson<{ leads: BuyerLeadRecord[] }>('/api/admin/buyer-leads');
}

export function fetchAdminSellerLeads() {
  return fetchJson<{ leads: SellerLeadRecord[] }>('/api/admin/seller-leads');
}

export function fetchAdminNewsletterSubscribers() {
  return fetchJson<{ subscribers: NewsletterSubscriberRecord[] }>('/api/admin/newsletter-subscribers');
}

export function fetchAdminNotifications() {
  return fetchJson<AdminNotificationsPayload>('/api/admin/notifications');
}

export function fetchAdminSettings() {
  return fetchJson<AdminSettingsPayload>('/api/admin/settings');
}

export function fetchAdminHomeValueEstimates() {
  return fetchJson<{ estimates: HomeValueEstimateRecord[] }>('/api/admin/home-value-estimates');
}

