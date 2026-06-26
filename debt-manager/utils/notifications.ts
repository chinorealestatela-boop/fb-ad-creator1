import * as Notifications from 'expo-notifications';
import { Bill } from '../store/types';
import { parseISO, addDays, differenceInDays } from './dateUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleRemindersForBill(bill: Bill, reminderDays: number[] = [7, 3, 1]): Promise<string[]> {
  const granted = await requestNotificationPermissions();
  if (!granted) return [];

  // Cancel existing notifications for this bill
  await cancelRemindersForBill(bill.id);

  const ids: string[] = [];
  const dueDate = parseISO(bill.nextDueDate);
  const today = new Date();

  for (const daysAhead of reminderDays) {
    const reminderDate = addDays(dueDate, -daysAhead);
    if (reminderDate <= today) continue;

    reminderDate.setHours(9, 0, 0, 0);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: daysAhead === 0 ? `${bill.name} is due TODAY` : `${bill.name} due in ${daysAhead} day${daysAhead !== 1 ? 's' : ''}`,
        body: `Payment of $${(bill.currentPayment || bill.amount).toFixed(2)} is ${daysAhead === 0 ? 'due today' : `due on ${dueDate.toLocaleDateString()}`}`,
        data: { billId: bill.id, type: 'reminder' },
        sound: true,
      },
      trigger: {
        date: reminderDate,
      },
    });
    ids.push(id);
  }

  return ids;
}

export async function cancelRemindersForBill(billId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(n => n.content.data?.billId === billId);
  await Promise.all(toCancel.map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function scheduleAllBillReminders(bills: Bill[], reminderDays: number[]): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Promise.all(
    bills
      .filter(b => b.status !== 'paid')
      .map(b => scheduleRemindersForBill(b, reminderDays))
  );
}

export async function sendImmediateAlert(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}
