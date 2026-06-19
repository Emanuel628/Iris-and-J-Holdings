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
  gallery_image_urls: string[];
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
