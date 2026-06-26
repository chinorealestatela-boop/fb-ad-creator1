import * as Calendar from 'expo-calendar';
import { Bill } from '../store/types';
import { parseISO, addDays } from './dateUtils';

export async function requestCalendarPermissions(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

export async function getOrCreateDebtManagerCalendar(): Promise<string | null> {
  const granted = await requestCalendarPermissions();
  if (!granted) return null;

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find(c => c.title === 'DebtManager');
  if (existing) return existing.id;

  const defaultCalendar = calendars.find(c => c.allowsModifications && c.type === 'local');

  const calendarId = await Calendar.createCalendarAsync({
    title: 'DebtManager',
    color: '#6C63FF',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendar?.source?.id,
    source: defaultCalendar?.source || { isLocalAccount: true, name: 'DebtManager', type: 'local' },
    name: 'DebtManager',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });

  return calendarId;
}

export async function createCalendarEventsForBill(
  bill: Bill,
  calendarId: string,
  reminderDays: number[] = [7, 3, 1]
): Promise<string[]> {
  const granted = await requestCalendarPermissions();
  if (!granted) return [];

  const dueDate = parseISO(bill.nextDueDate);
  const ids: string[] = [];

  for (const daysAhead of reminderDays) {
    const eventDate = addDays(dueDate, -daysAhead);
    eventDate.setHours(9, 0, 0, 0);
    const endDate = new Date(eventDate.getTime() + 30 * 60 * 1000);

    const title = daysAhead === 0
      ? `PAY NOW: ${bill.name} due today`
      : `Reminder: ${bill.name} due in ${daysAhead} day${daysAhead !== 1 ? 's' : ''}`;

    const id = await Calendar.createEventAsync(calendarId, {
      title,
      startDate: eventDate,
      endDate,
      notes: `Bill: ${bill.name}\nAmount: $${(bill.currentPayment || bill.amount).toFixed(2)}\nDue: ${dueDate.toLocaleDateString()}\n\nManaged by DebtManager app`,
      alarms: [{ relativeOffset: -30 }],
    });
    ids.push(id);
  }

  // Add the actual due date event
  const dueDateEvent = new Date(dueDate);
  dueDateEvent.setHours(8, 0, 0, 0);
  const id = await Calendar.createEventAsync(calendarId, {
    title: `DUE: ${bill.name} — $${(bill.currentPayment || bill.amount).toFixed(2)}`,
    startDate: dueDateEvent,
    endDate: new Date(dueDateEvent.getTime() + 60 * 60 * 1000),
    notes: `Bill payment due today\nAmount: $${(bill.currentPayment || bill.amount).toFixed(2)}`,
    alarms: [{ relativeOffset: 0 }, { relativeOffset: -60 }],
  });
  ids.push(id);

  return ids;
}

export async function deleteCalendarEvents(eventIds: string[]): Promise<void> {
  await Promise.all(
    eventIds.map(id =>
      Calendar.deleteEventAsync(id).catch(() => {})
    )
  );
}
