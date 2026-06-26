import Dexie, { Table } from 'dexie';
import type { Lead, Visit, Activity, FollowUp } from './types';

class DoorKnockingDB extends Dexie {
  leads!: Table<Lead, number>;
  visits!: Table<Visit, number>;
  activities!: Table<Activity, number>;
  followUps!: Table<FollowUp, number>;

  constructor() {
    super('DoorKnockingCRM');
    this.version(1).stores({
      leads: '++id, address, lat, lng, status, city, neighborhood, lastVisitDate, followUpDate, createdAt, updatedAt, synced',
      visits: '++id, leadId, timestamp',
      activities: '++id, leadId, type, timestamp',
    });
    // Version 2: adds followUps table; existing tables unchanged
    this.version(2).stores({
      followUps: '++id, leadId, scheduledAt, completed, type, createdAt',
    });
  }
}

let _db: DoorKnockingDB | null = null;

export function getDb(): DoorKnockingDB {
  if (!_db) _db = new DoorKnockingDB();
  return _db;
}

export async function saveLead(lead: Omit<Lead, 'id'> & { id?: number }): Promise<number> {
  const db = getDb();
  const now = Date.now();
  if (lead.id) {
    await db.leads.update(lead.id, { ...lead, updatedAt: now, synced: false });
    return lead.id;
  }
  return db.leads.add({ ...lead, createdAt: now, updatedAt: now, synced: false });
}

export async function getLead(id: number): Promise<Lead | undefined> {
  return getDb().leads.get(id);
}

export async function getAllLeads(): Promise<Lead[]> {
  return getDb().leads.toArray();
}

export async function getLeadsNear(
  lat: number,
  lng: number,
  radiusFt: number
): Promise<Lead[]> {
  const radiusDeg = radiusFt / 364000; // rough ft-to-degrees
  const all = await getDb().leads
    .where('lat').between(lat - radiusDeg, lat + radiusDeg)
    .toArray();
  // Filter more precisely using haversine
  return all.filter((l) => haversineDistanceFt(lat, lng, l.lat, l.lng) <= radiusFt);
}

export async function recordVisit(visit: Omit<Visit, 'id'>): Promise<number> {
  return getDb().visits.add(visit);
}

export async function getVisitsByLead(leadId: number): Promise<Visit[]> {
  return getDb().visits.where('leadId').equals(leadId).sortBy('timestamp');
}

export async function addActivity(activity: Omit<Activity, 'id'>): Promise<number> {
  return getDb().activities.add(activity);
}

export async function getActivitiesByLead(leadId: number): Promise<Activity[]> {
  return getDb().activities.where('leadId').equals(leadId).sortBy('timestamp');
}

export async function deleteLead(id: number): Promise<void> {
  const db = getDb();
  await Promise.all([
    db.leads.delete(id),
    db.visits.where('leadId').equals(id).delete(),
    db.activities.where('leadId').equals(id).delete(),
    db.followUps.where('leadId').equals(id).delete(),
  ]);
}

// ── Follow-Up helpers ─────────────────────────────────────────

export async function saveFollowUp(fu: Omit<FollowUp, 'id'> & { id?: number }): Promise<number> {
  const db = getDb();
  const now = Date.now();
  if (fu.id) {
    await db.followUps.update(fu.id, fu);
    return fu.id;
  }
  return db.followUps.add({ ...fu, createdAt: fu.createdAt ?? now });
}

export async function getFollowUp(id: number): Promise<FollowUp | undefined> {
  return getDb().followUps.get(id);
}

export async function getFollowUpsByLead(leadId: number): Promise<FollowUp[]> {
  return getDb().followUps
    .where('leadId').equals(leadId)
    .sortBy('scheduledAt');
}

export async function getAllPendingFollowUps(): Promise<FollowUp[]> {
  const all = await getDb().followUps
    .where('completed').equals(0)
    .sortBy('scheduledAt');
  return all;
}

export async function markFollowUpComplete(
  id: number,
  outcome: import('./types').OutcomeType,
  outcomeNotes?: string
): Promise<void> {
  await getDb().followUps.update(id, {
    completed: true,
    completedAt: new Date().toISOString(),
    outcome,
    outcomeNotes,
  });
}

export function haversineDistanceFt(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 20902231; // Earth radius in feet
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
