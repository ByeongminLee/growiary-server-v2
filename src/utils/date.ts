import { Timestamp } from 'firebase-admin/firestore';

export default function toDate(date: Date | Timestamp | string): Date {
  if (date instanceof Date) {
    return date;
  } else if (typeof date === 'string') {
    return new Date(date);
  } else {
    return date.toDate();
  }
}
