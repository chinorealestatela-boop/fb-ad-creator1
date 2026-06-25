export interface GeocodeResult {
  address: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Nominatim (OpenStreetMap) reverse geocoding — free, no key required
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodeResult> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  });

  if (!res.ok) throw new Error('Geocoding request failed');

  const data = await res.json();
  const addr = data.address || {};

  const houseNumber = addr.house_number || '';
  const road = addr.road || addr.pedestrian || addr.path || '';
  const streetAddress = [houseNumber, road].filter(Boolean).join(' ');

  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.county ||
    '';

  const neighborhood =
    addr.neighbourhood ||
    addr.suburb ||
    addr.quarter ||
    '';

  return {
    address: streetAddress || data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    neighborhood,
    city,
    state: addr.state || '',
    zipCode: addr.postcode || '',
    country: addr.country_code?.toUpperCase() || '',
  };
}

// Geocode address → coordinates (for manual search)
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;

  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}
