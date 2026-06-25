import { NextRequest, NextResponse } from 'next/server';
import type { PropertyOwnerInfo } from '@/app/lib/door-knocking/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  // Try ATTOM Data API if key is configured
  const attomKey = process.env.ATTOM_API_KEY;
  if (attomKey) {
    try {
      const result = await lookupAttom(address, attomKey);
      if (result) return NextResponse.json(result);
    } catch {
      // fall through to next provider
    }
  }

  // Try Estated API if key is configured
  const estatedKey = process.env.ESTATED_API_KEY;
  if (estatedKey && lat && lng) {
    try {
      const result = await lookupEstated(parseFloat(lat), parseFloat(lng), estatedKey);
      if (result) return NextResponse.json(result);
    } catch {
      // fall through
    }
  }

  // Try RentCast API if key is configured
  const rentcastKey = process.env.RENTCAST_API_KEY;
  if (rentcastKey) {
    try {
      const result = await lookupRentcast(address, rentcastKey);
      if (result) return NextResponse.json(result);
    } catch {
      // fall through
    }
  }

  // No provider configured — return unavailable response
  const fallback: PropertyOwnerInfo = {
    currentOwnerName: 'Unavailable',
    previousOwners: [],
    loading: false,
    error: 'No property data provider configured. Set ATTOM_API_KEY, ESTATED_API_KEY, or RENTCAST_API_KEY.',
  };
  return NextResponse.json(fallback);
}

async function lookupAttom(address: string, apiKey: string): Promise<PropertyOwnerInfo | null> {
  const url = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/expandedprofile?address=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { apikey: apiKey, accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();

  const prop = data?.property?.[0];
  if (!prop) return null;

  const owner = prop.owner;
  const currentOwnerName = [owner?.owner1?.lastname, owner?.owner1?.firstname]
    .filter(Boolean)
    .join(', ') || 'Unknown';

  const deedYear = prop.sale?.saleshistory?.[0]?.salerecdate
    ? new Date(prop.sale.saleshistory[0].salerecdate).getFullYear()
    : undefined;

  const previousOwners: string[] = (prop.sale?.saleshistory || [])
    .slice(1, 4)
    .map((h: { sellerName?: string }) => h.sellerName)
    .filter(Boolean);

  return { currentOwnerName, currentDeedYear: deedYear, previousOwners, loading: false };
}

async function lookupEstated(lat: number, lng: number, apiKey: string): Promise<PropertyOwnerInfo | null> {
  const url = `https://sandbox.estated.com/v4/property?token=${apiKey}&latitude=${lat}&longitude=${lng}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();

  const owner = data?.data?.owner;
  if (!owner) return null;

  const currentOwnerName = owner.name || [owner.last_name, owner.first_name].filter(Boolean).join(', ') || 'Unknown';
  const deedYear = owner.ownership_start_date
    ? new Date(owner.ownership_start_date).getFullYear()
    : undefined;

  return {
    currentOwnerName,
    currentDeedYear: deedYear,
    previousOwners: [],
    loading: false,
  };
}

async function lookupRentcast(address: string, apiKey: string): Promise<PropertyOwnerInfo | null> {
  const url = `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}&limit=1`;
  const res = await fetch(url, {
    headers: { 'X-Api-Key': apiKey, accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();

  const prop = Array.isArray(data) ? data[0] : data?.properties?.[0];
  if (!prop) return null;

  const currentOwnerName = prop.ownerNames?.join(' & ') || 'Unknown';
  const deedYear = prop.lastSaleDate
    ? new Date(prop.lastSaleDate).getFullYear()
    : undefined;

  return {
    currentOwnerName,
    currentDeedYear: deedYear,
    previousOwners: [],
    loading: false,
  };
}
