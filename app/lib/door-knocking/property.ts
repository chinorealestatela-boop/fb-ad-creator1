import type { PropertyOwnerInfo } from './types';

// Server-side property lookup: called via /api/door-knocking/property-lookup
export async function fetchPropertyOwnerInfo(
  address: string,
  lat?: number,
  lng?: number
): Promise<PropertyOwnerInfo> {
  const params = new URLSearchParams({ address });
  if (lat !== undefined) params.set('lat', String(lat));
  if (lng !== undefined) params.set('lng', String(lng));

  const res = await fetch(`/api/door-knocking/property-lookup?${params}`);
  if (!res.ok) throw new Error('Property lookup failed');
  return res.json();
}
