import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'DoorKnockingCRM/1.0',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 });
  }

  const data = await res.json();
  const addr = data.address || {};

  const houseNumber = addr.house_number || '';
  const road = addr.road || addr.pedestrian || addr.path || '';
  const streetAddress = [houseNumber, road].filter(Boolean).join(' ');

  return NextResponse.json({
    address: streetAddress || data.display_name,
    neighborhood: addr.neighbourhood || addr.suburb || '',
    city: addr.city || addr.town || addr.village || addr.county || '',
    state: addr.state || '',
    zipCode: addr.postcode || '',
    displayName: data.display_name,
  });
}
